import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Payload {
  campaign_id: string;
  subject: string;
  body_html: string;
  audience: "all" | "members" | "gala_registrants" | "partners";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const authHeader = req.headers.get("Authorization") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const userClient = createClient(SUPABASE_URL, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });

    const { campaign_id, subject, body_html, audience } = (await req.json()) as Payload;

    // Recipients: { email, full_name }
    const recipients: { email: string; name: string }[] = [];

    if (audience === "all" || audience === "members") {
      const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const ids = (users?.users ?? []).filter(u => u.email).map(u => u.id);
      const { data: profiles } = await admin.from("profiles").select("id, full_name").in("id", ids);
      const nameMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.full_name]));
      for (const u of users?.users ?? []) {
        if (u.email) recipients.push({ email: u.email, name: nameMap[u.id] ?? "Comrade" });
      }
    }
    if (audience === "all" || audience === "gala_registrants") {
      const { data } = await admin.from("gala_registrations").select("email, full_name");
      for (const r of data ?? []) {
        if (r.email && !recipients.find(x => x.email === r.email)) {
          recipients.push({ email: r.email, name: r.full_name ?? "Comrade" });
        }
      }
    }
    if (audience === "all" || audience === "partners") {
      const { data } = await admin.from("partner_inquiries").select("email, name");
      for (const r of data ?? []) {
        if (r.email && !recipients.find(x => x.email === r.email)) {
          recipients.push({ email: r.email, name: r.name ?? "Partner" });
        }
      }
    }

    const FROM = Deno.env.get("CAMPAIGN_FROM") ?? "UniNexus Connect <onboarding@resend.dev>";
    const BATCH = 50;
    let sent = 0;
    const errors: string[] = [];

    for (let i = 0; i < recipients.length; i += BATCH) {
      const batch = recipients.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async ({ email, name }) => {
          // Replace {{full_name}} with real name
          const personalised_html = body_html.replace(/\{\{full_name\}\}/gi, name);
          const personalised_subject = subject.replace(/\{\{full_name\}\}/gi, name);
          try {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({ from: FROM, to: [email], subject: personalised_subject, html: personalised_html }),
            });
            if (res.ok) sent += 1;
            else errors.push(`${email}: ${res.status}`);
          } catch (e) {
            errors.push(`${email}: ${(e as Error).message}`);
          }
        }),
      );
    }

    await admin.from("email_campaigns").update({ recipient_count: sent }).eq("id", campaign_id);

    return new Response(JSON.stringify({ sent, total: recipients.length, errors: errors.slice(0, 5) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-campaign error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
