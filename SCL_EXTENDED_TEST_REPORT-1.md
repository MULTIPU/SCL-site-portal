# SCL Website — Extended Static + Backend Configuration Audit

Audit date: 19 October 2026

## What was tested

- Parsed the uploaded `index.html` (6.49 MB) and inspected the registration, API-routing, login/OAuth, attendance, worker, timetable, result, payment, PWA and service-worker integration points.
- Ran `node --check` on all 119 inline executable JavaScript blocks in the corrected HTML: **0 syntax failures**. The sole script in the original that failed a generic JavaScript syntax check was JSON-LD structured data, which is JSON rather than JavaScript and is intentionally excluded.
- Checked DOM IDs: **0 duplicate IDs**.
- Checked registration markup and form bindings before/after correction.
- Inspected active Supabase Edge Functions and read-only database table counts. No test student/payment/result records were created.
- Attempted to update the GitHub `sw.js` in `MULTIPU/SCL-site-portal` but GitHub returned HTTP 403 `Resource not accessible by integration`; therefore this audit package is **not published to GitHub Pages**.

## Fixes made in the replacement HTML

1. Added the missing `form#form` around the new-student registration section. The existing submit handler was searching for `#form`; without it, the handler never attached and the submit button could do nothing.
2. Added a **SAVE INCOMPLETE DRAFT** action connected to the deployed `register_draft` API action. It saves a draft reference and does not issue a student ID.
3. Added the missing `apikey` header to public API requests. The Edge Function rejects calls without the configured publishable key; previously the common API wrapper sent only `Content-Type`, so registrations/payments/results could fail even with the correct endpoint.
4. Changed student name presentation and composition to Nigerian order: **Surname → First/Given Name → Other Names**.
5. Removed the local fallback that fabricated `LOCAL-*` student IDs and the hard-coded `123456` Result PIN when the server failed. A failed API call now reports that registration was not completed and keeps the form open.
6. Updated the School schema.org slogan to the stated official slogan.

## High-priority findings still requiring backend / live browser verification

- **Student/parent production data is not established:** database counts at audit time were `students=0`, `registrations=0`, `parent_students=0`, `payments=0`, `results=0`; `student_verification_queue=24`, `staff=6`, `scl_staff_applications=5`. This means a successful end-to-end parent-to-student linkage has not been demonstrated by existing records.
- **Parent account/linkage workflow is incomplete in the public registration action:** the deployed `register` action inserts a student, academic identity and registration row, but does not create/link a parent profile or `parent_students` relation. Do not treat registration alone as proof that parent access works.
- **Academic email creation is not actual mailbox provisioning:** the registration action records an academic identity with `mailbox_provisioned=false` and no provider, while the UI presents an official academic email workflow. A mailbox must not be represented as created until a provider actually provisions and verifies it.
- **Partial-write risk in registration:** the `register` action inserts the student before document uploads and later identity/registration inserts. Some later failures can leave partial rows/files; it needs a transaction/RPC or compensating cleanup across every failure path.
- **Name fallback in deployed backend still assumes Western order when explicit names are missing:** the edge function uses the final token of `childName` as a surname fallback. The frontend now sends explicit Nigerian-order name fields, but the deployed function itself has not been changed in this package.
- **Public draft endpoint protection:** the draft action is accessible with the public publishable key and no user JWT; it should have rate limits/abuse protection and should only permit safe draft fields. This audit did not send test writes.
- **Service worker defect found in repository `sw.js`:** the current file contains multiple concatenated generations of `install`, `activate`, `fetch`, `push`, and `notificationclick` handlers. A single push can trigger several notification handlers; cache versions conflict. `SCL_SW_FIXED.js` replaces these with one coherent handler per event and does not cache HTML navigations.
- **Unmatched frontend function references:** the HTML references `scl-notify` and `scl-student-attendance-notify`, but those slugs were not in the active Supabase function list returned during the audit. Any feature relying on these exact endpoints needs to be repointed to an active function or deployed intentionally.
- **Staff result upload route:** the UI calls `/api/staff/results`; on GitHub Pages, the static-host shim returns 503 unless a real API base is configured. The UI has a local-only fallback, so an uploaded result document may not be durably stored by that route.
- **Live browser checks remain outstanding:** this environment did not provide an authenticated school test account/browser session to run real Google sign-in, role authorization, file upload, GPS attendance, push permission delivery, admin approvals, and cross-device persistence. These are not marked as passed.

## Test status

| Area | Result |
|---|---|
| HTML parse / unique IDs | PASS (static) |
| Inline executable JavaScript syntax | PASS (119 checked, 0 failures) |
| Student registration form event binding | FIXED in replacement HTML; static check passes |
| API publishable-key header | FIXED in replacement HTML |
| Nigerian name order | FIXED in replacement HTML |
| Draft-save path | Wired to deployed `register_draft`; live write not tested |
| Full registration / parent linkage | NOT VERIFIED; backend flow incomplete |
| Google OAuth / role-based admin access | NOT RUN in live browser |
| Payments / result PIN / result publishing | NOT RUN end-to-end |
| Attendance GPS / biometric prompt / notifications | NOT RUN end-to-end |
| Staff application / verification / termination appeal | NOT RUN end-to-end |
| GitHub Pages deployment of fixes | BLOCKED by GitHub integration 403 |

## Deployment note

Use `index.html` from this package as the replacement for the root `index.html`, and replace root `sw.js` with `SCL_SW_FIXED.js` renamed to `sw.js`. Keep the repository's existing `manifest.webmanifest` and icon assets. This package has **not** been pushed or published; the GitHub integration denied the write operation.
