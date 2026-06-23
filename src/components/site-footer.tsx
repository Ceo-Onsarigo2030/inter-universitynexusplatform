import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail } from "lucide-react";
import nexusLogo from "@/assets/nexus-logo.jpg.asset.json";
import baLogo from "@/assets/ba-connect-logo.jpg.asset.json";

export function SiteFooter() {
  return (
    <footer className="surface-ink mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <img src={nexusLogo.url} alt="Nexus" className="h-12 w-12 rounded object-contain" />
            <img src={baLogo.url} alt="B.A Connect" className="h-12 w-12 rounded object-contain" />
          </div>
          <p className="text-cream/70 max-w-md text-sm leading-relaxed">
            The Inter–Universities Nexus Platform is a flagship initiative of B.A Connect Organization, uniting students across Kenya & Africa for talent, leadership, innovation and opportunity.
          </p>
          <div className="flex items-center gap-3">
            <a href="https://instagram.com/uninexus_connect" target="_blank" rel="noreferrer" className="size-10 rounded-full border border-gold/40 grid place-items-center text-gold hover:bg-gold hover:text-ink transition" aria-label="Instagram"><Instagram className="size-4" /></a>
            <a href="https://facebook.com/UniNexus Connect" target="_blank" rel="noreferrer" className="size-10 rounded-full border border-gold/40 grid place-items-center text-gold hover:bg-gold hover:text-ink transition" aria-label="Facebook"><Facebook className="size-4" /></a>
            <a href="mailto:uninexusplatformke@gmail.com" className="size-10 rounded-full border border-gold/40 grid place-items-center text-gold hover:bg-gold hover:text-ink transition" aria-label="Email"><Mail className="size-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="text-gold text-sm font-semibold tracking-widest uppercase mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-cream/75">
            <li><Link to="/about" className="hover:text-gold">About</Link></li>
            <li><Link to="/programs" className="hover:text-gold">Programs & Events</Link></li>
            <li><Link to="/members" className="hover:text-gold">Members</Link></li>
            <li><Link to="/feedback" className="hover:text-gold">Feedback Wall</Link></li>
            <li><Link to="/auth" className="hover:text-gold">Join the Platform</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-gold text-sm font-semibold tracking-widest uppercase mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-cream/75">
            <li>Instagram: @uninexus_connect</li>
            <li>Facebook: UniNexus Connect</li>
            <li>uninexusplatformke@gmail.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gold/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-cream/55">
          <p>© {new Date().getFullYear()} B.A Connect Organization. All rights reserved.</p>
          <p className="font-display italic text-gold/70">Universities collaborate. Talent rises.</p>
        </div>
      </div>
    </footer>
  );
}
