import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Route = createFileRoute("/members")({
  head: () => ({ meta: [
    { title: "Members — Inter–Universities Nexus" },
    { name: "description", content: "Meet the students powering the Nexus from across Kenya." },
    { property: "og:title", content: "Members — Inter–Universities Nexus" },
    { property: "og:description", content: "Public directory of registered Nexus members." },
  ]}),
  component: Members,
});

function Members() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id,full_name,university,member_id,member_number,course,bio,avatar_url,created_at").order("member_number", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const filtered = (data ?? []).filter(m => {
    const s = q.toLowerCase();
    return !s || m.full_name.toLowerCase().includes(s) || m.university.toLowerCase().includes(s) || m.member_id.toLowerCase().includes(s);
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="surface-ink py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-gold text-xs uppercase tracking-[0.3em]">Member Directory</p>
          <h1 className="mt-3 heading-display text-5xl text-cream">The faces of the Nexus</h1>
          <p className="mt-4 text-cream/70">Every member has an official ID. Search by name, university or Member ID.</p>
          <div className="mt-6 max-w-md">
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search members…" className="bg-white/5 border-gold/30 text-cream placeholder:text-cream/40" />
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {isLoading ? <p className="text-muted-foreground">Loading members…</p> : (
            filtered.length === 0 ? <p className="text-muted-foreground">No members found.</p> : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(m => {
                  const initials = m.full_name.split(/\s+/).slice(0,2).map(s => s[0]?.toUpperCase() ?? "").join("");
                  return (
                    <div key={m.id} className="rounded-xl border bg-card p-5 shadow-elegant flex gap-4 items-center">
                      <div className="size-14 rounded-full bg-ink text-gold grid place-items-center font-display text-xl font-bold flex-none">{initials || "•"}</div>
                      <div className="min-w-0">
                        <p className="font-semibold text-primary truncate">{m.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.university}</p>
                        <p className="text-[10px] mt-1 tracking-widest text-accent font-mono">{m.member_id}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
