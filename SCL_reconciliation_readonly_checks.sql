-- READ-ONLY. Run in the Supabase SQL editor BEFORE the migration and paste the results back.
-- 1. Real columns of the tables the migration touches
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public' and table_name in ('worker_applications','staff','user_roles','platform_people','platform_school_memberships','teacher_teaching_assignments')
order by table_name, ordinal_position;

-- 2. Current worker applications and likely duplicates (same email, phone or name)
select to_jsonb(w) as row from public.worker_applications w order by 1;
select lower(btrim(coalesce(to_jsonb(w)->>'email',''))) as email, count(*) from public.worker_applications w group by 1 having count(*)>1;

-- 3. The existing User ID allocator (needed so approval reuses the real SCL numbering convention)
select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('scl_register_or_join_identity','scl_verify_school_id');

-- 4. Existing RLS policies and edge-function-facing tables
select schemaname, tablename, policyname, cmd, roles, qual from pg_policies where schemaname in ('public','storage') order by 1,2,3;
