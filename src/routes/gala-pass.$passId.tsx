import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, MapPin, Calendar, Ticket } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/gala-pass/$passId")({
  head: () => ({ meta: [
    { title: "Your Gate Pass — Inter-Universities Nexus Gala Awards" },
    { name: "description", content: "Your official Digital Attendance Card for the Inter-Universities Nexus Gala Awards." },
    { name: "robots", content: "noindex" },
  ]}),
  errorComponent: () => <div className="min-h-screen grid place-items-center bg-ink text-cream">Something went wrong loading your pass.</div>,
  notFoundComponent: () => <div className="min-h-screen grid place-items-center bg-ink text-cream">Pass not found.</div>,
  component: GalaPass,
});

function GalaPass() {
  const { passId } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["gala-pass", passId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_gala_pass", { p_pass_id: passId });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw notFound();
      return row as { pass_id: string; full_name: string; email: string; institution: string | null; ticket_tier: string | null; created_at: string };
    },
  });

  if (isLoading) return <div className="min-h-screen grid place-items-center bg-ink text-cream">Loading your gate pass…</div>;
  if (error || !data) return <div className="min-h-screen grid place-items-center bg-ink text-cream">Pass not found.</div>;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(`UNINEXUS-GALA-2026|${data.pass_id}|${data.full_name}`)}`;
  const tierLabel = data.ticket_tier?.toUpperCase() || "REGULAR";

  return (
    <div className="min-h-screen bg-ink">
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .pass-card { box-shadow: none !important; margin: 0 auto; page-break-inside: avoid; }
        }
      `}</style>

      <div className="no-print bg-ink border-b border-gold/20">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Button asChild variant="ghost" className="text-cream hover:text-gold hover:bg-white/5">
            <Link to="/programs"><ArrowLeft className="size-4" /> Back to events</Link>
          </Button>
          <Button onClick={() => window.print()} className="bg-gold text-ink hover:bg-gold/90 font-semibold">
            <Printer className="size-4" /> Print Gate Pass
          </Button>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-10 print:py-0">
        <article className="pass-card rounded-2xl overflow-hidden border-2 border-gold bg-gradient-to-br from-ink via-[#0a0a0a] to-ink shadow-[0_0_60px_-15px_rgba(212,175,55,0.4)]">
          {/* Top band */}
          <div className="bg-gradient-to-r from-gold via-yellow-300 to-gold h-2" />

          <div className="p-8 sm:p-10">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-gold/80 font-semibold">UniNexus Connect presents</p>
                <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-gold leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  Inter-Universities<br />Nexus Gala Awards
                </h1>
                <p className="mt-2 text-cream/60 italic text-sm">An evening of excellence. A night to remember.</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-cream/50">Official Gate Pass</p>
                <p className="font-mono text-gold text-xl mt-1 tracking-wider">{data.pass_id}</p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-gold text-ink text-[10px] font-bold tracking-widest">{tierLabel}</span>
              </div>
            </div>

            <div className="my-8 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

            <div className="grid sm:grid-cols-[1fr_auto] gap-8 items-center">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gold/70">Attendee</p>
                  <p className="text-cream text-2xl font-semibold mt-0.5">{data.full_name}</p>
                  {data.institution && <p className="text-cream/70 text-sm mt-0.5">{data.institution}</p>}
                </div>
                <div className="space-y-2 text-sm text-cream/85">
                  <p className="flex items-start gap-2"><Calendar className="size-4 text-gold mt-0.5 shrink-0" /> <span><strong>Thursday, 6 November 2026</strong><br />Doors open 5:00 PM till late</span></p>
                  <p className="flex items-start gap-2"><MapPin className="size-4 text-gold mt-0.5 shrink-0" /> KISE – Kenya Institute of Special Education,<br />Kasarani, Nairobi</p>
                  <p className="flex items-start gap-2"><Ticket className="size-4 text-gold mt-0.5 shrink-0" /> Dress code: Smart Formal / Black Tie</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg mx-auto">
                <img src={qrUrl} alt="Gate pass QR code" width={200} height={200} className="block" />
              </div>
            </div>

            <div className="my-8 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

            <div className="text-center">
              <p className="text-gold text-xs uppercase tracking-[0.3em] font-semibold">This card is your Gate Pass</p>
              <p className="text-cream/60 text-xs mt-2">Please print this or present it on your phone at entry. No card = No entry.</p>
              <p className="text-cream/40 text-[10px] mt-3 italic">Issued {format(new Date(data.created_at), "do MMMM yyyy 'at' HH:mm")} · UniNexus Connect · B.A Connect Organization</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gold via-yellow-300 to-gold h-2" />
        </article>

        <p className="no-print text-center text-cream/50 text-sm mt-6">
          Save this page link — you can re-open your pass anytime from any device.
        </p>
      </main>
    </div>
  );
}