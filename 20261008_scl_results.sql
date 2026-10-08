-- SCL teacher result-upload + reminder system. Safe to re-run.
create extension if not exists pgcrypto;

-- 1. Cycles -------------------------------------------------------------
create table if not exists public.school_result_cycles (
  id uuid primary key default gen_random_uuid(),
  session text not null,
  term text not null,
  cycle_number int not null check (cycle_number between 1 and 4),
  title text not null,
  start_date date not null,
  due_date date not null,
  test_max_marks int not null default 10,
  exam_max_marks int not null default 0,
  -- admin override: auto = follow the dates, closed = force closed, extended = open until extended_until
  status text not null default 'auto' check (status in ('auto','closed','extended')),
  extended_until date,
  reminder_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (session, term, cycle_number),
  check (due_date >= start_date)
);

-- Effective state, computed from the Africa/Lagos calendar date (never hard-coded).
create or replace view public.school_result_cycles_live as
select c.*,
  (now() at time zone 'Africa/Lagos')::date as lagos_today,
  case
    when c.status = 'closed' then 'closed'
    when (now() at time zone 'Africa/Lagos')::date < c.start_date then 'scheduled'
    when (now() at time zone 'Africa/Lagos')::date <= c.due_date then 'open'
    when c.status = 'extended' and c.extended_until is not null
         and (now() at time zone 'Africa/Lagos')::date <= c.extended_until then 'extended'
    else 'closed'
  end as effective_status,
  case when c.status = 'extended' and c.extended_until is not null
       then greatest(c.due_date, c.extended_until) else c.due_date end as effective_due_date
from public.school_result_cycles c;

insert into public.school_result_cycles
  (session, term, cycle_number, title, start_date, due_date, test_max_marks, exam_max_marks)
values
  ('2026/2027','First Term',1,'Cycle 1 — First Four-Week Test','2026-09-14','2026-10-09',10,0),
  ('2026/2027','First Term',2,'Cycle 2 — Second Four-Week Test','2026-10-12','2026-11-06',10,0),
  ('2026/2027','First Term',3,'Cycle 3 — Third Four-Week Test','2026-11-09','2026-12-04',10,0),
  ('2026/2027','First Term',4,'Cycle 4 — Test and Final Examination','2026-12-07','2026-12-18',10,60)
on conflict (session, term, cycle_number) do nothing;

-- 2. Teacher class assignments (authorises which classes a teacher may submit) --
create table if not exists public.school_teacher_class_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_user_id uuid not null references auth.users(id) on delete cascade,
  class_name text not null,
  created_at timestamptz not null default now(),
  unique (teacher_user_id, class_name)
);

-- 3. Submissions ----------------------------------------------------------
create table if not exists public.school_teacher_result_submissions (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.school_result_cycles(id),
  teacher_user_id uuid not null references auth.users(id),
  teacher_staff_id text not null,
  class_name text not null,
  subjects text[] not null,
  original_file_name text not null,
  storage_path text not null unique,
  file_size bigint,
  mime_type text,
  notes text,
  status text not null default 'submitted'
    check (status in ('submitted','approved','rejected','resubmission_required')),
  uploaded_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  review_note text
);
create index if not exists idx_srs_cycle on public.school_teacher_result_submissions(cycle_id, status);
create index if not exists idx_srs_teacher on public.school_teacher_result_submissions(teacher_user_id, cycle_id);

-- 4. Push subscriptions -----------------------------------------------------
create table if not exists public.school_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  content_encoding text not null default 'aes128gcm',
  active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_sps_user on public.school_push_subscriptions(user_id) where active;

-- 5. Reminder de-duplication log ------------------------------------------
create table if not exists public.school_result_reminder_log (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.school_result_cycles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_key text not null,          -- e.g. T-1, T-0-AM, T-0-PM
  sent_at timestamptz not null default now(),
  unique (cycle_id, user_id, reminder_key)
);

-- 6. Row level security: browsers never touch these tables directly.
-- All access goes through the scl-results-api / scheduler Edge Functions (service role).
alter table public.school_result_cycles enable row level security;
alter table public.school_teacher_class_assignments enable row level security;
alter table public.school_teacher_result_submissions enable row level security;
alter table public.school_push_subscriptions enable row level security;
alter table public.school_result_reminder_log enable row level security;
revoke all on public.school_result_cycles_live from anon, authenticated;
revoke all on public.school_result_cycles, public.school_teacher_class_assignments,
  public.school_teacher_result_submissions, public.school_push_subscriptions,
  public.school_result_reminder_log from anon, authenticated;
-- Teachers may read their own submissions and the cycle list directly (read-only):
drop policy if exists srs_own_read on public.school_teacher_result_submissions;
create policy srs_own_read on public.school_teacher_result_submissions
  for select to authenticated using (teacher_user_id = auth.uid());
grant select on public.school_teacher_result_submissions to authenticated;

-- 7. Private storage bucket ------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('result-uploads','result-uploads', false, 15728640,
        array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
-- No storage.objects policies are created on purpose: only the Edge Function
-- (service role) can write/read; admins receive short-lived signed URLs.

-- 8. Scheduler (pg_cron runs in UTC; Nigeria = UTC+1, so 07:00 WAT = 06:00 UTC).
-- Run ONCE after deploying the function and replacing the two placeholders below.
-- Requires extensions pg_cron and pg_net (Dashboard > Database > Extensions).
-- select cron.schedule('scl-results-reminder-morning', '0 6 * * *',
--   $$ select net.http_post(
--        url := 'https://eypdoeqiojopkbzckjor.supabase.co/functions/v1/scl-results-scheduler',
--        headers := jsonb_build_object('Content-Type','application/json','x-scl-scheduler-secret','<SCHEDULER_SECRET>'),
--        body := '{"slot":"AM"}'::jsonb) $$);
-- select cron.schedule('scl-results-reminder-afternoon', '0 13 * * *',   -- 14:00 WAT
--   $$ select net.http_post(
--        url := 'https://eypdoeqiojopkbzckjor.supabase.co/functions/v1/scl-results-scheduler',
--        headers := jsonb_build_object('Content-Type','application/json','x-scl-scheduler-secret','<SCHEDULER_SECRET>'),
--        body := '{"slot":"PM"}'::jsonb) $$);
