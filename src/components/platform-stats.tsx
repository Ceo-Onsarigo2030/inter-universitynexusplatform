import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, GraduationCap, CalendarHeart, MessagesSquare } from "lucide-react";

function useStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const [members, unis, progs, fbs] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("universities").select("id", { count: "exact", head: true }),
        supabase.from("programs").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("feedback").select("id", { count: "exact", head: true }).eq("approved", true),
      ]);
      const memberCount = members.count ?? 0;
      // Distinct universities from member signups
      const { data: memberUnis } = await supabase.from("profiles").select("university");
      const distinct = new Set((memberUnis ?? []).map(p => p.university.trim().toLowerCase()));
      return {
        members: memberCount,
        universities: Math.max(unis.count ?? 0, distinct.size),
        programs: progs.count ?? 0,
        feedback: fbs.count ?? 0,
      };
    },
  });
}

export function PlatformStats() {
  const { data } = useStats();
  const items = [
    { label: "Registered Members", value: data?.members ?? 0, icon: Users },
    { label: "Universities On Board", value: data?.universities ?? 0, icon: GraduationCap },
    { label: "Programs & Events", value: data?.programs ?? 0, icon: CalendarHeart },
    { label: "Community Voices", value: data?.feedback ?? 0, icon: MessagesSquare },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map(it => (
        <div key={it.label} className="rounded-xl surface-ink p-5 sm:p-6 border border-gold/20 relative overflow-hidden">
          <it.icon className="absolute -bottom-3 -right-3 size-20 text-gold/10" />
          <p className="text-3xl sm:text-4xl heading-display gold-gradient-text">{it.value.toLocaleString()}</p>
          <p className="mt-1 text-[11px] sm:text-xs uppercase tracking-widest text-cream/70">{it.label}</p>
        </div>
      ))}
    </div>
  );
}
