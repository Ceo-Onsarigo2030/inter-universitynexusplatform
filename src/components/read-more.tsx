import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ReadMore({ preview, children, label = "Read more" }: { preview: ReactNode; children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="space-y-3">{preview}</div>
      {open && <div className="space-y-3 mt-3 animate-in fade-in slide-in-from-top-2">{children}</div>}
      <button onClick={() => setOpen(o => !o)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-primary transition">
        {open ? "Show less" : label} {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
    </div>
  );
}