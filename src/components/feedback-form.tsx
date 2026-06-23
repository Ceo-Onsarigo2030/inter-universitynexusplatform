import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function FeedbackForm({ defaultName = "", defaultUniversity = "", userId }: { defaultName?: string; defaultUniversity?: string; userId?: string | null }) {
  const [name, setName] = useState(defaultName);
  const [university, setUniversity] = useState(defaultUniversity);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 3) { toast.error("Message must be at least 3 characters"); return; }
    if (name.trim().length < 1) { toast.error("Please enter your name"); return; }
    setLoading(true);
    const { error } = await supabase.from("feedback").insert({
      name: name.trim(), university: university.trim() || null, message: message.trim(), user_id: userId ?? null,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Thank you! Your feedback is on the wall.");
    setMessage("");
    qc.invalidateQueries({ queryKey: ["feedback"] });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-6 shadow-elegant">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label htmlFor="fb-name">Name</Label><Input id="fb-name" value={name} onChange={e => setName(e.target.value)} maxLength={100} required /></div>
        <div className="space-y-1.5"><Label htmlFor="fb-uni">University (optional)</Label><Input id="fb-uni" value={university} onChange={e => setUniversity(e.target.value)} maxLength={120} /></div>
      </div>
      <div className="space-y-1.5"><Label htmlFor="fb-msg">Your feedback or comment</Label><Textarea id="fb-msg" value={message} onChange={e => setMessage(e.target.value)} rows={4} maxLength={2000} required placeholder="Share your story, ideas or feedback…" /></div>
      <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">{loading ? "Posting…" : "Post to the wall"}</Button>
    </form>
  );
}
