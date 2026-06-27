import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import nexusLogo from "@/assets/nexus-logo.jpg.asset.json";
import baLogo from "@/assets/ba-connect-logo.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/pillars", label: "Pillars" },
  { to: "/programs", label: "Events" },
  { to: "/articles", label: "Articles" },
  { to: "/feedback", label: "Feedback" },
  { to: "/suggestions", label: "Suggestions" },
  { to: "/vote", label: "Vote" },
  { to: "/partner", label: "Partner" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 surface-ink border-b border-[oklch(0.78_0.14_82_/_0.25)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group" aria-label="Home">
            <img src={nexusLogo.url} alt="Inter-Universities Nexus Platform" className="h-14 w-14 rounded-md object-contain bg-ink" />
            <div className="hidden sm:block h-10 w-px bg-gold/40" />
            <img src={baLogo.url} alt="B.A Connect Organization" className="hidden sm:block h-12 w-12 rounded-md object-contain" />
            <div className="hidden md:block leading-tight">
              <div className="font-display text-base text-gold font-semibold tracking-wide">INTER–UNIVERSITIES NEXUS</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-cream/70">A flagship of B.A Connect Org.</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(n => (
              <Link key={n.to} to={n.to} className="px-3 py-2 text-sm text-cream/85 hover:text-gold transition-colors" activeProps={{ className: "text-gold" }}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm" className="text-cream hover:text-gold hover:bg-white/5">
                  <Link to="/dashboard"><LayoutDashboard className="size-4" /> Dashboard</Link>
                </Button>
                {isAdmin && (
                  <Button asChild variant="ghost" size="sm" className="text-gold hover:bg-white/5">
                    <Link to="/admin"><Shield className="size-4" /> Admin</Link>
                  </Button>
                )}
                <Button onClick={signOut} variant="outline" size="sm" className="border-gold/40 text-cream hover:bg-gold hover:text-ink">
                  <LogOut className="size-4" /> Sign out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-cream hover:text-gold hover:bg-white/5"><Link to="/auth">Sign in</Link></Button>
                <Button asChild size="sm" className="bg-gold text-ink hover:bg-gold/90 font-semibold"><Link to="/auth" search={{ mode: "signup" } as never}>Join now</Link></Button>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden text-cream p-2" aria-label="Menu">
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden pb-4 space-y-1 border-t border-gold/15 pt-3">
            {NAV.map(n => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-cream/85 hover:text-gold">
                {n.label}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <Button asChild variant="outline" className="border-gold/40 text-cream"><Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link></Button>
                  {isAdmin && <Button asChild variant="outline" className="border-gold/40 text-gold"><Link to="/admin" onClick={() => setOpen(false)}>Admin</Link></Button>}
                  <Button onClick={() => { setOpen(false); signOut(); }} className="bg-gold text-ink">Sign out</Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="border-gold/40 text-cream"><Link to="/auth" onClick={() => setOpen(false)}>Sign in</Link></Button>
                  <Button asChild className="bg-gold text-ink"><Link to="/auth" onClick={() => setOpen(false)}>Join now</Link></Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
