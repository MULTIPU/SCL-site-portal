// scl-results-api — teacher result uploads, cycles, push subscriptions, admin review.
// Secrets (set with `supabase secrets set`, never in the browser):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-provided), SUPABASE_ANON_KEY (auto-provided)
//   VAPID_PUBLIC_KEY, SCL_RESULTS_ENFORCE_CLASS (optional, default "true")
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

const URL_ = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY") || "";
const admin = createClient(URL_, SERVICE, { auth: { persistSession: false } });

const ADMIN_ROLES = ["technical_admin", "management_admin", "affairs_admin", "developer"];
const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const CLASSES = ["Daycare","Nursery 1","Nursery 2","Reception","Primary 1","Primary 2","Primary 3","Primary 4","Primary 5","JSS 1","JSS 2","JSS 3","SSS 1","SSS 2","SSS 3"];

type Ctx = { userId: string; email: string; roles: string[]; staffId: string; isAdmin: boolean; isTeacher: boolean };

// Identify the caller from their own access token, then ask the existing scl-auth-api
// ("access" action) for roles / school ID so we reuse the portal's identity rules.
async function identify(req: Request): Promise<Ctx> {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) throw new HttpError(401, "Sign in first.");
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) throw new HttpError(401, "Your session has expired. Please sign in again.");
  let roles: string[] = [], staffId = "";
  try {
    const r = await fetch(`${URL_}/functions/v1/scl-auth-api`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, apikey: ANON || SERVICE },
      body: JSON.stringify({ action: "access" }),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      const mem = d.memberships || [];
      roles = [...new Set([...(d.roles || []).map((x: any) => x.role), ...mem.map((x: any) => x.membership_type)])]
        .filter(Boolean).map((x: any) => String(x).toLowerCase().replace(/[\s/-]+/g, "_"));
      staffId = d.person?.primary_id_number ||
        mem.find((x: any) => ["teacher", "staff"].includes(String(x.membership_type || "").toLowerCase()))?.school_id_number ||
        mem[0]?.school_id_number || "";
    }
  } catch (_) { /* roles stay empty -> access denied below */ }
  const isAdmin = roles.some((r) => ADMIN_ROLES.includes(r));
  return { userId: data.user.id, email: data.user.email || "", roles, staffId, isAdmin, isTeacher: roles.includes("teacher") };
}
class HttpError extends Error { constructor(public status: number, m: string) { super(m); } }

