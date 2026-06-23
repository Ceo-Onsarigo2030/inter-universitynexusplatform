import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Quote } from "lucide-react";

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

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading feedback…</p>;
  if (!data?.length) return <p className="text-muted-foreground text-sm">Be the first to leave a comment.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map(f => (
        <article key={f.id} className="rounded-xl border bg-card p-5 shadow-elegant relative overflow-hidden">
          <Quote className="absolute -top-2 -right-2 size-16 text-gold/10" />
          <p className="text-sm leading-relaxed text-foreground">{f.message}</p>
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">{f.name}</p>
              {f.university && <p className="text-xs text-muted-foreground">{f.university}</p>}
            </div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{formatDistanceToNow(new Date(f.created_at), { addSuffix: true })}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
