import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Quote, Flag } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function FeedbackWall({ limit }: { limit?: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["feedback", limit],
    queryFn: async () => {
      let q = supabase.from("feedback").select("*").eq("approved", true).order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-cream/60 text-sm">Loading feedback…</p>;
  if (!data?.length) return <p className="text-cream/60 text-sm">Be the first to leave a comment.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map(f => (
        <article key={f.id} className="rounded-xl border border-gold/30 bg-ink p-5 shadow-gold relative overflow-hidden">
          <Quote className="absolute -top-2 -right-2 size-16 text-gold/20" />
          <p className="text-sm leading-relaxed text-cream">{f.message}</p>
          <div className="mt-4 pt-4 border-t border-gold/20 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gold">{f.name}</p>
              {f.university && <p className="text-xs text-cream/60">{f.university}</p>}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] uppercase tracking-wider text-cream/50">{formatDistanceToNow(new Date(f.created_at), { addSuffix: true })}</p>
              <ReportButton feedbackId={f.id} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function ReportButton({ feedbackId }: { feedbackId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  async function report() {
    if (reason.trim().length < 3) { toast.error("Tell us briefly what's wrong"); return; }
    setBusy(true);
    const { error } = await supabase.from("feedback_reports").insert({ feedback_id: feedbackId, reason: reason.trim() });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Reported. Admins will review."); setOpen(false); setReason("");
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-destructive" aria-label="Report comment"><Flag className="size-3.5" /></button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Report this comment</DialogTitle></DialogHeader>
        <Textarea rows={4} value={reason} onChange={e => setReason(e.target.value)} placeholder="What is wrong with this comment?" maxLength={500} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={report} disabled={busy} className="bg-destructive text-destructive-foreground">{busy ? "Reporting…" : "Submit report"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
