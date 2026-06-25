import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Handshake, Mail } from "lucide-react";

export function PartnerForm() {
  const [form, setForm] = useState({ organization: "", contact_name: "", email: "", phone: "", partnership_type: "Sponsorship", message: "", proposal_url: "" });

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("partner_inquiries").insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Inquiry received. We will email you within 3 working days.");
      setForm({ organization: "", contact_name: "", email: "", phone: "", partnership_type: "Sponsorship", message: "", proposal_url: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mailto = `mailto:uninexusplatformke@gmail.com?subject=${encodeURIComponent("Partnership proposal: " + (form.organization || "[organization]"))}&body=${encodeURIComponent(form.message)}`;

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit.mutate(); }} className="rounded-2xl border bg-card p-6 sm:p-8 shadow-elegant space-y-5">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-lg bg-ink text-gold grid place-items-center"><Handshake className="size-6" /></div>
        <div>
          <h3 className="heading-display text-2xl text-primary">Partner with the Nexus</h3>
          <p className="text-sm text-muted-foreground">Organisations, institutions & companies — let's build the future together.</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label>Organisation</Label><Input required value={form.organization} onChange={e => setForm({...form, organization: e.target.value})} /></div>
        <div className="space-y-1.5"><Label>Contact person</Label><Input required value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} /></div>
        <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
        <div className="space-y-1.5"><Label>Phone (optional)</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label>Partnership type</Label>
          <Select value={form.partnership_type} onValueChange={v => setForm({...form, partnership_type: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Sponsorship","Strategic Partner","Media Partner","Venue Partner","CSR Collaboration","Mentorship","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2"><Label>Proposal URL (optional)</Label><Input type="url" placeholder="https://drive.google.com/…  or Dropbox/OneDrive link" value={form.proposal_url} onChange={e => setForm({...form, proposal_url: e.target.value})} /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label>Tell us about your proposal</Label><Textarea rows={5} required value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="What do you want to partner on? Any timelines or budget ranges we should know?" /></div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submit.isPending} className="bg-primary text-primary-foreground">{submit.isPending ? "Submitting…" : "Submit inquiry"}</Button>
        <Button type="button" asChild variant="outline"><a href={mailto}><Mail className="size-4" /> Or email directly</a></Button>
      </div>
      <p className="text-xs text-muted-foreground">Attach proposals via a link (Drive, Dropbox, OneDrive). For confidential proposals email <a className="underline" href="mailto:uninexusplatformke@gmail.com">uninexusplatformke@gmail.com</a> directly.</p>
    </form>
  );
}