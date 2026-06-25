import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trophy, Vote } from "lucide-react";

function getFingerprint(): string {
  if (typeof window === "undefined") return "ssr";
  const key = "nexus-voter";
  let v = localStorage.getItem(key);
  if (!v) { v = crypto.randomUUID(); localStorage.setItem(key, v); }
  return v;
}

function normalize(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function UniversityVote() {
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const { data: votes } = useQuery({
    queryKey: ["uni-votes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("university_votes").select("university_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const leaderboard = useMemo(() => {
    const counts = new Map<string, number>();
    (votes ?? []).forEach(v => {
      const k = normalize(v.university_name);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([n, c]) => ({ name: n, count: c })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [votes]);

  const total = votes?.length ?? 0;

  const vote = useMutation({
    mutationFn: async (uname: string) => {
      const fp = getFingerprint();
      const { error } = await supabase.from("university_votes").insert({ university_name: normalize(uname), voter_fingerprint: fp });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Vote recorded!"); setName(""); qc.invalidateQueries({ queryKey: ["uni-votes"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border bg-card p-6 shadow-elegant">
        <div className="flex items-center gap-2 text-primary">
          <Vote className="size-5 text-gold" />
          <h3 className="heading-display text-2xl">Vote: Kenya's Best University</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-2">No sign-up needed. Type your university (e.g. <span className="font-semibold">Kenyatta University (KU)</span>) and vote. One vote per device.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim().length < 2) return; vote.mutate(name); }} className="mt-4 flex gap-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Type a university or college…" required />
          <Button type="submit" disabled={vote.isPending} className="bg-gold text-ink hover:bg-gold/90 font-semibold">{vote.isPending ? "Voting…" : "Vote"}</Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3">{total.toLocaleString()} total votes counted nationwide.</p>
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-elegant">
        <div className="flex items-center gap-2 text-primary">
          <Trophy className="size-5 text-gold" />
          <h3 className="heading-display text-2xl">Live Leaderboard</h3>
        </div>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-4">Be the first to vote. The leaderboard updates instantly.</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {leaderboard.map((u, i) => {
              const max = leaderboard[0].count;
              const pct = (u.count / max) * 100;
              return (
                <li key={u.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-primary"><span className="font-mono text-accent mr-2">#{i + 1}</span>{u.name}</span>
                    <span className="font-mono text-muted-foreground">{u.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary via-accent to-gold" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}