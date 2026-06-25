import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Search, ShieldCheck, Newspaper } from "lucide-react";

export const Route = createFileRoute("/articles")({
  head: () => ({ meta: [
    { title: "Articles & News — Inter–Universities Nexus" },
    { name: "description", content: "Articles, announcements, policy notes and stories from the Nexus." },
    { property: "og:title", content: "Articles & News — Inter–Universities Nexus" },
    { property: "og:description", content: "Read the latest from the Inter–Universities Nexus Platform." },
  ]}),
  component: ArticlesPage,
});

function ArticlesPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["articles-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("articles").select("*").eq("status", "published").order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data ?? [];
    return (data ?? []).filter(a => (a.title + " " + (a.excerpt ?? "") + " " + a.body + " " + a.category).toLowerCase().includes(s));
  }, [q, data]);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="surface-ink py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-gold text-xs uppercase tracking-[0.3em]">Articles & News</p>
          <h1 className="mt-3 heading-display text-5xl text-cream">Stories, ideas & announcements</h1>
          <p className="mt-4 text-cream/70 max-w-xl">Written by admins of the Inter–Universities Nexus Platform. Includes policies, event updates and student voices.</p>
          <div className="mt-6 max-w-md relative">
            <Search className="absolute left-3 top-2.5 size-4 text-cream/50" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search articles…" className="pl-9 bg-white/5 border-gold/30 text-cream placeholder:text-cream/40" />
          </div>
        </div>
      </section>
      <section className="py-12 flex-1">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : (
            filtered.length === 0 ? <p className="text-muted-foreground">No articles match your search.</p> : (
              <div className="grid gap-4">
                {filtered.map(a => (
                  <Link key={a.id} to="/articles/$slug" params={{ slug: a.slug }} className="rounded-2xl border bg-card p-6 shadow-elegant hover:shadow-gold transition group">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-accent font-semibold">
                      {a.category === "policy" ? <ShieldCheck className="size-3.5" /> : <Newspaper className="size-3.5" />}
                      {a.category}
                    </div>
                    <h2 className="heading-display text-2xl text-primary mt-2 group-hover:underline">{a.title}</h2>
                    {a.excerpt && <p className="mt-2 text-sm text-muted-foreground">{a.excerpt}</p>}
                    <p className="mt-3 text-xs text-muted-foreground">{a.published_at ? format(new Date(a.published_at), "PPP") : ""}</p>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}