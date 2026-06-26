import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SuggestionForm, SuggestionWall } from "@/components/suggestion-wall";

export const Route = createFileRoute("/suggestions")({
  head: () => ({ meta: [
    { title: "Suggestion Wall — Inter–Universities Nexus" },
    { name: "description", content: "Suggest events, programs and what we should do next. The Nexus is built with you, not for you." },
    { property: "og:title", content: "Suggestion Wall — Inter–Universities Nexus" },
    { property: "og:description", content: "Crowd-sourced ideas from students across Kenya." },
  ]}),
  component: SuggestionsPage,
});

function SuggestionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="surface-ink py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-gold text-xs uppercase tracking-[0.3em]">Suggestion Wall</p>
          <h1 className="mt-3 heading-display text-5xl text-cream">Tell us what to do next.</h1>
          <p className="mt-4 text-cream/70 max-w-xl">Events you want. Programs you wish existed. Topics we should be talking about. Anyone can post — admins review weekly.</p>
        </div>
      </section>
      <section className="py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6"><SuggestionForm /></div>
      </section>
      <section className="pb-20 surface-ink">
        <div className="mx-auto max-w-7xl px-4 sm:px-6"><SuggestionWall /></div>
      </section>
      <SiteFooter />
    </div>
  );
}