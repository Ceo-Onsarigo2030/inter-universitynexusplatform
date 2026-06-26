import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Lightbulb } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = ["Event idea", "What we should do next", "Programs", "Partnerships", "Accessibility", "Other"];

export function SuggestionForm() {
  const qc = useQueryClient();
  const [name, setName] = useState(""); const [university, setUniversity] = useState("");
  const [category, setCategory] = useState("Event idea"); const [message, setMessage] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("suggestions").insert({
        name: name.trim(), university: university.trim() || null, category, message: message.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Suggestion added to the wall!");
      setMessage("");
      qc.invalidateQueries({ queryKey: ["suggestions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (message.trim().length < 3) return; submit.mutate(); }}
      className="rounded-xl border border-gold/30 bg-ink p-6 shadow-gold space-y-4 text-cream">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label className="text-gold">Your name</Label><Input className="bg-ink border-gold/30 text-cream placeholder:text-cream/40" value={name} onChange={e => setName(e.target.value)} required maxLength={100} /></div>
        <div className="space-y-1.5"><Label className="text-gold">University (optional)</Label><Input className="bg-ink border-gold/30 text-cream placeholder:text-cream/40" value={university} onChange={e => setUniversity(e.target.value)} maxLength={120} /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label className="text-gold">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-ink border-gold/30 text-cream"><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5"><Label className="text-gold">What should we do next?</Label><Textarea className="bg-ink border-gold/30 text-cream placeholder:text-cream/40" rows={4} value={message} onChange={e => setMessage(e.target.value)} required maxLength={2000} placeholder="Suggest an event, program or improvement…" /></div>
      <Button type="submit" disabled={submit.isPending} className="bg-gold text-ink hover:bg-gold/90 font-semibold">{submit.isPending ? "Posting…" : "Post suggestion"}</Button>
    </form>
  );
}

export function SuggestionWall({ limit }: { limit?: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["suggestions", limit],
    queryFn: async () => {
      let q = supabase.from("suggestions").select("*").eq("approved", true).order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
  if (isLoading) return <p className="text-cream/60 text-sm">Loading suggestions…</p>;
  if (!data?.length) return <p className="text-cream/60 text-sm">Be the first to suggest something.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map(s => (
        <article key={s.id} className="rounded-xl border border-gold/30 bg-ink p-5 shadow-gold relative">
          <Lightbulb className="absolute -top-2 -right-2 size-12 text-gold/20" />
          <p className="text-[10px] uppercase tracking-widest text-gold font-semibold">{s.category}</p>
          <p className="mt-2 text-sm leading-relaxed text-cream">{s.message}</p>
          <div className="mt-4 pt-3 border-t border-gold/20 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gold">{s.name}</p>
              {s.university && <p className="text-xs text-cream/60">{s.university}</p>}
            </div>
            <p className="text-[10px] uppercase tracking-wider text-cream/50">{formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}</p>
          </div>
        </article>
      ))}
    </div>
  );
}