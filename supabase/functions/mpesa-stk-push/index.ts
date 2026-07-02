import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const CONSUMER_KEY = Deno.env.get("MPESA_CONSUMER_KEY")!;
    const CONSUMER_SECRET = Deno.env.get("MPESA_CONSUMER_SECRET")!;
    const SHORTCODE = Deno.env.get("MPESA_SHORTCODE") ?? "174379";
    const PASSKEY = Deno.env.get("MPESA_PASSKEY")!;
    const CALLBACK_URL = Deno.env.get("MPESA_CALLBACK_URL")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const {
      phone, amount, ticket_tier,
      program_id, user_id,
      full_name, email, institution
    } = await req.json();

    if (!phone || !amount || !ticket_tier || !program_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: phone, amount, ticket_tier, program_id" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Format phone: 07XX → 2547XX or 01XX → 2541XX
    const formattedPhone = phone
      .replace(/\s/g, "")
      .replace(/^\+/, "")
      .replace(/^0/, "254");

    // Step 1 — Get access token
    const auth = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
    const tokenRes = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
      return new Response(
        JSON.stringify({ error: "Failed to get M-Pesa token", detail: tokenData }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Step 2 — Build STK push password
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);
    const password = btoa(`${SHORTCODE}${PASSKEY}${timestamp}`);

    // Step 3 — Send STK Push
    const stkRes = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          BusinessShortCode: SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: formattedPhone,
          PartyB: SHORTCODE,
          PhoneNumber: formattedPhone,
          CallBackURL: CALLBACK_URL,
          AccountReference: "UniNexus",
          TransactionDesc: `${ticket_tier.toUpperCase()} Ticket`,
        }),
      }
    );

    const stkData = await stkRes.json();

    if (stkData.ResponseCode !== "0") {
      return new Response(
        JSON.stringify({ error: stkData.errorMessage ?? stkData.ResponseDescription ?? "STK push failed", raw: stkData }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Step 4 — Save pending payment
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: payment, error: dbErr } = await admin
      .from("mpesa_payments")
      .insert({
        checkout_request_id: stkData.CheckoutRequestID,
        merchant_request_id: stkData.MerchantRequestID,
        phone: formattedPhone,
        amount,
        program_id,
        user_id: user_id ?? null,
        ticket_tier,
        status: "pending",
        full_name: full_name ?? null,
        email: email ?? null,
        institution: institution ?? null,
      })
      .select()
      .single();

    if (dbErr) throw dbErr;

    return new Response(
      JSON.stringify({
        success: true,
        checkout_request_id: stkData.CheckoutRequestID,
        payment_id: payment.id,
        message: "STK push sent! Check your phone and enter your M-Pesa PIN.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("mpesa-stk-push error:", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
