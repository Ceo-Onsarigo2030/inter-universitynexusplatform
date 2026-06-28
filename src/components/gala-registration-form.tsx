import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Ticket, Sparkles } from "lucide-react";

function genPassId() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `UNC-2026-${s}`;
}

export function GalaRegistrationForm({ programId }: { programId?: string }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    institution: "",
    phone: "",
    ticket_tier: "regular",
  });

  const register = useMutation({
    mutationFn: async () => {
      const pass_id = genPassId();

      // 1. Insert registration into DB
      const { data, error } = await supabase
        .from("gala_registrations")
        .insert({ ...form, pass_id, program_id: programId ?? null })
        .select("pass_id")
        .single();

      if (error) throw error;

      // 2. Fire email gate pass (non-blocking — don't throw if email fails)
      try {
        const emailRes = await supabase.functions.invoke("send-gala-pass", {
          body: {
            pass_id: data.pass_id,
            full_name: form.full_name,
            email: form.email,
            institution: form.institution,
            ticket_tier: form.ticket_tier,
          },
        });
        if (emailRes.error) {
          console.warn("Gate pass email failed (non-fatal):", emailRes.error);
        }
      } catch (emailErr) {
        console.warn("Gate pass email exception (non-fatal):", emailErr);
      }

      return data.pass_id as string;
    },
    onSuccess: (pass_id) => {
      toast.success("🎟️ Gate pass issued! Check your email — your Digital Attendance Card has been sent.");
      navigate({ to: "/gala-pass/$passId", params: { passId: pass_id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        register.mutate();
      }}
      className="rounded-xl border border-gold/30 bg-ink p-5 mt-4 space-y-3"
    >
      <div className="flex items-center gap-2 text-gold">
        <Sparkles className="size-4" />
        <p className="text-xs uppercase tracking-[0.25em] font-semibold">
          Generate your digital gate pass
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-cream/80 text-xs">Full name</Label>
          <Input
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="bg-white/5 border-gold/30 text-cream"
            placeholder="Your full name"
          />
        </div>
        <div>
          <Label className="text-cream/80 text-xs">Email</Label>
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-white/5 border-gold/30 text-cream"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <Label className="text-cream/80 text-xs">Institution</Label>
          <Input
            value={form.institution}
            onChange={(e) => setForm({ ...form, institution: e.target.value })}
            className="bg-white/5 border-gold/30 text-cream"
            placeholder="Your university / college"
          />
        </div>
        <div>
          <Label className="text-cream/80 text-xs">Phone (optional)</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="bg-white/5 border-gold/30 text-cream"
            placeholder="+254..."
          />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-cream/80 text-xs">Ticket tier</Label>
          <Select
            value={form.ticket_tier}
            onValueChange={(v) => setForm({ ...form, ticket_tier: v })}
          >
            <SelectTrigger className="bg-white/5 border-gold/30 text-cream">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="vvip">VVIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={register.isPending}
        className="w-full bg-gold text-ink hover:bg-gold/90 font-semibold"
      >
        <Ticket className="size-4" />
        {register.isPending ? "Issuing pass…" : "Issue my Gate Pass"}
      </Button>

      <p className="text-[11px] text-cream/55 leading-relaxed">
        Your printable Digital Attendance Card opens immediately after submitting and is sent to
        your email. Keep it on your phone or print it — <strong className="text-cream/75">no card, no entry.</strong>
      </p>
    </form>
  );
}
