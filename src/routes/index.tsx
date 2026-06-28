import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Heart, Accessibility, Brain, Scale, Calendar, MapPin, Ticket, ExternalLink, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlatformStats } from "@/components/platform-stats";
import { FeedbackWall } from "@/components/feedback-wall";
import { FeedbackForm } from "@/components/feedback-form";
import { SuggestionForm, SuggestionWall } from "@/components/suggestion-wall";
import { ArticlesPreview } from "@/components/articles-preview";
import { ReadMore } from "@/components/read-more";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PILLARS } from "@/lib/pillars";
import { format } from "date-fns";
import nexusLogo from "@/assets/nexus-logo.jpg.asset.json";
import baLogo from "@/assets/ba-connect-logo.jpg.asset.json";
import heroImage from "@/assets/students-hero.jpg.asset.json";

const PILLAR_ICONS: Record<string, typeof Accessibility> = { Accessibility, Sparkles, Heart, Brain, Scale };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inter–Universities Nexus Platform — Talent. Leadership. Inclusion." },
      { name: "description", content: "Flagship of B.A Connect Organization uniting universities, colleges and tertiary institutions across Kenya and beyond. Talent, leadership, innovation, inclusion." },
      { property: "og:title", content: "Inter–Universities Nexus Platform" },
      { property: "og:description", content: "Uniting students across Kenya and Africa for talent, leadership, innovation and opportunity." },
      { property: "og:image", content: heroImage.url },
      { name: "twitter:image", content: heroImage.url },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: upcoming } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data } = await supabase.from("programs")
        .select("id,title,description,overview,category,event_date,location,ticket_url,ticket_regular,ticket_vip,ticket_vvip,pillar")
        .eq("is_published", true)
        .order("event_date", { ascending: true })
        .limit(3);
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative surface-ink overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={heroImage.url} alt="Students connecting at a Nexus event" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-20 lg:pt-16 lg:pb-28">
          <div className="flex items-center gap-4 mb-8">
            <img src={nexusLogo.url} alt="Inter-Universities Nexus" className="h-20 w-20 sm:h-24 sm:w-24 object-contain bg-ink rounded-lg p-1" />
            <div className="h-16 w-px bg-gold/40" />
            <img src={baLogo.url} alt="B.A Connect Organization" className="h-20 w-20 sm:h-24 sm:w-24 object-contain rounded-lg" />
            <div className="hidden sm:block ml-2 leading-tight">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold/80">A flagship of</p>
              <p className="text-cream font-display text-lg">B.A Connect Organization</p>
            </div>
          </div>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gold/90">
              <Sparkles className="size-3" /> Universities · Colleges · Tertiary Institutions
            </span>
            <h1 className="mt-6 heading-display text-5xl sm:text-6xl lg:text-7xl text-cream">
              One nation. <span className="gold-gradient-text">Every campus.</span><br />Endless potential.
            </h1>
            <p className="mt-6 max-w-xl text-cream/85 text-base sm:text-lg leading-relaxed">
              A vibrant national space for talent, creativity, innovation, inclusion and opportunity — built for students from every corner of Kenya and beyond.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {/* CTA 1 */}
              <Button asChild size="lg" className="bg-gold text-ink hover:bg-gold/90 font-semibold">
                <Link to="/auth">Join the Nexus <ArrowRight className="size-4" /></Link>
              </Button>
              {/* CTA 2 — was blank, now fixed */}
              <Button asChild size="lg" variant="outline" className="border-gold/40 text-cream hover:bg-gold hover:text-ink font-semibold">
                <Link to="/programs">Explore Events <Calendar className="size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-cream hover:bg-white/10">
                <a href="#upcoming">Upcoming events ↓</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-background -mt-12 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <PlatformStats />
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section id="upcoming" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <p className="text-accent text-xs uppercase tracking-[0.25em]">Mark your calendar</p>
              <h2 className="mt-2 heading-display text-4xl sm:text-5xl text-primary">Upcoming & current events</h2>
            </div>
            <Button asChild variant="outline"><Link to="/programs">All events <ArrowRight className="size-4" /></Link></Button>
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            {upcoming?.map(ev => (
              <article key={ev.id} className="rounded-2xl border bg-card overflow-hidden shadow-elegant">
                <div className="h-2 bg-gradient-to-r from-primary via-accent to-gold" />
                <div className="p-6 space-y-3">
                  <span className="text-[10px] uppercase tracking-widest text-accent font-semibold">{ev.category}</span>
                  <h3 className="heading-display text-2xl text-primary">{ev.title}</h3>
                  <ReadMore preview={<p className="text-sm text-muted-foreground">{ev.description}</p>}>
                    <p className="text-sm text-foreground/80">{ev.overview ?? ev.description}</p>
                  </ReadMore>
                  <div className="space-y-1 text-xs text-muted-foreground border-t pt-3">
                    {ev.event_date && <p className="flex items-center gap-2"><Calendar className="size-3.5 text-gold" />{format(new Date(ev.event_date), "PPP")}</p>}
                    {ev.location && <p className="flex items-center gap-2"><MapPin className="size-3.5 text-gold" />{ev.location}</p>}
                  </div>
                  {(ev.ticket_regular || ev.ticket_vip || ev.ticket_vvip) ? (
                    <div className="rounded-lg bg-secondary/60 p-3 text-xs">
                      <p className="font-semibold flex items-center gap-1 text-accent uppercase tracking-widest"><Ticket className="size-3" /> Tickets</p>
                      <p className="mt-1 text-primary">
                        {ev.ticket_regular && <>Regular <b>KSh {ev.ticket_regular.toLocaleString()}</b></>}
                        {ev.ticket_vip && <> · VIP <b>KSh {ev.ticket_vip.toLocaleString()}</b></>}
                        {ev.ticket_vvip && <> · VVIP <b>KSh {ev.ticket_vvip.toLocaleString()}</b></>}
                      </p>
                      <Button asChild size="sm" className="mt-3 w-full bg-gold text-ink hover:bg-gold/90">
                        <Link to="/programs">Register & Get Gate Pass →</Link>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Ticket info to be announced.</p>
                  )}
                </div>
              </article>
            ))}
            {(!upcoming || upcoming.length === 0) && (
              <p className="text-muted-foreground col-span-3">No upcoming events yet. Check back soon.</p>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-16 surface-ink">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-cream">
          <p className="text-gold text-xs uppercase tracking-[0.3em]">About us</p>
          <h2 className="mt-3 heading-display text-4xl sm:text-5xl">A national stage for student excellence</h2>
          <div className="mt-6 text-cream/85 text-base leading-relaxed max-w-3xl">
            <ReadMore label="Read more about the platform" preview={
              <p>The Inter–Universities Nexus Platform, a flagship of <strong className="text-gold">B.A Connect Organization</strong>, brings together students from universities, colleges and tertiary institutions across Kenya and beyond into one vibrant space for talent, creativity, innovation, learning and opportunity.</p>
            }>
              <p className="text-cream/75">It was born from a simple belief: young people possess immense potential, but many lack the right platforms, exposure and mentorship to fully realise it.</p>
              <p className="text-cream/75">More than a showcase, the Nexus is a space for purposeful engagement — forums, summits, exhibitions, mentorship and competitions tackling the issues shaping our generation.</p>
            </ReadMore>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-gold text-ink hover:bg-gold/90"><Link to="/about">Full About page</Link></Button>
            <Button asChild variant="outline" className="border-gold/40 text-cream hover:bg-gold hover:text-ink"><a href="https://baconnect.org" target="_blank" rel="noreferrer">B.A Connect Org. website <ExternalLink className="size-4" /></a></Button>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-accent text-xs uppercase tracking-[0.25em]">What we champion</p>
            <h2 className="mt-3 heading-display text-4xl sm:text-5xl text-primary">Five pillars. One generation.</h2>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PILLARS.map(p => {
              const Icon = PILLAR_ICONS[p.icon] ?? Sparkles;
              return (
                <Link key={p.slug} to="/pillars" hash={p.slug} className="group rounded-xl border p-6 hover:border-gold transition bg-card">
                  <div className={`size-12 rounded-lg bg-gradient-to-br ${p.accent} grid place-items-center text-white`}><Icon className="size-6" /></div>
                  <h3 className="mt-4 font-display text-xl text-primary">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">{p.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent group-hover:text-primary">Read more <ArrowRight className="size-3" /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* VOTE CTA */}
      <section className="py-16 bg-secondary">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <Quote className="mx-auto size-8 text-accent" />
          <h2 className="mt-4 heading-display text-3xl sm:text-4xl text-primary">Which university speaks for your generation?</h2>
          <p className="mt-3 text-muted-foreground">Cast your vote. No sign-up. Live results.</p>
          <Button asChild size="lg" className="mt-6 bg-primary text-primary-foreground"><Link to="/vote">Vote for the best university →</Link></Button>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <p className="text-accent text-xs uppercase tracking-[0.25em]">From the Nexus desk</p>
              <h2 className="mt-2 heading-display text-4xl text-primary">Articles & announcements</h2>
            </div>
            <Button asChild variant="outline"><Link to="/articles">All articles <ArrowRight className="size-4" /></Link></Button>
          </div>
          <ArticlesPreview limit={4} />
        </div>
      </section>

      {/* FEEDBACK + SUGGESTIONS */}
      <section className="py-20 surface-ink">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-gold text-xs uppercase tracking-[0.25em]">Your voice</p>
          <h2 className="mt-2 heading-display text-4xl text-cream">Talk to us. Tell us what's next.</h2>
          <p className="mt-3 text-cream/70 max-w-xl">Two walls. One conversation.</p>
          <Tabs defaultValue="feedback" className="mt-10">
            <TabsList className="bg-white/5 border border-gold/30">
              <TabsTrigger value="feedback" className="data-[state=active]:bg-gold data-[state=active]:text-ink">Feedback Wall</TabsTrigger>
              <TabsTrigger value="suggestions" className="data-[state=active]:bg-gold data-[state=active]:text-ink">Suggestion Wall</TabsTrigger>
            </TabsList>
            <TabsContent value="feedback" className="mt-6 space-y-8">
              <div className="max-w-2xl"><FeedbackForm /></div>
              <FeedbackWall limit={6} />
              <div className="text-right"><Button asChild variant="outline" className="border-gold/40 text-cream hover:bg-gold hover:text-ink"><Link to="/feedback">View all comments <ArrowRight className="size-4" /></Link></Button></div>
            </TabsContent>
            <TabsContent value="suggestions" className="mt-6 space-y-8">
              <div className="max-w-2xl"><SuggestionForm /></div>
              <SuggestionWall limit={6} />
              <div className="text-right"><Button asChild variant="outline" className="border-gold/40 text-cream hover:bg-gold hover:text-ink"><Link to="/suggestions">View all suggestions <ArrowRight className="size-4" /></Link></Button></div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* PARTNER CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 rounded-3xl border-2 border-gold/40 bg-card p-8 sm:p-12 text-center shadow-gold">
          <p className="text-accent text-xs uppercase tracking-[0.25em]">Partner with us</p>
          <h2 className="mt-3 heading-display text-3xl sm:text-4xl text-primary">Build the future of Kenyan youth with us.</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Organisations, institutions and companies — sponsor, mentor, host or co-create.</p>
          <Button asChild size="lg" className="mt-6 bg-primary text-primary-foreground"><Link to="/partner">Become a partner →</Link></Button>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 sm:py-24 bg-secondary">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Heart className="mx-auto size-8 text-accent" />
          <h2 className="mt-4 heading-display text-4xl sm:text-5xl text-primary">Your campus. Your voice. Your stage.</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Join thousands of students building Kenya's most ambitious youth platform.</p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90"><Link to="/auth">Create your Member ID</Link></Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
