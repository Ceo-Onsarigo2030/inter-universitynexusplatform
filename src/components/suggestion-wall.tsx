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
      className="rounded-xl border bg-card p-6 shadow-elegant space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label>Your name</Label><Input value={name} onChange={e => setName(e.target.value)} required maxLength={100} /></div>
        <div className="space-y-1.5"><Label>University (optional)</Label><Input value={university} onChange={e => setUniversity(e.target.value)} maxLength={120} /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5"><Label>What should we do next?</Label><Textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} required maxLength={2000} placeholder="Suggest an event, program or improvement…" /></div>
      <Button type="submit" disabled={submit.isPending} className="bg-primary text-primary-foreground">{submit.isPending ? "Posting…" : "Post suggestion"}</Button>
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
  if (isLoading) return <p className="text-muted-foreground text-sm">Loading suggestions…</p>;
  if (!data?.length) return <p className="text-muted-foreground text-sm">Be the first to suggest something.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map(s => (
        <article key={s.id} className="rounded-xl border bg-card p-5 shadow-elegant relative">
          <Lightbulb className="absolute -top-2 -right-2 size-12 text-gold/10" />
          <p className="text-[10px] uppercase tracking-widest text-accent font-semibold">{s.category}</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{s.message}</p>
          <div className="mt-4 pt-3 border-t flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">{s.name}</p>
              {s.university && <p className="text-xs text-muted-foreground">{s.university}</p>}
            </div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}</p>
          </div>
        </article>
      ))}
    </div>
  );
}