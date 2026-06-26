import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FeedbackForm } from "@/components/feedback-form";
import { FeedbackWall } from "@/components/feedback-wall";
import { useAuth } from "@/lib/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [
    { title: "Feedback Wall — Inter–Universities Nexus" },
    { name: "description", content: "Share your story, ideas and feedback with the Nexus community." },
    { property: "og:title", content: "Feedback Wall — Inter–Universities Nexus" },
    { property: "og:description", content: "Public feedback wall for students across Kenya." },
  ]}),
  component: FeedbackPage,
});

function FeedbackPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; university: string } | null>(null);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name,university").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data));
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="surface-ink py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-gold text-xs uppercase tracking-[0.3em]">Feedback Wall</p>
          <h1 className="mt-3 heading-display text-5xl text-cream">Voices of the Nexus</h1>
          <p className="mt-4 text-cream/70 max-w-xl">Stories, ideas, suggestions — anyone can leave a comment.</p>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackForm defaultName={profile?.full_name ?? ""} defaultUniversity={profile?.university ?? ""} userId={user?.id ?? null} />
        </div>
      </section>
      <section className="pb-20 surface-ink">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FeedbackWall />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
