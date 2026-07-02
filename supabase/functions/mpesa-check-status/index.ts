import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { checkout_request_id } = await req.json();
    if (!checkout_request_id) {
      return new Response(
        JSON.stringify({ error: "checkout_request_id required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: payment } = await admin
      .from("mpesa_payments")
      .select("id, status, mpesa_receipt, ticket_tier, confirmed_at")
      .eq("checkout_request_id", checkout_request_id)
      .single();

    if (!payment) {
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    // If success, get the gate pass
    let pass = null;
    if (payment.status === "success") {
      const { data } = await admin
        .from("gala_registrations")
        .select("pass_id, ticket_tier, full_name")
        .eq("payment_id", payment.id)
        .single();
      pass = data;
    }

    return new Response(
      JSON.stringify({ status: payment.status, receipt: payment.mpesa_receipt, pass }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