async function loadCycles() {
  const { data, error } = await admin.from("school_result_cycles_live").select("*")
    .order("session", { ascending: false }).order("term").order("cycle_number");
  if (error) throw new HttpError(500, "Result cycles could not be loaded.");
  return data || [];
}
function publicCycle(c: any) {
  return {
    id: c.id, session: c.session, term: c.term, cycle_number: c.cycle_number, title: c.title,
    start_date: c.start_date, due_date: c.due_date, effective_due_date: c.effective_due_date,
    test_max_marks: c.test_max_marks, exam_max_marks: c.exam_max_marks,
    status: c.effective_status, admin_status: c.status, extended_until: c.extended_until,
    reminder_enabled: c.reminder_enabled, today: c.lagos_today,
  };
}
// Current cycle = the open/extended one; otherwise the next scheduled; otherwise the latest closed.
function pickCurrent(list: any[]) {
  return list.find((c) => c.effective_status === "open") || list.find((c) => c.effective_status === "extended") ||
    list.filter((c) => c.effective_status === "scheduled").sort((a, b) => a.start_date.localeCompare(b.start_date))[0] ||
    list.filter((c) => c.effective_status === "closed").sort((a, b) => b.due_date.localeCompare(a.due_date))[0] || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const ctype = req.headers.get("content-type") || "";
    let action = new URL(req.url).searchParams.get("action") || "";
    let body: any = {}, form: FormData | null = null;
    if (ctype.includes("multipart/form-data")) { form = await req.formData(); action = String(form.get("action") || action); }
    else if (req.method === "POST") { body = await req.json().catch(() => ({})); action = body.action || action; }

    // ---- public reads (no secrets, no personal data) ----
    if (action === "cycles") {
      const list = await loadCycles();
      return json({ cycles: list.map(publicCycle), current: (() => { const c = pickCurrent(list); return c ? publicCycle(c) : null; })() });
    }
    if (action === "vapid_public") {
      const k = Deno.env.get("VAPID_PUBLIC_KEY") || "";
      if (!k) throw new HttpError(503, "Result reminders are not configured yet.");
      return json({ publicKey: k });
    }

    // ---- everything below requires the caller's Supabase access token ----
    const who = await identify(req);

    if (action === "subscribe") {
      if (!who.isTeacher && !who.isAdmin) throw new HttpError(403, "Result reminders are for teachers.");
      const s = body.subscription || {};
      const endpoint = String(s.endpoint || ""), p256dh = s.keys?.p256dh, auth = s.keys?.auth;
      if (!/^https:\/\//.test(endpoint) || !p256dh || !auth) throw new HttpError(400, "Invalid push subscription.");
      const { error } = await admin.from("school_push_subscriptions").upsert({
        user_id: who.userId, endpoint, p256dh, auth,
        content_encoding: String(body.contentEncoding || "aes128gcm"), active: true, last_seen_at: new Date().toISOString(),
      }, { onConflict: "endpoint" });
      if (error) throw new HttpError(500, "The reminder subscription could not be saved.");
      return json({ ok: true });
    }

    if (action === "teacher_status") {
      const list = await loadCycles();
      const cur = pickCurrent(list);
      const { data: subs } = await admin.from("school_teacher_result_submissions")
        .select("id,cycle_id,class_name,subjects,original_file_name,status,uploaded_at,reviewed_at,review_note")
        .eq("teacher_user_id", who.userId).order("uploaded_at", { ascending: false }).limit(200);
      const { data: classes } = await admin.from("school_teacher_class_assignments").select("class_name").eq("teacher_user_id", who.userId);
      const { count } = await admin.from("school_push_subscriptions").select("id", { count: "exact", head: true }).eq("user_id", who.userId).eq("active", true);
      return json({
        staff_id: who.staffId, is_teacher: who.isTeacher, is_admin: who.isAdmin,
        current: cur ? publicCycle(cur) : null, cycles: list.map(publicCycle),
        classes: (classes || []).map((c: any) => c.class_name), submissions: subs || [], reminders_enabled: (count || 0) > 0,
      });
    }

    if (action === "upload") {
      if (!form) throw new HttpError(400, "Send the result as a form upload.");
      if (!who.isTeacher && !who.isAdmin) throw new HttpError(403, "Only teachers can submit results.");
      if (!who.staffId) throw new HttpError(403, "Your staff ID is not linked yet. Contact the school administrator.");
      const cycleId = String(form.get("cycle_id") || ""), cls = String(form.get("class_name") || "");
      const notes = String(form.get("notes") || "").slice(0, 2000);
      let subjects: string[] = [];
      try { subjects = JSON.parse(String(form.get("subjects") || "[]")); } catch (_) {}
      subjects = (Array.isArray(subjects) ? subjects : []).map((x) => String(x).slice(0, 80)).filter(Boolean).slice(0, 40);
      const file = form.get("file");
      if (!(file instanceof File)) throw new HttpError(400, "Attach the result document.");
      if (!CLASSES.includes(cls)) throw new HttpError(400, "Choose a valid class.");
      if (!subjects.length) throw new HttpError(400, "Select at least one subject.");
      if (file.size <= 0 || file.size > MAX_BYTES) throw new HttpError(400, "The document must be between 1 byte and 15 MB.");
      if (!ALLOWED_MIME.includes(file.type)) throw new HttpError(400, "Upload a PDF or an image (JPG, PNG, WEBP).");

      const { data: cyc } = await admin.from("school_result_cycles_live").select("*").eq("id", cycleId).maybeSingle();
      if (!cyc) throw new HttpError(404, "That result cycle does not exist.");
      if (!["open", "extended"].includes(cyc.effective_status) && !who.isAdmin) {
        throw new HttpError(409, `${cyc.title} is ${cyc.effective_status}. Submissions are not accepted unless an administrator extends or reopens it.`);
      }
      if (Deno.env.get("SCL_RESULTS_ENFORCE_CLASS") !== "false" && !who.isAdmin) {
        const { data: ok } = await admin.from("school_teacher_class_assignments").select("id")
          .eq("teacher_user_id", who.userId).eq("class_name", cls).maybeSingle();
        if (!ok) throw new HttpError(403, `You are not assigned to ${cls}. Ask an administrator to assign the class.`);
      }
      const safe = file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 100);
      const path = `${cyc.session.replace("/", "-")}/${cyc.term.replace(/\s+/g, "-")}/cycle-${cyc.cycle_number}/${who.userId}/${Date.now()}-${safe}`;
      const up = await admin.storage.from("result-uploads").upload(path, file, { contentType: file.type, upsert: false });
      if (up.error) throw new HttpError(500, "The document could not be stored. Please try again.");
      const { data: row, error } = await admin.from("school_teacher_result_submissions").insert({
        cycle_id: cyc.id, teacher_user_id: who.userId, teacher_staff_id: who.staffId, class_name: cls, subjects,
        original_file_name: file.name.slice(0, 200), storage_path: path, file_size: file.size, mime_type: file.type,
        notes: notes || null, status: "submitted",
      }).select("id,status,uploaded_at").single();
      if (error) { await admin.storage.from("result-uploads").remove([path]); throw new HttpError(500, "The submission record could not be saved."); }
      return json({ ok: true, submission: row, message: "Result submitted successfully. It is awaiting administrator review." });
    }

    // ---- administrator actions ----
    if (!who.isAdmin) throw new HttpError(403, "Administrator access is required.");

    if (action === "admin_list") {
      let q = admin.from("school_teacher_result_submissions")
        .select("id,cycle_id,teacher_user_id,teacher_staff_id,class_name,subjects,original_file_name,storage_path,file_size,notes,status,uploaded_at,reviewed_at,review_note")
        .order("uploaded_at", { ascending: false }).limit(500);
      if (body.cycle_id) q = q.eq("cycle_id", body.cycle_id);
      if (body.status) q = q.eq("status", body.status);
      const { data, error } = await q;
      if (error) throw new HttpError(500, "Submissions could not be loaded.");
      const rows = await Promise.all((data || []).map(async (r: any) => {
        const { data: s } = await admin.storage.from("result-uploads").createSignedUrl(r.storage_path, 600);
        const { storage_path, ...rest } = r;
        return { ...rest, file_url: s?.signedUrl || null };
      }));
      return json({ submissions: rows, cycles: (await loadCycles()).map(publicCycle) });
    }

    if (action === "admin_review") {
      const status = String(body.status || "");
      if (!["approved", "rejected", "resubmission_required"].includes(status)) throw new HttpError(400, "Invalid status.");
      const { data, error } = await admin.from("school_teacher_result_submissions").update({
        status, reviewed_by: who.userId, reviewed_at: new Date().toISOString(), review_note: String(body.note || "").slice(0, 1000) || null,
      }).eq("id", body.submission_id).select("id,status").maybeSingle();
      if (error || !data) throw new HttpError(404, "Submission not found.");
      return json({ ok: true, submission: data });
    }

    if (action === "admin_set_cycle") {
      const patch: any = {};
      if (["auto", "closed", "extended"].includes(body.status)) patch.status = body.status;
      if (body.status === "extended") {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.extended_until || ""))) throw new HttpError(400, "Give the new deadline as YYYY-MM-DD.");
        patch.extended_until = body.extended_until;
      }
      if (typeof body.reminder_enabled === "boolean") patch.reminder_enabled = body.reminder_enabled;
      const { error } = await admin.from("school_result_cycles").update(patch).eq("id", body.cycle_id);
      if (error) throw new HttpError(500, "The cycle could not be updated.");
      return json({ ok: true });
    }

    if (action === "admin_assign_classes") {
      const uid = String(body.teacher_user_id || ""); const cls = (body.classes || []).filter((c: string) => CLASSES.includes(c));
      if (!uid) throw new HttpError(400, "teacher_user_id is required.");
      await admin.from("school_teacher_class_assignments").delete().eq("teacher_user_id", uid);
      if (cls.length) await admin.from("school_teacher_class_assignments").insert(cls.map((c: string) => ({ teacher_user_id: uid, class_name: c })));
      return json({ ok: true, classes: cls });
    }

    throw new HttpError(400, "Unknown action.");
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error("scl-results-api", e);
    return json({ error: "Unexpected server error." }, 500);
  }
});
