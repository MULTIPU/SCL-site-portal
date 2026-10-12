-- SCL automatic duty allocation. Run once in the Supabase SQL editor.
-- ASSUMPTIONS (verify against your schema before running):
--   staff(id uuid, user_id uuid, full_name, role, employment_status, is_teaching)
--   teacher_teaching_assignments(id, teacher_staff_id, class_name, subject, assignment_type, active,
--                                qualification_note, starts_on, ends_on)
--   user_roles(user_id, role, active)
-- Class/subject placement is NOT stored anywhere I could see, so it comes from staff_placement below.
-- Nothing is invented: no placement or no catalog match => a flag for management, never a guess.

create table if not exists scl_subject_catalog(
  section text not null check (section in ('PRIMARY','JSS','SSS')),
  subject text not null,
  primary key(section, subject));

create table if not exists staff_placement(          -- filled from the approved application / staff management
  staff_id uuid primary key references staff(id),
  level text not null check (level in ('PRIMARY','JSS','SSS','NON_TEACHING','OTHER')),
  class_names text[] not null default '{}',
  subjects text[] not null default '{}',
  department text, duties text[] not null default '{}',
  updated_at timestamptz default now());

create table if not exists staff_assignment_flags(
  id bigserial primary key, staff_id uuid references staff(id),
  class_name text, subject text, reason text not null,
  resolved boolean default false, created_at timestamptz default now());

-- Idempotency: one active row per teacher/class/subject, however often approval repeats.
create unique index if not exists uq_teach_active
  on teacher_teaching_assignments(teacher_staff_id, class_name, subject) where active;

create or replace function scl_section(c text) returns text language sql immutable as $$
  select case when c ~* '^(daycare|nursery|reception|primary)' then 'PRIMARY'
              when c ~* '^jss' then 'JSS' when c ~* '^sss' then 'SSS' end $$;

create or replace function scl_allocate_staff(p_staff uuid) returns void
language plpgsql security definer set search_path=public as $$
declare pl staff_placement; c text; s text; sec text; n int; already boolean;
begin
  select * into pl from staff_placement where staff_id=p_staff;
  if not found then
    insert into staff_assignment_flags(staff_id,reason)
      select p_staff,'No approved level/class/subject placement on record'
      where not exists(select 1 from staff_assignment_flags where staff_id=p_staff and not resolved and reason like 'No approved%');
    return;
  end if;
  if pl.level in ('NON_TEACHING','OTHER') then return; end if;   -- duties/department read from staff_placement
  foreach c in array pl.class_names loop
    sec := scl_section(c);
    if sec is null or sec <> pl.level then
      insert into staff_assignment_flags(staff_id,class_name,reason) values(p_staff,c,'Class does not match approved level'); continue;
    end if;
    if sec='PRIMARY' then
      insert into teacher_teaching_assignments(teacher_staff_id,class_name,subject,assignment_type,active)
      values(p_staff,c,'ALL_SUBJECTS','primary_class_teacher',true) on conflict do nothing;
    else
      foreach s in array pl.subjects loop
        if not exists(select 1 from scl_subject_catalog where section=sec and subject=s) then
          insert into staff_assignment_flags(staff_id,class_name,subject,reason) values(p_staff,c,s,'Subject not in curriculum catalog'); continue;
        end if;
        perform pg_advisory_xact_lock(hashtext(sec||':'||s));      -- serialises concurrent requests per section+subject
        select exists(select 1 from teacher_teaching_assignments where active and teacher_staff_id=p_staff
                      and subject=s and scl_section(class_name)=sec) into already;
        select count(distinct teacher_staff_id) into n from teacher_teaching_assignments
          where active and subject=s and scl_section(class_name)=sec;
        if not already and n>=2 then
          insert into staff_assignment_flags(staff_id,class_name,subject,reason)
          values(p_staff,c,s,sec||' limit of 2 teachers reached for '||s);
        else
          insert into teacher_teaching_assignments(teacher_staff_id,class_name,subject,assignment_type,active)
          values(p_staff,c,s,'secondary_subject',true) on conflict do nothing;
        end if;
      end loop;
    end if;
  end loop;
  -- role/class change: retire (never delete) rows no longer in the placement
  update teacher_teaching_assignments set active=false, ends_on=current_date
   where teacher_staff_id=p_staff and active
     and not (class_name=any(pl.class_names)
              and (assignment_type='primary_class_teacher' or subject=any(pl.subjects)));
