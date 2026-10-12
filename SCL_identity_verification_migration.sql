-- =====================================================================
-- SCL identity, staff-application queue, verification, directory
-- Defensive, re-runnable migration. Apply AFTER SCL_teaching_allocation_backend_migration.sql.
-- NOT executed against your live database by the author. Back up first, run in a transaction,
-- and run SCL_reconciliation_readonly_checks.sql BEFORE this to see the real tables.
-- =====================================================================
create extension if not exists pgcrypto;

-- ---------- normalisers ----------
create or replace function public.scl_norm_email(t text) returns text language sql immutable as
$$ select nullif(lower(btrim(coalesce(t,''))),'') $$;

create or replace function public.scl_norm_phone(t text) returns text language plpgsql immutable as
$$ declare d text := regexp_replace(coalesce(t,''),'[^0-9]','','g');
begin
  if length(d) < 7 then return null; end if;
  return right(d,10);               -- +234 802.. / 0802.. / 802.. all collapse to the same key
end $$;

create or replace function public.scl_norm_name(t text) returns text language plpgsql immutable as
$$ begin
  return nullif(array_to_string(array(
    select w from unnest(string_to_array(regexp_replace(lower(coalesce(t,'')),'[^a-z0-9 ]',' ','g'),' ')) w
    where w <> '' order by w),' '),'');   -- order-insensitive: "Eludire Micheal" = "Micheal Eludire"
end $$;

-- ---------- authority ----------
create or replace function public.scl_is_staff_verifier() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.active = true
      and ur.role in ('developer','technical_admin','management_admin','affairs_admin','staff_management'));
$$;
revoke all on function public.scl_is_staff_verifier() from public, anon;
grant execute on function public.scl_is_staff_verifier() to authenticated;

