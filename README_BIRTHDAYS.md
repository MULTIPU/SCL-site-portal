# Birthday automation (needs your Supabase access: I could not deploy or test it)
Why it cannot live in the website: a webpage only runs when someone opens it. Automatic daily emails need a server job.
1. Run 01_birthday_setup.sql (log table only).
2. Create a free Resend account, verify a sender address, then in a terminal with the Supabase CLI:
   supabase secrets set RESEND_API_KEY=... CRON_SECRET=<long random text> SCHOOL_EMAIL=shiningchildleader@gmail.com FROM_EMAIL=<verified sender>
   supabase functions deploy scl-birthdays --no-verify-jwt
3. Enable pg_cron and pg_net, then run the commented cron.schedule statement from the SQL file with your CRON_SECRET.
4. Test once by calling the function manually with the x-cron-secret header on a day a test student has a birthday.
Covers students only (columns taken from the website code: students.date_of_birth, official_academic_email). Staff and teacher birthdays need the table/column where their date of birth and email are stored. Tell me those names and I will add them.
The school notification is sent by email to shiningchildleader@gmail.com. A notice inside the website's announcement list is not included.