end $$;

create or replace function scl_trg_allocate() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.employment_status='active' and coalesce(new.is_teaching,false)
     and (tg_op='INSERT' or old.employment_status is distinct from new.employment_status or old.role is distinct from new.role) then
    perform scl_allocate_staff(new.id);
  end if; return new; end $$;
drop trigger if exists trg_scl_allocate on staff;
create trigger trg_scl_allocate after insert or update on staff for each row execute function scl_trg_allocate();

create or replace function scl_trg_replace_allocate() returns trigger language plpgsql security definer set search_path=public as $$
begin perform scl_allocate_staff(new.staff_id); return new; end $$;
drop trigger if exists trg_scl_placement on staff_placement;
create trigger trg_scl_placement after insert or update on staff_placement for each row execute function scl_trg_replace_allocate();

-- Teachers can never write assignments; they may only read their own.
alter table teacher_teaching_assignments enable row level security;
revoke insert,update,delete on teacher_teaching_assignments from anon,authenticated;
drop policy if exists own_assign_read on teacher_teaching_assignments;
create policy own_assign_read on teacher_teaching_assignments for select to authenticated
  using (teacher_staff_id in (select id from staff where user_id=auth.uid()));

-- Management correction path (replaces the old upsert; same signature, now cap-enforced, admin-only).
create or replace function scl_admin_upsert_teaching_assignment(p_teacher_staff_id uuid,p_class_name text,p_subject text,
  p_assignment_type text,p_qualification_note text,p_active boolean) returns void
language plpgsql security definer set search_path=public as $$
declare sec text:=scl_section(p_class_name); n int; already boolean;
begin
  if not exists(select 1 from user_roles where user_id=auth.uid() and active
      and role in ('developer','technical_admin','management_admin','affairs_admin')) then raise exception 'Not authorised'; end if;
  if sec in ('JSS','SSS') and p_active then
    perform pg_advisory_xact_lock(hashtext(sec||':'||p_subject));
    select exists(select 1 from teacher_teaching_assignments where active and teacher_staff_id=p_teacher_staff_id
                  and subject=p_subject and scl_section(class_name)=sec) into already;
    select count(distinct teacher_staff_id) into n from teacher_teaching_assignments where active and subject=p_subject and scl_section(class_name)=sec;
    if not already and n>=2 then raise exception '% limit of 2 teachers reached for %',sec,p_subject; end if;
  end if;
  insert into teacher_teaching_assignments(teacher_staff_id,class_name,subject,assignment_type,active,qualification_note)
  values(p_teacher_staff_id,p_class_name,p_subject,p_assignment_type,p_active,p_qualification_note)
  on conflict (teacher_staff_id,class_name,subject) where active
  do update set qualification_note=excluded.qualification_note, active=excluded.active;
end $$;

-- What the profile panel reads. Timetable is included only if a table named timetable_entries exists
-- with (teacher_staff_id, day, period, class_name, subject); adapt the query to your real timetable table.
create or replace function scl_my_assignments() returns jsonb language plpgsql security definer set search_path=public as $$
declare sid uuid; pl staff_placement; tt jsonb:='[]';
begin
  select id into sid from staff where user_id=auth.uid();
  if sid is null then return jsonb_build_object('found',false); end if;
  select * into pl from staff_placement where staff_id=sid;
  if to_regclass('public.timetable_entries') is not null then
    execute 'select coalesce(jsonb_agg(to_jsonb(t)),''[]'') from (select day,period,class_name,subject from timetable_entries where teacher_staff_id=$1 order by day,period) t' into tt using sid;
  end if;
  return jsonb_build_object('found',true,'department',pl.department,'duties',to_jsonb(coalesce(pl.duties,'{}')),
    'assignments',coalesce((select jsonb_agg(jsonb_build_object('class_name',class_name,'subject',subject,'assignment_type',assignment_type))
        from teacher_teaching_assignments where teacher_staff_id=sid and active),'[]'),
    'flags',coalesce((select jsonb_agg(jsonb_build_object('reason',reason)) from staff_assignment_flags where staff_id=sid and not resolved),'[]'),
    'timetable',tt);
end $$;
grant execute on function scl_my_assignments() to authenticated;
