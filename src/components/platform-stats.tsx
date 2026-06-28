// Stats are intentionally kept at zero until the auth system is
// fully verified and fresh member registrations begin.
// To activate live counts later, swap the hardcoded zeros for DB queries.

import { Users, GraduationCap, CalendarHeart, Accessibility } from "lucide-react";

export function PlatformStats() {
  const items = [
    { label: "Registered Members", value: 0, icon: Users },
    { label: "Universities On Board", value: 0, icon: GraduationCap },
    { label: "Members with Disability", value: 0, icon: Accessibility },
    { label: "Programs & Events", value: 0, icon: CalendarHeart },
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
