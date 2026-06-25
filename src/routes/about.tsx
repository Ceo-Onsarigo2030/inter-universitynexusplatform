import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import baLogo from "@/assets/ba-connect-logo.jpg.asset.json";
import nexusLogo from "@/assets/nexus-logo.jpg.asset.json";
import { ReadMore } from "@/components/read-more";
import { Target, Compass, Globe2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — Inter–Universities Nexus Platform" },
    { name: "description", content: "Learn about the Inter–Universities Nexus Platform — a flagship of B.A Connect Organization uniting students across Kenya & Africa." },
    { property: "og:title", content: "About — Inter–Universities Nexus Platform" },
    { property: "og:description", content: "A flagship youth-centered platform of B.A Connect Organization." },
  ]}),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="surface-ink py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <p className="text-gold text-xs uppercase tracking-[0.3em]">About the platform</p>
          <h1 className="mt-3 heading-display text-5xl sm:text-6xl text-cream">A national stage for student excellence</h1>
          <div className="mt-8 flex justify-center gap-6">
            <img src={nexusLogo.url} alt="Nexus" className="h-24 w-24 object-contain" />
            <img src={baLogo.url} alt="B.A Connect" className="h-24 w-24 object-contain rounded" />
          </div>
        </div>
      </section>
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-10 text-foreground text-base sm:text-lg leading-relaxed">
          <div>
            <h2 className="heading-display text-3xl text-primary mb-4">About the platform</h2>
            <ReadMore preview={<p>The Inter–Universities Nexus Platform, a flagship initiative of <strong>B.A Connect Organization</strong>, is a youth-centered space that brings together students from universities, colleges and tertiary institutions across Kenya and beyond. It was born from a simple belief: young people possess immense potential, but many lack the platforms, exposure and mentorship to fully realise it. We exist to close that gap.</p>}>
              <p>The platform provides a credible, inclusive national stage where young people can discover their strengths, nurture their talents, showcase creativity, advance innovative ideas and build practical skills for the future. Whether in arts, leadership, entrepreneurship, technology, research, sports, advocacy or the creative industries, the platform is designed to recognise and elevate youth excellence while opening pathways to visibility, partnerships, mentorship and meaningful opportunities.</p>
              <p>More than a showcase, the Nexus is a space for purposeful engagement and transformative dialogue. Through forums, summits, exhibitions, competitions, mentorship programs and strategic youth events, we tackle the issues shaping our generation: entrepreneurship and employability, technology and AI, financial literacy, leadership and governance, mental health, innovation, inclusion and civic education.</p>
              <p>At its core, Inter–Universities Nexus reflects B.A Connect Organisation's commitment to building a generation of empowered, innovative, skilled and socially conscious young leaders who are ready to make meaningful contributions to Kenya's development, Africa's progress and the global community.</p>
            </ReadMore>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-elegant">
            <div className="flex items-center gap-3 mb-3"><Target className="size-6 text-gold" /><h3 className="heading-display text-2xl text-primary">Our Mission</h3></div>
            <ReadMore preview={<p>To create a unified and inclusive network for universities and colleges that promotes student empowerment, leadership development, talent recognition and innovation.</p>}>
              <p>We pursue this through policy engagement, civic education and sustainable opportunities, anchored in strategic partnerships and collaborative action across institutions, government, industry and civil society.</p>
            </ReadMore>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-elegant">
            <div className="flex items-center gap-3 mb-3"><Compass className="size-6 text-gold" /><h3 className="heading-display text-2xl text-primary">Our Vision</h3></div>
            <ReadMore preview={<p>To become Africa's leading inter-university collaborative platform.</p>}>
              <p>We are nurturing a generation of empowered, innovative, socially responsible and globally competitive student leaders who carry their universities, their communities and their continent forward.</p>
            </ReadMore>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-elegant">
            <div className="flex items-center gap-3 mb-3"><Globe2 className="size-6 text-gold" /><h3 className="heading-display text-2xl text-primary">Core Philosophy</h3></div>
            <p className="italic text-muted-foreground">"Universities should not exist in isolation. They should collaborate, innovate and grow together for the betterment of society."</p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
