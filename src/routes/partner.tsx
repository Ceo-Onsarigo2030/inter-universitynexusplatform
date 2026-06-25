import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PartnerForm } from "@/components/partner-form";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/partner")({
  head: () => ({ meta: [
    { title: "Partner with us — Inter–Universities Nexus" },
    { name: "description", content: "Organisations, institutions and companies — partner with the Nexus to reach Kenya's brightest students." },
    { property: "og:title", content: "Partner with us — Inter–Universities Nexus" },
    { property: "og:description", content: "Sponsorship, CSR, mentorship and strategic partnerships." },
  ]}),
  component: PartnerPage,
});

function PartnerPage() {
  const reasons = [
    "Reach a national network of student leaders across Kenya's top universities and colleges.",
    "Anchor your brand to high-impact youth events — Gala Awards, 16 Days of Activism, National Debate.",
    "Co-design programs around your CSR pillars: inclusion, mental health, innovation, gender equity, civic education.",
    "Direct talent pipeline — recruit, mentor and showcase the next generation.",
  ];
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="surface-ink py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-gold text-xs uppercase tracking-[0.3em]">Partnerships</p>
          <h1 className="mt-3 heading-display text-5xl sm:text-6xl text-cream">Build the future with us.</h1>
          <p className="mt-4 text-cream/70 max-w-2xl">We work with brands, NGOs, government agencies, learning institutions and impact investors to expand opportunities for Kenyan students. Tell us how you'd like to collaborate.</p>
        </div>
      </section>
      <section className="py-14 flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid lg:grid-cols-[1fr_1.2fr] gap-10">
          <div>
            <h2 className="heading-display text-3xl text-primary">Why partner</h2>
            <ul className="mt-5 space-y-4">
              {reasons.map(r => <li key={r} className="flex gap-3 text-sm leading-relaxed text-foreground"><CheckCircle2 className="size-5 text-gold flex-none" />{r}</li>)}
            </ul>
          </div>
          <PartnerForm />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}