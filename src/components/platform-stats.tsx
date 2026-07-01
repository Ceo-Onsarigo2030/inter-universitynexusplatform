// v2 — live stats via platform_stats() RPC
import { Users, GraduationCap, CalendarHeart, Accessibility } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function PlatformStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("platform_stats");
      if (error) throw error;
      return Array.isArray(data) ? data[0] : data;
    },
    staleTime: 60_000,
  });

  const items = [
    { label: "Registered Members", value: data?.registered_members, icon: Users },
    { label: "Universities On Board", value: data?.universities_on_board, icon: GraduationCap },
    { label: "Members with Disability", value: data?.members_with_disability, icon: Accessibility },
    { label: "Programs & Events", value: data?.published_programs, icon: CalendarHeart },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl surface-ink p-5 sm:p-6 border border-gold/20 relative overflow-hidden">
          <it.icon className="absolute -bottom-3 -right-3 size-20 text-gold/10" />
          {isLoading ? (
            <div className="h-9 sm:h-10 w-16 rounded bg-cream/10 animate-pulse" />
          ) : isError || it.value == null ? (
            <p className="text-3xl sm:text-4xl heading-display text-cream/70">—</p>
          ) : (
            <p className="text-3xl sm:text-4xl heading-display gold-gradient-text">
              {Number(it.value).toLocaleString()}
            </p>
          )}
          <p className="mt-1 text-[11px] sm:text-xs uppercase tracking-widest text-cream/70">{it.label}</p>
        </div>
      ))}
    </div>
  );
}
