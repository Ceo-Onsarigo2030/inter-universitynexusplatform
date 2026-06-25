import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

export function ArticlesPreview({ limit = 4 }: { limit?: number }) {
  const { data } = useQuery({
    queryKey: ["articles-preview", limit],
    queryFn: async () => {
      const { data, error } = await supabase.from("articles")
        .select("id,title,slug,excerpt,category,published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
  if (!data?.length) return null;
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {data.map(a => (
        <Link key={a.id} to="/articles/$slug" params={{ slug: a.slug }} className="rounded-2xl border bg-card p-6 shadow-elegant hover:shadow-gold transition group">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-accent font-semibold">
            {a.category === "policy" && <ShieldCheck className="size-3.5" />}
            {a.category}
          </div>
          <h3 className="heading-display text-2xl text-primary mt-2 group-hover:underline">{a.title}</h3>
          {a.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{a.excerpt}</p>}
          <p className="mt-3 text-xs text-muted-foreground">{a.published_at ? format(new Date(a.published_at), "PP") : ""}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">Read article <ArrowRight className="size-4" /></span>
        </Link>
      ))}
    </div>
  );
}