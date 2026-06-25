import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EventCard, type EventRow } from "@/components/event-card";
import { format } from "date-fns";
import { useState } from "react";
import { Calendar as CalendarIcon, List } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [view, setView] = useState<"list" | "calendar">("list");
  const { data, isLoading } = useQuery({
    queryKey: ["programs", "published"],
    queryFn: async () => {
      const { data, error } = await supabase.from("programs").select("*").eq("is_published", true).order("event_date", { ascending: true });
      if (error) throw error;
      return data as EventRow[];
    },
  });
  const grouped = (data ?? []).reduce<Record<string, EventRow[]>>((acc, e) => {
    const k = e.event_date ? format(new Date(e.event_date), "MMMM yyyy") : "Date TBA";
    (acc[k] ??= []).push(e);
    return acc;
  }, {});
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="surface-ink py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-gold text-xs uppercase tracking-[0.3em]">Programs & Events</p>
          <h1 className="mt-3 heading-display text-5xl sm:text-6xl text-cream">Where conversations<br /> shape a generation.</h1>
          <p className="mt-5 max-w-xl text-cream/75">Summits, forums, bootcamps and showcases designed to equip, connect and elevate Kenya's brightest students.</p>
          <div className="mt-6 inline-flex rounded-lg bg-white/5 border border-gold/30 p-1">
            <button onClick={() => setView("list")} className={`px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-1 ${view === "list" ? "bg-gold text-ink" : "text-cream/70"}`}><List className="size-3.5" /> List</button>
            <button onClick={() => setView("calendar")} className={`px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-1 ${view === "calendar" ? "bg-gold text-ink" : "text-cream/70"}`}><CalendarIcon className="size-3.5" /> Calendar</button>
          </div>
        </div>
      </section>
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {isLoading ? <p className="text-muted-foreground">Loading…</p> : (
            view === "list" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {data?.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(grouped).map(([month, evs]) => (
                  <div key={month}>
                    <h2 className="heading-display text-2xl text-primary border-b pb-2 mb-4">{month}</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {evs.map(e => <EventCard key={e.id} event={e} />)}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
          {!isLoading && !data?.length && <p className="text-muted-foreground">No programs published yet. Check back soon.</p>}
          <div className="mt-12 text-center">
            <Button asChild variant="outline"><a href="https://madfun.com" target="_blank" rel="noreferrer">Buy event tickets on Madfun</a></Button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
