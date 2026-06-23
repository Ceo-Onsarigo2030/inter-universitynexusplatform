import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Target, Compass, Globe2, BookOpenCheck, Brain, Briefcase, Heart, Megaphone, Lightbulb, Users2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlatformStats } from "@/components/platform-stats";
import { FeedbackWall } from "@/components/feedback-wall";
import { FeedbackForm } from "@/components/feedback-form";
import { Button } from "@/components/ui/button";
import nexusLogo from "@/assets/nexus-logo.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inter–Universities Nexus Platform — Talent. Leadership. Innovation." },
      { name: "description", content: "A national stage uniting universities across Kenya and beyond. Discover talent, build skills, lead, innovate. Flagship of B.A Connect Organization." },
      { property: "og:title", content: "Inter–Universities Nexus Platform" },
      { property: "og:description", content: "Uniting students across Kenya and Africa for talent, leadership, innovation and opportunity." },
    ],
  }),
  component: Index,
});

function Index() {
  const pillars = [
    { icon: Lightbulb, title: "Innovation & AI", text: "Hands-on exposure to emerging tech and AI tools for the next generation." },
    { icon: Briefcase, title: "Entrepreneurship", text: "Pitching, mentorship and pathways to launch student-led ventures." },
    { icon: Users2, title: "Leadership & Governance", text: "Civic education, policy engagement and active student leadership." },
    { icon: Brain, title: "Mental Wellness", text: "Conversations and support that put student wellbeing first." },
    { icon: Megaphone, title: "Creative Showcase", text: "Music, art, fashion, spoken word — a stage for student creativity." },
    { icon: BookOpenCheck, title: "Skills & Employability", text: "Real-world skills, financial literacy and career-readiness." },
  ];
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative surface-ink overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 20% 10%, oklch(0.78 0.14 82) 0, transparent 40%), radial-gradient(circle at 90% 90%, oklch(0.78 0.14 82) 0, transparent 35%)" }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-[1.2fr_1fr] items-center gap-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gold/90"><Sparkles className="size-3" /> A flagship of B.A Connect Org.</span>
            <h1 className="mt-6 heading-display text-5xl sm:text-6xl lg:text-7xl text-cream">
              One nation. <span className="gold-gradient-text">Every campus.</span><br />Endless potential.
            </h1>
            <p className="mt-6 max-w-xl text-cream/75 text-base sm:text-lg leading-relaxed">
              The Inter–Universities Nexus Platform brings together students from universities, colleges and tertiary institutions across Kenya and beyond into one vibrant space for talent, creativity, innovation, learning and opportunity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-ink hover:bg-gold/90 font-semibold"><Link to="/auth">Join the Nexus <ArrowRight className="size-4" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="border-gold/40 text-cream hover:bg-gold hover:text-ink"><Link to="/programs">Explore Programs</Link></Button>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="absolute inset-0 blur-3xl bg-gold/10 rounded-full" />
            <img src={nexusLogo.url} alt="Inter-Universities Nexus crest" className="relative w-72 sm:w-96 drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-background -mt-12 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <PlatformStats />
        </div>
      </section>

      {/* MISSION VISION */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-3 gap-6">
          {[
            { icon: Target, label: "Mission", body: "To create a unified and inclusive network for universities & colleges that promotes student empowerment, leadership development, talent recognition, policy engagement, innovation, civic education and sustainable opportunities through strategic partnership and collaborative action." },
            { icon: Compass, label: "Vision", body: "To become Africa's leading Inter-University collaborative platform, nurturing a generation of empowered, innovative, socially responsible and globally competitive student leaders." },
            { icon: Globe2, label: "Core Philosophy", body: "Universities should not exist in isolation. They should collaborate, innovate and grow together for the betterment of society." },
          ].map(c => (
            <div key={c.label} className="rounded-2xl border bg-card p-8 shadow-elegant">
              <div className="size-12 rounded-lg bg-ink text-gold grid place-items-center"><c.icon className="size-6" /></div>
              <h3 className="mt-5 heading-display text-2xl text-primary">{c.label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PILLARS */}
      <section className="py-20 surface-ink">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-gold text-xs uppercase tracking-[0.25em]">What we champion</p>
            <h2 className="mt-3 heading-display text-4xl sm:text-5xl text-cream">Pillars of the Nexus</h2>
            <p className="mt-4 text-cream/70">From entrepreneurship to wellness — we equip students to lead the conversations shaping our generation.</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillars.map(p => (
              <div key={p.title} className="group rounded-xl border border-gold/15 p-6 hover:border-gold/50 transition">
                <p.icon className="size-7 text-gold" />
                <h3 className="mt-4 font-display text-xl text-cream">{p.title}</h3>
                <p className="mt-2 text-sm text-cream/70 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-secondary">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Heart className="mx-auto size-8 text-accent" />
          <h2 className="mt-4 heading-display text-4xl sm:text-5xl text-primary">Your campus. Your voice. Your stage.</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Join thousands of students building Kenya's most ambitious youth platform. Get your official Member ID instantly.</p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90"><Link to="/auth">Create your Member ID</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/members">See members</Link></Button>
          </div>
        </div>
      </section>

      {/* FEEDBACK WALL PREVIEW */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-accent text-xs uppercase tracking-[0.25em]">Feedback Wall</p>
              <h2 className="mt-2 heading-display text-3xl sm:text-4xl text-primary">Voices from the Nexus</h2>
            </div>
            <Button asChild variant="ghost"><Link to="/feedback">View all <ArrowRight className="size-4" /></Link></Button>
          </div>
          <FeedbackWall limit={6} />
          <div className="mt-10 max-w-2xl mx-auto">
            <h3 className="heading-display text-2xl mb-4 text-center">Leave your comment</h3>
            <FeedbackForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
