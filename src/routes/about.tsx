import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import baLogo from "@/assets/ba-connect-logo.jpg.asset.json";
import nexusLogo from "@/assets/nexus-logo.jpg.asset.json";

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
        <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-6 text-foreground text-base sm:text-lg leading-relaxed">
          <p>The Inter–Universities Nexus Platform, a flagship initiative of <strong>B.A Connect Organization</strong>, is a transformative youth-centered platform created to bring together students from universities, colleges, and tertiary institutions across Kenya and beyond into one vibrant space for talent development, creativity, innovation, learning, and opportunity.</p>
          <p>It was established from a simple but powerful belief: young people possess immense potential, but many lack the right platforms, exposure, mentorship, and support systems needed to fully realize and showcase their abilities. Inter–Universities Nexus exists to bridge that gap.</p>
          <p>The platform provides a credible and inclusive national stage where young people can discover their strengths, nurture their talents, showcase creativity, advance innovative ideas, and build practical skills that prepare them for the future. Whether in arts, leadership, entrepreneurship, technology, research, sports, advocacy, or creative industries, the platform is designed to recognize and elevate youth excellence.</p>
          <p>More than a showcase platform, Inter–Universities Nexus is a space for purposeful engagement and transformative dialogue. Through forums, summits, exhibitions, competitions, mentorship programs, and strategic youth events, the platform addresses pressing issues affecting students and young people today — entrepreneurship, employability, technology and AI integration, financial literacy, leadership and governance, mental health awareness, innovation, social inclusion, and civic education.</p>
          <p>At its core, Inter–Universities Nexus reflects B.A Connect Organization's commitment to building a generation of empowered, innovative, skilled, and socially conscious young leaders — a generation ready to contribute meaningfully to Kenya's development, Africa's progress, and the global community.</p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
