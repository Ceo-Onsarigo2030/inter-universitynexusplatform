import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";

const KEY = "nexus.cookie-consent.v1";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      // localStorage unavailable — do not block UI
    }
  }, []);

  function decide(value: "accepted" | "declined") {
    try { localStorage.setItem(KEY, value); } catch { /* noop */ }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-4xl rounded-xl border border-gold/40 bg-ink text-cream shadow-gold p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
        <Cookie className="size-6 text-gold flex-none" aria-hidden />
        <div className="text-sm leading-relaxed flex-1">
          <p className="font-semibold text-gold">We value your privacy</p>
          <p className="text-cream/80 mt-0.5">
            We use cookies and similar storage to keep you signed in, remember your preferences and understand how the Nexus is used. By continuing, you agree to our use of cookies. See our{" "}
            <Link to="/about" className="underline text-gold hover:text-gold/80">data &amp; privacy notice</Link>.
          </p>
        </div>
        <div className="flex gap-2 self-stretch sm:self-auto">
          <Button onClick={() => decide("declined")} variant="outline" size="sm" className="border-gold/40 text-cream hover:bg-white/5">Decline</Button>
          <Button onClick={() => decide("accepted")} size="sm" className="bg-gold text-ink hover:bg-gold/90 font-semibold">Accept</Button>
        </div>
      </div>
    </div>
  );
}