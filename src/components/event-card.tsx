import { useState } from "react";
import { format } from "date-fns";
import { Calendar, MapPin, Ticket, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { GalaRegistrationForm } from "./gala-registration-form";

export type EventRow = {
  id: string; title: string; description: string; overview: string | null;
  category: string; event_date: string | null; location: string | null;
  ticket_url: string | null; ticket_regular: number | null; ticket_vip: number | null; ticket_vvip: number | null;
  pillar: string | null;
};

export function EventCard({ event }: { event: EventRow }) {
  const [open, setOpen] = useState(false);
  const isGala = /gala/i.test(event.title);
  return (
    <article className={`rounded-2xl overflow-hidden shadow-elegant hover:shadow-gold transition group flex flex-col ${isGala ? "border-2 border-gold bg-ink text-cream" : "border bg-card"}`}>
      <div className={`h-2 ${isGala ? "bg-gradient-to-r from-gold via-yellow-300 to-gold" : "bg-gradient-to-r from-primary via-accent to-gold"}`} />
      <div className="p-6 flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] uppercase tracking-widest font-semibold ${isGala ? "text-gold" : "text-accent"}`}>{event.category}</span>
          {event.pillar && <span className={`text-[10px] ${isGala ? "text-cream/50" : "text-muted-foreground"}`}>{event.pillar}</span>}
        </div>
        <h3 className={`heading-display text-2xl ${isGala ? "text-gold" : "text-primary"}`}>{event.title}</h3>
        <p className={`text-sm line-clamp-3 flex-1 ${isGala ? "text-cream/75" : "text-muted-foreground"}`}>{event.description}</p>
        <div className={`space-y-1 text-xs ${isGala ? "text-cream/70" : "text-muted-foreground"}`}>
          {event.event_date && <p className="flex items-center gap-2"><Calendar className="size-3.5 text-gold" /> {format(new Date(event.event_date), "PPP · p")}</p>}
          {event.location && <p className="flex items-center gap-2"><MapPin className="size-3.5 text-gold" /> {event.location}</p>}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant={isGala ? "default" : "outline"} className={`w-full mt-2 ${isGala ? "bg-gold text-ink hover:bg-gold/90 font-semibold" : ""}`}>
              {isGala ? "🎟️ Get Tickets & Gate Pass" : "Read more & RSVP"}
            </Button>
          </DialogTrigger>
          <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${isGala ? "bg-ink border-gold text-cream" : ""}`}>
            <DialogHeader>
              <DialogTitle className={`heading-display text-3xl ${isGala ? "text-gold" : "text-primary"}`}>{event.title}</DialogTitle>
              <DialogDescription className={`text-base leading-relaxed pt-2 whitespace-pre-line ${isGala ? "text-cream/80" : "text-foreground/80"}`}>
                {event.overview ?? event.description}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 space-y-2 text-sm">
              {event.event_date && <p className={`flex items-center gap-2 ${isGala ? "text-cream" : "text-primary"}`}><Calendar className="size-4 text-gold" /> <strong>{format(new Date(event.event_date), "EEEE, do MMMM yyyy · p")}</strong></p>}
              {event.location && <p className={`flex items-center gap-2 ${isGala ? "text-cream" : "text-primary"}`}><MapPin className="size-4 text-gold" /> {event.location}</p>}
            </div>
            {isGala && (
              <div className="mt-4 rounded-xl overflow-hidden border border-gold/30">
                <iframe
                  title="KISE map"
                  src="https://www.google.com/maps?q=Kenya+Institute+of+Special+Education+KISE+Kasarani+Nairobi&output=embed"
                  className="w-full h-64 border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
            {(event.ticket_regular || event.ticket_vip || event.ticket_vvip) && (
              <div className={`mt-4 rounded-xl p-4 ${isGala ? "border border-gold/30 bg-white/5" : "border bg-secondary/50"}`}>
                <p className={`text-xs uppercase tracking-widest font-semibold mb-3 flex items-center gap-1 ${isGala ? "text-gold" : "text-accent"}`}><Ticket className="size-3.5" /> Tickets</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {event.ticket_regular && <Tier label="Regular" price={event.ticket_regular} />}
                  {event.ticket_vip && <Tier label="VIP" price={event.ticket_vip} />}
                  {event.ticket_vvip && <Tier label="VVIP" price={event.ticket_vvip} />}
                </div>
                {event.ticket_url && (
                  <Button asChild className="w-full mt-4 bg-gold text-ink hover:bg-gold/90 font-semibold">
                    <a href={event.ticket_url} target="_blank" rel="noreferrer">Get Tickets <ExternalLink className="size-4" /></a>
                  </Button>
                )}
              </div>
            )}
            {isGala ? (
              <GalaRegistrationForm programId={event.id} />
            ) : (
              <RsvpBlock eventId={event.id} hasTickets={!!(event.ticket_regular || event.ticket_vip || event.ticket_vvip)} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </article>
  );
}

function Tier({ label, price }: { label: string; price: number }) {
  return (
    <div className="rounded-lg bg-card border p-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-xl text-primary font-semibold">KSh {price.toLocaleString()}</p>
    </div>
  );
}

function RsvpBlock({ eventId, hasTickets }: { eventId: string; hasTickets: boolean }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: rsvp } = useQuery({
    queryKey: ["rsvp", eventId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("event_rsvps").select("*").eq("program_id", eventId).eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });
  const toggle = useMutation({
    mutationFn: async () => {
      if (rsvp) {
        const { error } = await supabase.from("event_rsvps").delete().eq("id", rsvp.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("event_rsvps").insert({ program_id: eventId, user_id: user!.id, ticket_tier: "regular" });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rsvp", eventId] }); qc.invalidateQueries({ queryKey: ["my-rsvps"] }); toast.success(rsvp ? "RSVP cancelled" : "You're in! See you there."); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) {
    return (
      <div className="mt-4 rounded-lg bg-secondary/50 p-3 text-sm flex items-center justify-between gap-3">
        <span className="text-muted-foreground"><Users className="inline size-4 mr-1 text-gold" /> Sign in to RSVP and save this to your ID profile.</span>
        <Button asChild size="sm" variant="outline"><Link to="/auth">Sign in</Link></Button>
      </div>
    );
  }
  return (
    <Button onClick={() => toggle.mutate()} disabled={toggle.isPending}
      className={`w-full mt-4 ${rsvp ? "bg-secondary text-foreground hover:bg-secondary/80" : "bg-primary text-primary-foreground"}`}>
      {toggle.isPending ? "Saving…" : rsvp ? "✓ You're attending — Cancel RSVP" : hasTickets ? "RSVP (free — tickets sold separately)" : "RSVP — I'll be there"}
    </Button>
  );
}