-- ---------- tables ----------
create table if not exists public.scl_staff_applications (
  id uuid primary key default gen_random_uuid(),
  public_ref text not null unique default ('APP-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  kind text not null check (kind in ('teaching','non_teaching')),
  position text not null,
  position_norm text generated always as (lower(btrim(position))) stored,
  auth_user_id uuid,
  person_id uuid,
  full_name text not null,
  name_norm text,
  email text not null,
  email_norm text not null,
  phone text,
  phone_norm text,
  status text not null default 'submitted'
    check (status in ('incomplete','submitted','needs_info','approved','rejected')),
  missing jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  documents jsonb not null default '{}'::jsonb,       -- key -> storage path
  photo_path text,                                     -- path in public bucket staff-photos
  attempt_count integer not null default 1,
  last_attempt_at timestamptz not null default now(),
  last_attempt_token text,
  review_flag text,                                    -- possible duplicate, needs human review
  possible_duplicate_of uuid references public.scl_staff_applications(id),
  decided_by uuid, decided_at timestamptz, decision_reason text,
  scl_user_id text,
  legacy_worker_application_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- one live application per person (email) per kind+position; a rejected one may be re-applied for
create unique index if not exists scl_staff_app_one_live
  on public.scl_staff_applications (email_norm, kind, position_norm) where status <> 'rejected';
create index if not exists scl_staff_app_phone on public.scl_staff_applications (phone_norm);
create index if not exists scl_staff_app_name  on public.scl_staff_applications (name_norm);
create index if not exists scl_staff_app_auth  on public.scl_staff_applications (auth_user_id);

create table if not exists public.scl_staff_application_events (
  id bigserial primary key,
  application_id uuid not null references public.scl_staff_applications(id) on delete cascade,
  event text not null,
  actor uuid,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.scl_staff_settings (
  id boolean primary key default true check (id),
  contact_visible_to text not null default 'staff' check (contact_visible_to in ('admins','staff','signed_in'))
);
insert into public.scl_staff_settings default values on conflict do nothing;

alter table public.scl_staff_applications enable row level security;
alter table public.scl_staff_application_events enable row level security;
alter table public.scl_staff_settings enable row level security;
-- no direct table policies for anon/authenticated: ALL access goes through the SECURITY DEFINER functions below.
revoke all on public.scl_staff_applications, public.scl_staff_application_events, public.scl_staff_settings from anon, authenticated;

create or replace function public.scl_touch_updated() returns trigger language plpgsql as
$$ begin new.updated_at := now(); return new; end $$;
drop trigger if exists scl_staff_app_touch on public.scl_staff_applications;
create trigger scl_staff_app_touch before update on public.scl_staff_applications
for each row execute function public.scl_touch_updated();

-- ---------- required information ----------
create or replace function public.scl_app_missing(a public.scl_staff_applications) returns jsonb
language plpgsql immutable as $$
declare m jsonb := '[]'::jsonb;
begin
  if coalesce(a.full_name,'') = '' then m := m || '"Full name"'; end if;
  if coalesce(a.phone_norm,'') = '' then m := m || '"Phone number"'; end if;
  if coalesce(a.payload->>'credentials','') = '' then m := m || '"Qualification / credentials"'; end if;
  if coalesce(a.payload->>'workPattern','') = '' then m := m || '"Work pattern"'; end if;
  if coalesce(a.photo_path,'') = '' then m := m || '"Passport photograph"'; end if;
  if coalesce(a.documents->>'cv','') = '' then m := m || '"CV"'; end if;
  return m;
end $$;

-- ---------- submit / resume (called by the registration form, anon or signed in) ----------
create or replace function public.scl_submit_staff_application(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_email text := public.scl_norm_email(p->>'email');
  v_phone text := public.scl_norm_phone(p->>'phone');
  v_name  text := btrim(coalesce(p->>'full_name',''));
  v_pos   text := btrim(coalesce(p->>'position',''));
  v_kind  text;
  v_uid   uuid := auth.uid();
  v_token text := nullif(p->>'submit_token','');
  v_docs  jsonb := coalesce(p->'documents','{}'::jsonb);
  v_pay   jsonb := coalesce(p->'payload','{}'::jsonb);
  v_photo text := nullif(btrim(coalesce(p->>'photo_path','')),'');
  a public.scl_staff_applications;
  v_owner boolean; v_new boolean := false; v_count boolean := true; k text; v_dup uuid;
begin
  if v_email is null or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'A valid email address is required.'; end if;
  if v_name = '' then raise exception 'Full name is required.'; end if;
  if v_pos = '' then raise exception 'Position is required.'; end if;
  v_kind := case when lower(v_pos) = 'teacher' then 'teaching' else 'non_teaching' end;
  -- only well-formed storage paths from the upload step are accepted; anything else is dropped
  if v_photo is not null and v_photo !~ '^incoming/[0-9a-f-]{36}/photo\.(jpg|png|webp)$' then v_photo := null; end if;
  v_docs := coalesce((select jsonb_object_agg(e.key, e.value) from jsonb_each(v_docs) e
              where e.key in ('cv','applicationLetter','proof')
                and jsonb_typeof(e.value)='string' and (e.value #>> '{}') ~ '^incoming/[0-9a-f-]{36}/[A-Za-z0-9_.-]{1,80}$'),'{}'::jsonb);

  perform pg_advisory_xact_lock(hashtextextended('scl-staff-app:'||v_email||':'||v_kind||':'||lower(v_pos),0));

  select * into a from public.scl_staff_applications
   where email_norm = v_email and kind = v_kind and position_norm = lower(v_pos) and status <> 'rejected';

  if not found then
    -- possible duplicate person under a different email (never auto-merged)
    select id into v_dup from public.scl_staff_applications
     where email_norm <> v_email and status <> 'rejected'
       and ((v_phone is not null and phone_norm = v_phone)
         or (public.scl_norm_name(v_name) is not null and name_norm = public.scl_norm_name(v_name) and v_phone is null))
     order by created_at limit 1;
    insert into public.scl_staff_applications
      (kind,position,auth_user_id,full_name,name_norm,email,email_norm,phone,phone_norm,payload,documents,photo_path,
       last_attempt_token,possible_duplicate_of,review_flag)
    values (v_kind,v_pos,v_uid,v_name,public.scl_norm_name(v_name),btrim(p->>'email'),v_email,p->>'phone',v_phone,
            v_pay,v_docs,v_photo,v_token,v_dup,
            case when v_dup is not null then 'Possible duplicate: same phone number as another application' end)
    returning * into a;
    v_new := true;
    insert into public.scl_staff_application_events(application_id,event,actor,detail)
      values (a.id,'created',v_uid,jsonb_build_object('kind',v_kind,'position',v_pos));
  else
    if a.status = 'approved' then
      return jsonb_build_object('result','already_verified','ref',a.public_ref,'status',a.status,
        'message','You are already verified. Please sign in to your existing account.');
    end if;
    -- double-click / network retry must not inflate the counter
    if (v_token is not null and v_token = a.last_attempt_token) or a.last_attempt_at > now() - interval '15 seconds' then
      v_count := false;
    end if;
    v_owner := (a.auth_user_id is not null and a.auth_user_id = v_uid);
    -- a signed-in owner may update fields; anyone else may only FILL BLANKS (cannot overwrite another person's data)
    if v_owner then
      a.payload := a.payload || v_pay;
      a.documents := a.documents || v_docs;
      if v_photo is not null then a.photo_path := v_photo; end if;
      if v_phone is not null then a.phone := p->>'phone'; a.phone_norm := v_phone; end if;
    else
      for k in select jsonb_object_keys(v_pay) loop
        if coalesce(a.payload->>k,'') = '' then a.payload := jsonb_set(a.payload, array[k], v_pay->k); end if;
      end loop;
      for k in select jsonb_object_keys(v_docs) loop
        if coalesce(a.documents->>k,'') = '' then a.documents := jsonb_set(a.documents, array[k], v_docs->k); end if;
      end loop;
      if coalesce(a.photo_path,'') = '' and v_photo is not null then a.photo_path := v_photo; end if;
      if coalesce(a.phone_norm,'') = '' and v_phone is not null then a.phone := p->>'phone'; a.phone_norm := v_phone; end if;
    end if;
    if a.auth_user_id is null and v_uid is not null then a.auth_user_id := v_uid; end if;
    update public.scl_staff_applications set
      payload=a.payload, documents=a.documents, photo_path=a.photo_path, phone=a.phone, phone_norm=a.phone_norm,
      auth_user_id=a.auth_user_id,
      attempt_count = attempt_count + case when v_count then 1 else 0 end,
      last_attempt_at = case when v_count then now() else last_attempt_at end,
      last_attempt_token = coalesce(v_token,last_attempt_token)
    where id = a.id returning * into a;
    if v_count then
      insert into public.scl_staff_application_events(application_id,event,actor,detail)
        values (a.id,'attempt',v_uid,jsonb_build_object('attempt',a.attempt_count));
    end if;
  end if;

  a.missing := public.scl_app_missing(a);
  update public.scl_staff_applications set
     missing = a.missing,
     status = case when jsonb_array_length(a.missing) > 0 then 'incomplete'
                   when a.status in ('incomplete','needs_info') then 'submitted' else a.status end
   where id = a.id returning * into a;

  return jsonb_build_object(
    'result', case when v_new then 'created' else 'resumed' end,
    'ref', a.public_ref, 'status', a.status, 'missing', a.missing, 'attempts', a.attempt_count,
    'message', case
       when jsonb_array_length(a.missing) > 0 then 'Account already created, but not complete.'
       when v_new then 'Application submitted. It is now awaiting verification.'
       else 'Your application is complete and awaiting verification.' end);
end $$;
revoke all on function public.scl_submit_staff_application(jsonb) from public;
grant execute on function public.scl_submit_staff_application(jsonb) to anon, authenticated;

-- ---------- verifier queue ----------
create or replace function public.scl_list_staff_applications(p_kind text, p_status text default 'pending')
returns jsonb language plpgsql security definer stable set search_path = public as $$
begin
  if not public.scl_is_staff_verifier() then raise exception 'Not allowed.' using errcode='42501'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id',a.id,'ref',a.public_ref,'name',a.full_name,'position',a.position,'kind',a.kind,
      'submitted_at',a.created_at,'status',a.status,'attempts',a.attempt_count,'missing',a.missing,
      'review_flag',a.review_flag,'scl_user_id',a.scl_user_id) order by a.created_at desc)
    from public.scl_staff_applications a
    where a.kind = p_kind
      and (case when p_status = 'pending' then a.status in ('incomplete','submitted','needs_info')
                when p_status is null or p_status = 'all' then true else a.status = p_status end)),'[]'::jsonb);
end $$;
revoke all on function public.scl_list_staff_applications(text,text) from public, anon;
grant execute on function public.scl_list_staff_applications(text,text) to authenticated;

create or replace function public.scl_get_staff_application(p_id uuid) returns jsonb
language plpgsql security definer stable set search_path = public as $$
declare a public.scl_staff_applications; v_ev jsonb;
begin
  if not public.scl_is_staff_verifier() then raise exception 'Not allowed.' using errcode='42501'; end if;
  select * into a from public.scl_staff_applications where id = p_id;
  if not found then raise exception 'Application not found.'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('event',e.event,'at',e.created_at,'detail',e.detail) order by e.created_at),'[]')
    into v_ev from public.scl_staff_application_events e where e.application_id = a.id;
  return to_jsonb(a) - 'name_norm' - 'email_norm' - 'phone_norm' - 'position_norm' || jsonb_build_object('events',v_ev);
end $$;
revoke all on function public.scl_get_staff_application(uuid) from public, anon;
grant execute on function public.scl_get_staff_application(uuid) to authenticated;

-- ---------- staff row + automatic allocation (adapts to the real `staff` columns) ----------
create or replace function public.scl_ensure_staff_row(a public.scl_staff_applications) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_cols text := ''; v_vals text := ''; c text; v jsonb;
begin
  if to_regclass('public.staff') is null then return null; end if;
  begin
    execute 'select id from public.staff st where lower(coalesce(to_jsonb(st)->>''email'',''''))=$1 limit 1' into v_id using a.email_norm;
    if v_id is not null then return v_id; end if;
    v := jsonb_build_object('full_name',a.full_name,'name',a.full_name,'email',a.email_norm,'phone',a.phone,
          'auth_user_id',a.auth_user_id,'user_id',a.auth_user_id,'is_teaching',(a.kind='teaching'),
          'employment_status','active','position',a.position,'role',a.position);
    for c in select column_name from information_schema.columns
             where table_schema='public' and table_name='staff' and column_name = any (array(select jsonb_object_keys(v))) loop
      v_cols := v_cols || case when v_cols='' then '' else ',' end || quote_ident(c);
      v_vals := v_vals || case when v_vals='' then '' else ',' end || quote_nullable(v->>c);
    end loop;
    if v_cols = '' then return null; end if;
    execute format('insert into public.staff (%s) values (%s) returning id', v_cols, v_vals) into v_id;
    return v_id;
  exception when others then return null;   -- reported as allocation_deferred, never fails the approval
  end;
end $$;
revoke all on function public.scl_ensure_staff_row(public.scl_staff_applications) from public, anon, authenticated;

create or replace function public.scl_apply_allocation(a public.scl_staff_applications) returns text
language plpgsql security definer set search_path = public as $$
declare v_staff uuid; v_class text := btrim(coalesce(a.payload#>>'{timetableRegistration,className}',''));
        v_subj text := btrim(coalesce(a.payload#>>'{timetableRegistration,subject}',''));
begin
  if a.kind <> 'teaching' then return 'non_teaching: duties follow the approved position "'||a.position||'"'; end if;
  if v_class = '' then return 'deferred: no class stated in the application'; end if;
  v_staff := public.scl_ensure_staff_row(a);
  if v_staff is null then return 'deferred: could not create/find the staff record'; end if;
  begin
    if v_class like 'Primary %' or v_class in ('Daycare','Nursery 1','Nursery 2','Reception') then
      perform public.scl_admin_upsert_teaching_assignment(v_staff, v_class, 'ALL_SUBJECTS', 'primary_class_teacher', 'auto on approval '||a.public_ref, true);
      return 'allocated: whole class '||v_class;
    elsif v_subj <> '' then
      perform public.scl_admin_upsert_teaching_assignment(v_staff, v_class, v_subj, 'secondary_subject', 'auto on approval '||a.public_ref, true);
      return 'allocated: '||v_subj||' in '||v_class;
    end if;
    return 'deferred: no subject stated for a secondary class';
  exception when others then
    return 'blocked: '||sqlerrm;          -- e.g. section-wide capacity of two teachers reached
  end;
end $$;
revoke all on function public.scl_apply_allocation(public.scl_staff_applications) from public, anon, authenticated;

-- ---------- permanent User ID lookup (REUSE only; allocation stays with the existing sequence) ----------
create or replace function public.scl_lookup_existing_user_id(p_auth uuid) returns text
language plpgsql security definer set search_path = public as $$
declare v text;
begin
  if p_auth is null or to_regclass('public.platform_school_memberships') is null or to_regclass('public.platform_people') is null then return null; end if;
  begin
    execute $q$select m.school_id_number from public.platform_school_memberships m
               join public.platform_people pp on pp.id = m.person_id
               where pp.auth_user_id = $1 and coalesce(m.school_id_number,'') <> '' order by m.created_at limit 1$q$
      into v using p_auth;
  exception when others then v := null; end;
  return v;
end $$;
revoke all on function public.scl_lookup_existing_user_id(uuid) from public, anon, authenticated;

-- ---------- decision ----------
create or replace function public.scl_decide_staff_application(p_id uuid, p_decision text, p_reason text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare a public.scl_staff_applications; v_role text; v_alloc text := null; v_id text; v_me text;
begin
  if not public.scl_is_staff_verifier() then raise exception 'Not allowed.' using errcode='42501'; end if;
  if p_decision not in ('approve','request_info','reject') then raise exception 'Unknown decision.'; end if;
  select * into a from public.scl_staff_applications where id = p_id for update;
  if not found then raise exception 'Application not found.'; end if;
  select lower(email) into v_me from auth.users where id = auth.uid();
  if a.auth_user_id = auth.uid() or a.email_norm = v_me then raise exception 'You cannot decide your own application.' using errcode='42501'; end if;
  if a.status = 'approved' and p_decision <> 'approve' then raise exception 'Already approved. Revoke through staff management.'; end if;
  if p_decision in ('request_info','reject') and btrim(coalesce(p_reason,'')) = '' then raise exception 'A reason is required.'; end if;

  if p_decision = 'approve' then
    if a.status = 'approved' then return jsonb_build_object('status','approved','scl_user_id',a.scl_user_id,'message','Already approved.'); end if;
    if jsonb_array_length(public.scl_app_missing(a)) > 0 then
      raise exception 'Information is still missing: %', public.scl_app_missing(a)::text; end if;
    v_id := public.scl_lookup_existing_user_id(a.auth_user_id);       -- reuse; never regenerate
    v_role := case when a.kind='teaching' then 'teacher' else 'non_teaching_staff' end;   -- derived, never user-selected
    if a.auth_user_id is not null then
      insert into public.user_roles(user_id, role, active)
        select a.auth_user_id, v_role, true
        where not exists (select 1 from public.user_roles r where r.user_id=a.auth_user_id and r.role=v_role);
      update public.user_roles set active = true where user_id=a.auth_user_id and role=v_role;
    end if;
    update public.scl_staff_applications set status='approved', decided_by=auth.uid(), decided_at=now(),
           decision_reason=nullif(btrim(coalesce(p_reason,'')),''), scl_user_id=coalesce(v_id,scl_user_id)
     where id=a.id returning * into a;
    v_alloc := public.scl_apply_allocation(a);
    insert into public.scl_staff_application_events(application_id,event,actor,detail)
      values (a.id,'approved',auth.uid(),jsonb_build_object('role',v_role,'user_id',a.scl_user_id,'allocation',v_alloc,
              'role_pending_login', a.auth_user_id is null));
  else
    update public.scl_staff_applications set status = case when p_decision='reject' then 'rejected' else 'needs_info' end,
           decided_by=auth.uid(), decided_at=now(), decision_reason=btrim(p_reason) where id=a.id returning * into a;
    insert into public.scl_staff_application_events(application_id,event,actor,detail)
      values (a.id,p_decision,auth.uid(),jsonb_build_object('reason',p_reason));
  end if;
  return jsonb_build_object('status',a.status,'scl_user_id',a.scl_user_id,'allocation',v_alloc,
                            'role_pending_login', p_decision='approve' and a.auth_user_id is null);
end $$;
revoke all on function public.scl_decide_staff_application(uuid,text,text) from public, anon;
grant execute on function public.scl_decide_staff_application(uuid,text,text) to authenticated;

-- ---------- applicant signs in AFTER approval: role is activated from the approved record ----------
create or replace function public.scl_activate_my_approved_role() returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_mail text; a public.scl_staff_applications; v_role text;
begin
  if auth.uid() is null then return jsonb_build_object('activated',false); end if;
  select lower(email) into v_mail from auth.users where id = auth.uid();
  select * into a from public.scl_staff_applications where email_norm=v_mail and status='approved' order by decided_at desc limit 1;
  if not found then return jsonb_build_object('activated',false); end if;
  if a.auth_user_id is null then update public.scl_staff_applications set auth_user_id=auth.uid() where id=a.id; end if;
  v_role := case when a.kind='teaching' then 'teacher' else 'non_teaching_staff' end;
  insert into public.user_roles(user_id, role, active)
    select auth.uid(), v_role, true where not exists (select 1 from public.user_roles r where r.user_id=auth.uid() and r.role=v_role);
  return jsonb_build_object('activated',true,'role',v_role,'scl_user_id',a.scl_user_id,'ref',a.public_ref);
end $$;
revoke all on function public.scl_activate_my_approved_role() from public, anon;
grant execute on function public.scl_activate_my_approved_role() to authenticated;

-- ---------- staff directory for the homepage carousel (public, privacy-safe) ----------
create or replace function public.scl_public_staff_directory() returns jsonb
language sql security definer stable set search_path = public as $$
  with per_person as (
    select a.email_norm,
           bool_or(a.status='approved') as verified,
           (array_agg(a.public_ref order by (a.status='approved') desc, a.created_at))[1] as ref,
           (array_agg(a.full_name  order by (a.status='approved') desc, a.created_at))[1] as nm,
           (array_agg(a.position   order by (a.status='approved') desc, a.created_at))[1] as pos,
           (array_agg(a.photo_path order by (a.status='approved') desc, a.created_at))[1] as photo,
           min(a.created_at) as first_at
    from public.scl_staff_applications a
    where a.status in ('submitted','needs_info','approved')       -- incomplete/rejected never shown
    group by a.email_norm)
  select coalesce(jsonb_agg(jsonb_build_object(
      'ref', ref, 'verified', verified, 'position', pos,
      'name',  case when verified then nm end,           -- pending applicants: no name
      'photo', case when verified then photo end         -- pending applicants: no photo URL leaves the server
    ) order by verified desc, first_at), '[]'::jsonb) from per_person;
$$;
revoke all on function public.scl_public_staff_directory() from public;
grant execute on function public.scl_public_staff_directory() to anon, authenticated;

create or replace function public.scl_get_staff_contact(p_ref text) returns jsonb
language plpgsql security definer stable set search_path = public as $$
declare v_mode text; v_ok boolean := false; a public.scl_staff_applications;
begin
  if auth.uid() is null then raise exception 'Sign in to view contact details.' using errcode='42501'; end if;
  select contact_visible_to into v_mode from public.scl_staff_settings;
  v_ok := case v_mode
    when 'signed_in' then true
    when 'admins' then public.scl_is_staff_verifier()
    else public.scl_is_staff_verifier() or exists (select 1 from public.user_roles r where r.user_id=auth.uid() and r.active
         and r.role in ('teacher','non_teaching_staff','staff')) end;
  if not v_ok then raise exception 'Contact details are not available to your account.' using errcode='42501'; end if;
  select * into a from public.scl_staff_applications where public_ref=p_ref and status='approved';
  if not found then raise exception 'Not a verified staff member.'; end if;
  return jsonb_build_object('name',a.full_name,'email',a.email,'phone',a.phone);
end $$;
revoke all on function public.scl_get_staff_contact(text) from public, anon;
grant execute on function public.scl_get_staff_contact(text) to authenticated;

-- ---------- storage ----------
insert into storage.buckets (id,name,public) values ('staff-photos','staff-photos',true) on conflict (id) do nothing;
insert into storage.buckets (id,name,public) values ('staff-documents','staff-documents',false) on conflict (id) do nothing;

drop policy if exists scl_staff_photos_upload on storage.objects;
create policy scl_staff_photos_upload on storage.objects for insert to anon, authenticated
  with check (bucket_id='staff-photos' and name ~ '^incoming/[0-9a-f-]{36}/photo\.(jpg|jpeg|png|webp)$');
drop policy if exists scl_staff_docs_upload on storage.objects;
create policy scl_staff_docs_upload on storage.objects for insert to anon, authenticated
  with check (bucket_id='staff-documents' and name ~ '^incoming/[0-9a-f-]{36}/[A-Za-z0-9_.-]{1,80}$');
drop policy if exists scl_staff_docs_verifier_read on storage.objects;
create policy scl_staff_docs_verifier_read on storage.objects for select to authenticated
  using (bucket_id='staff-documents' and public.scl_is_staff_verifier());

-- ---------- backfill from the legacy worker_applications table (best effort, idempotent) ----------
do $$
declare r record; j jsonb; v_email text; v_pos text; v_kind text;
begin
  if to_regclass('public.worker_applications') is null then return; end if;
  for r in execute 'select to_jsonb(w) as j from public.worker_applications w' loop
    j := r.j;
    v_email := public.scl_norm_email(coalesce(j->>'email', j->>'applicant_email'));
    v_pos   := btrim(coalesce(j->>'role', j->>'position', j->>'profession', 'Other Staff'));
    if v_email is null then continue; end if;
    v_kind := case when lower(v_pos)='teacher' then 'teaching' else 'non_teaching' end;
    insert into public.scl_staff_applications(kind,position,full_name,name_norm,email,email_norm,phone,phone_norm,
        payload,status,legacy_worker_application_id,review_flag,created_at)
    values (v_kind,v_pos,coalesce(j->>'full_name',j->>'fullName',j->>'name','(no name)'),
        public.scl_norm_name(coalesce(j->>'full_name',j->>'fullName',j->>'name')),
        v_email,v_email,coalesce(j->>'phone',j->>'phone_number'),public.scl_norm_phone(coalesce(j->>'phone',j->>'phone_number')),
        j, 'incomplete', coalesce(j->>'public_id',j->>'id'),
        'Imported from worker_applications; documents must be re-attached',
        coalesce((j->>'created_at')::timestamptz, now()))
    on conflict do nothing;      -- same email+kind+position (e.g. the two Eludire Micheal rows) collapses to ONE record
  end loop;
end $$;
