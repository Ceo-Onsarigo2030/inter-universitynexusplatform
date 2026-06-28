import { Users, GraduationCap, CalendarHeart, Accessibility } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function PlatformStats() {
  const { data: stats } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("platform_stats");
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });

  const items = [
    { label: "Registered Members", value: stats?.registered_members ?? 0, icon: Users },
    { label: "Universities On Board", value: stats?.universities_on_board ?? 0, icon: GraduationCap },
    { label: "Members with Disability", value: stats?.members_with_disability ?? 0, icon: Accessibility },
    { label: "Programs & Events", value: stats?.published_programs ?? 0, icon: CalendarHeart },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-xl surface-ink p-5 sm:p-6 border border-gold/20 relative overflow-hidden"
        >
          <it.icon className="absolute -bottom-3 -right-3 size-20 text-gold/10" />
          <p className="text-3xl sm:text-4xl heading-display gold-gradient-text">
            {it.value.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] sm:text-xs uppercase tracking-widest text-cream/70">
            {it.label}
          </p>
        </div>
      ))}
    </div>
  );
}
