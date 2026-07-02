import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = await req.json();
    const callback = body?.Body?.stkCallback;
    if (!callback) return new Response("Bad payload", { status: 400 });

    const checkoutRequestId: string = callback.CheckoutRequestID;
    const resultCode: number = callback.ResultCode;
    const resultDesc: string = callback.ResultDesc;

    if (resultCode === 0) {
      // ✅ PAYMENT SUCCESS
      const items: Array<{ Name: string; Value: unknown }> =
        callback.CallbackMetadata?.Item ?? [];
      const get = (name: string) =>
        items.find((i) => i.Name === name)?.Value;

      const mpesaReceipt = String(get("MpesaReceiptNumber") ?? "");
      const amountPaid = Number(get("Amount") ?? 0);
      const phone = String(get("PhoneNumber") ?? "");

      // Update payment record
      const { data: payment } = await admin
        .from("mpesa_payments")
        .update({
          status: "success",
          mpesa_receipt: mpesaReceipt,
          result_desc: resultDesc,
          confirmed_at: new Date().toISOString(),
        })
        .eq("checkout_request_id", checkoutRequestId)
        .select()
        .single();

      if (payment) {
        // Generate gate pass ID
        const passId =
          "UNC-" +
          new Date().getFullYear() +
          "-" +
          Math.random().toString(36).toUpperCase().slice(2, 8);

        // Create gate pass registration
        await admin.from("gala_registrations").insert({
          pass_id: passId,
          full_name: payment.full_name ?? "Ticket Holder",
          email: payment.email ?? "",
          institution: payment.institution ?? "",
          phone: phone,
          ticket_tier: payment.ticket_tier,
          program_id: payment.program_id,
          user_id: payment.user_id,
          payment_id: payment.id,
          payment_verified: true,
        });

        // Send confirmation email if email exists
        if (payment.email && RESEND_API_KEY) {
          const tierPrices: Record<string, number> = {
            regular: 1500, vip: 3000, vvip: 5000,
          };
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "UniNexus Connect <onboarding@resend.dev>",
              to: [payment.email],
              subject: `✅ Payment Confirmed — Your Gate Pass is Ready! | UniNexus Gala 2026`,
              html: `
                <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0a0a0a;color:#f5f0e8;padding:32px;border-radius:16px;">
                  <h1 style="color:#D4AF37;">Payment Confirmed! 🎉</h1>
                  <p>Dear ${payment.full_name ?? "Comrade"},</p>
                  <p>Your payment of <strong>KSh ${amountPaid.toLocaleString()}</strong> has been received successfully.</p>
                  <div style="background:#1a1a1a;border:1px solid #D4AF37;border-radius:8px;padding:16px;margin:16px 0;">
                    <p><strong style="color:#D4AF37;">M-Pesa Receipt:</strong> ${mpesaReceipt}</p>
                    <p><strong style="color:#D4AF37;">Gate Pass ID:</strong> ${passId}</p>
                    <p><strong style="color:#D4AF37;">Ticket Tier:</strong> ${payment.ticket_tier.toUpperCase()}</p>
                    <p><strong style="color:#D4AF37;">Event:</strong> Inter-Universities Nexus Gala Awards 2026</p>
                    <p><strong style="color:#D4AF37;">Date:</strong> November 6, 2026 — 5:00 PM</p>
                    <p><strong style="color:#D4AF37;">Venue:</strong> KISE, Kasarani, Nairobi</p>
                  </div>
                  <p>Your digital gate pass is now unlocked. Visit the event page to access it.</p>
                  <a href="https://inter-universitynexusplatform.vercel.app/programs" 
                     style="display:inline-block;background:#D4AF37;color:#0a0a0a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;">
                    View My Gate Pass
                  </a>
                  <p style="margin-top:24px;color:#888;font-size:12px;">B.A Connect Organization | UniNexus Connect Platform</p>
                </div>
              `,
            }),
          });
        }
      }
    } else {
      // ❌ PAYMENT FAILED
      await admin
        .from("mpesa_payments")
        .update({ status: "failed", result_desc: resultDesc })
        .eq("checkout_request_id", checkoutRequestId);
    }

    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("mpesa-callback error:", e);
    return new Response("Internal error", { status: 500 });
  }
});
