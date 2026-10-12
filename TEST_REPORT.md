# SCL Teaching Allocation Verification — 12 October 2026

## Applied directly to the connected Supabase project
- Replaced `public.scl_enforce_teacher_subject_capacity()` with a section-wide JSS/SSS capacity guard.
- Added `public.scl_admin_upsert_teaching_assignment(...)`, which requires an authenticated user with an active developer, technical admin, management admin, or affairs admin role.
- Revoked execute from PUBLIC and anon; granted execute to authenticated.
- Existing `trg_scl_teacher_subject_capacity` trigger remains attached to `public.teacher_teaching_assignments`.

## Verification performed
- PostgreSQL function definition inspected after update.
- Rollback-only database test: two distinct teachers for Mathematics across JSS classes accepted; a third distinct JSS teacher rejected; same subject in SSS allowed independently.
- Test transaction rolled back; confirmed zero `SCL TEST TEACHER` records and zero assignment rows remained.
- Permission checks: RPC is SECURITY DEFINER, authenticated has execute, anon does not. A direct unauthenticated RPC test was rejected.
- New front-end script passed `node --check`; the full HTML parsed successfully with balanced script tags.

## Not yet end-to-end verified
- The signed-in approved-admin browser flow was not exercised in a real browser session.
- No real staff records or timetable records exist in the current database tables at test time, so actual teacher-to-timetable synchronization cannot yet be proven.
- The UI reads the current `teacher_teaching_assignments` rows; a separate timetable synchronization workflow still needs an explicit integration/test if assignments are expected to auto-populate timetable slots.
- Database changes were executed directly; this file is the reproducible migration source and has not been committed to the repository migration history.
