import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UniversityVote } from "@/components/university-vote";

export const Route = createFileRoute("/vote")({
  head: () => ({ meta: [
    { title: "Vote — Kenya's Best University" },
    { name: "description", content: "Vote for Kenya's best university or college. Open to everyone, no sign-up required." },
    { property: "og:title", content: "Vote — Best University in Kenya" },
    { property: "og:description", content: "Live results, public vote, open to all comrades." },
  ]}),
  component: VotePage,
});

function VotePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="surface-ink py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-gold text-xs uppercase tracking-[0.3em]">National Vote</p>
          <h1 className="mt-3 heading-display text-5xl text-cream">Best University in Kenya</h1>
          <p className="mt-4 text-cream/70 max-w-xl">Comrades, this one is for you. Vote for your campus. No sign-up. Live results. Short forms welcome (KU, JKUAT, UoN, USIU-A, MMUST, DeKUT).</p>
        </div>
      </section>
      <section className="py-12 flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <UniversityVote />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}