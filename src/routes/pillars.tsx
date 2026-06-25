import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PILLARS } from "@/lib/pillars";
import { ReadMore } from "@/components/read-more";
import { Accessibility, Sparkles, Heart, Brain, Scale, Calendar } from "lucide-react";

const ICONS: Record<string, typeof Accessibility> = { Accessibility, Sparkles, Heart, Brain, Scale };

export const Route = createFileRoute("/pillars")({
  head: () => ({ meta: [
    { title: "Pillars — What we champion" },
    { name: "description", content: "Disability inclusion, talent & innovation, gender equity, mental wellness, and civic leadership — the five pillars of the Nexus." },
    { property: "og:title", content: "Pillars — Inter–Universities Nexus" },
    { property: "og:description", content: "The five pillars guiding everything we do." },
  ]}),
  component: PillarsPage,
});

function PillarsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="surface-ink py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-gold text-xs uppercase tracking-[0.3em]">What we champion</p>
          <h1 className="mt-3 heading-display text-5xl sm:text-6xl text-cream">The five pillars of the Nexus</h1>
          <p className="mt-4 text-cream/70 max-w-2xl">Every program, partnership and event we run sits under one of these five commitments. Each one is researched, intentional and built with students at the centre.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
          {PILLARS.map((p, i) => {
            const Icon = ICONS[p.icon] ?? Sparkles;
            return (
              <article id={p.slug} key={p.slug} className="rounded-2xl border bg-card overflow-hidden shadow-elegant">
                <div className={`h-2 bg-gradient-to-r ${p.accent}`} />
                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-lg bg-ink text-gold grid place-items-center flex-none"><Icon className="size-6" /></div>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-widest text-accent font-semibold">Pillar #{i + 1}</p>
                      <h2 className="heading-display text-3xl text-primary mt-1">{p.title}</h2>
                      <p className="text-sm italic text-muted-foreground">{p.tagline}</p>
                    </div>
                  </div>
                  <div className="mt-5 text-foreground leading-relaxed">
                    <ReadMore preview={<p>{p.summary}</p>} label="Read deeper">
                      <p className="text-muted-foreground">{p.deep}</p>
                    </ReadMore>
                  </div>
                  <div className="mt-6 border-t pt-5">
                    <p className="text-[10px] uppercase tracking-widest text-accent font-semibold mb-3 flex items-center gap-1"><Calendar className="size-3.5" /> Events under this pillar</p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {p.events.map(ev => (
                        <div key={ev.title} className="rounded-lg border bg-secondary/40 p-4">
                          <p className="font-display text-base text-primary">{ev.title}</p>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{ev.when}</p>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{ev.what}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}