// Supabase Edge Function: scl-birthdays   (NOT deployed or tested by me)
// Sends a birthday email to each person whose birthday is today, then emails the school a summary.
// Secrets needed: RESEND_API_KEY, CRON_SECRET, SCHOOL_EMAIL (shiningchildleader@gmail.com), FROM_EMAIL (a sender verified in Resend)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase to edge functions automatically. Never put them in the website.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function mail(to: string, subject: string, html: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}` },
    body: JSON.stringify({ from: Deno.env.get("FROM_EMAIL"), to, subject, html }),
  });
  return r.ok;
}

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) return new Response("forbidden", { status: 403 });

  // Today in Lagos (UTC+1)
  const now = new Date(Date.now() + 3600_000);
  const m = now.getUTCMonth() + 1, d = now.getUTCDate(), y = now.getUTCFullYear();

  // ASSUMPTION from the website code: public.students has child_name, date_of_birth, official_academic_email, class_name.
  // Confirm these column names in your database. Staff/parent birthdays need their own source: add another query
  // below once you confirm which table and columns hold their date of birth and email.
  const { data: students, error } = await sb.from("students")
    .select("id, child_name, class_name, date_of_birth, official_academic_email").not("date_of_birth", "is", null);
  if (error) return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });

  const people = (students ?? []).filter((s) => {
    const dt = new Date(s.date_of_birth + "T00:00:00Z");
    return dt.getUTCMonth() + 1 === m && dt.getUTCDate() === d;
  }).map((s) => ({ key: `student:${s.id}`, name: s.child_name, email: s.official_academic_email, role: `Student, ${s.class_name ?? ""}` }));

  const celebrated: string[] = [];
  for (const p of people) {
    const { error: dup } = await sb.from("birthday_log").insert({ person_key: p.key, year: y });
    if (dup) continue; // already handled this year
    if (p.email) {
      await mail(p.email, `Happy Birthday, ${p.name}!`,
        `<p>Dear ${p.name},</p><p>Everyone at Shining Child Leaders School wishes you a very happy birthday. May this new year of your life be bright and full of success.</p><p><i>Raising Today's Children to Become Tomorrow's Leaders</i></p>`);
    }
    celebrated.push(`${p.name} (${p.role})${p.email ? "" : " - no email on file"}`);
  }

  if (celebrated.length) {
    await mail(Deno.env.get("SCHOOL_EMAIL")!, `Birthdays today (${celebrated.length})`,
      `<p>Birthdays today:</p><ul>${celebrated.map((c) => `<li>${c}</li>`).join("")}</ul>`);
  }
  return new Response(JSON.stringify({ ok: true, celebrated: celebrated.length }), { headers: { "Content-Type": "application/json" } });
});
