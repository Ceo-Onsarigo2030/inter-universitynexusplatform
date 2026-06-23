import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Calendar, MapPin, Tag } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/programs")({
  head: () => ({ meta: [
    { title: "Programs & Events — Inter–Universities Nexus" },
    { name: "description", content: "Forums, summits, bootcamps, showcases — explore the programs and events bringing campuses together." },
    { property: "og:title", content: "Programs & Events — Inter–Universities Nexus" },
    { property: "og:description", content: "Summits, forums, bootcamps and showcases for students across Kenya." },
  ]}),
  component: Programs,
});

function Programs() {
  const { data, isLoading } = useQuery({
    queryKey: ["programs", "published"],
    queryFn: async () => {
      const { data, error } = await supabase.from("programs").select("*").eq("is_published", true).order("event_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="surface-ink py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-gold text-xs uppercase tracking-[0.3em]">Programs & Events</p>
          <h1 className="mt-3 heading-display text-5xl sm:text-6xl text-cream">Where conversations<br /> shape a generation.</h1>
          <p className="mt-5 max-w-xl text-cream/75">Summits, forums, bootcamps and showcases designed to equip, connect and elevate Kenya's brightest students.</p>
        </div>
      </section>
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data?.map(p => (
                <article key={p.id} className="rounded-2xl border bg-card overflow-hidden shadow-elegant hover:shadow-gold transition group">
                  <div className="h-2 bg-gradient-to-r from-primary via-accent to-gold" />
                  <div className="p-6 space-y-3">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-accent font-semibold"><Tag className="size-3" />{p.category}</span>
                    <h3 className="heading-display text-2xl text-primary">{p.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-4">{p.description}</p>
                    <div className="pt-3 border-t space-y-1.5 text-xs text-muted-foreground">
                      {p.event_date && <p className="flex items-center gap-2"><Calendar className="size-3.5 text-gold" /> {format(new Date(p.event_date), "PPP")}</p>}
                      {p.location && <p className="flex items-center gap-2"><MapPin className="size-3.5 text-gold" /> {p.location}</p>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          {!isLoading && !data?.length && <p className="text-muted-foreground">No programs published yet. Check back soon.</p>}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
