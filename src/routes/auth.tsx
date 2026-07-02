import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { useQuery } from "@tanstack/react-query";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon, ArrowLeft } from "lucide-react";

import { z } from "zod";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup", "reset"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in or Join — Inter–Universities Nexus" },
      { name: "description", content: "Sign in to your account or create a Nexus Member ID instantly." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup" | "reset">(search.mode ?? "signup");
  const redirectTo = search.redirect ?? "/dashboard";

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: redirectTo as "/dashboard", replace: true });
    }
  }, [user, loading, navigate, redirectTo]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="flex-1 grid lg:grid-cols-2">
        <div className="surface-ink hidden lg:flex items-center justify-center p-12">
          <div className="max-w-md space-y-6">
            <p className="text-gold text-xs uppercase tracking-[0.3em]">Welcome</p>
            <h1 className="heading-display text-5xl text-cream">
              Join Kenya's most ambitious student platform.
            </h1>
            <p className="text-cream/70">
              Sign up once. Receive your official Nexus Member ID instantly. Access programs,
              events and a national network of student leaders.
            </p>
            <ul className="space-y-3 text-sm text-cream/80">
              <li className="flex gap-3"><span className="text-gold">✦</span> Auto-generated official Member ID</li>
              <li className="flex gap-3"><span className="text-gold">✦</span> Verified email — secure account</li>
              <li className="flex gap-3"><span className="text-gold">✦</span> Digital ID card in your dashboard</li>
              <li className="flex gap-3"><span className="text-gold">✦</span> Free access to programs and events</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border bg-card p-8 shadow-elegant">
              {mode === "reset" ? (
                <>
                  <button onClick={() => setMode("signin")} className="flex items-center gap-1 text-xs text-muted-foreground mb-5 hover:text-primary">
                    <ArrowLeft className="size-3" /> Back to sign in
                  </button>
                  <h2 className="text-lg font-semibold mb-1">Reset your password</h2>
                  <p className="text-sm text-muted-foreground mb-5">Enter your email and we'll send you a reset link.</p>
                  <ResetForm />
                </>
              ) : (
                <>
                  <div className="flex gap-2 p-1 rounded-lg bg-secondary mb-6">
                    <button onClick={() => setMode("signup")} className={`flex-1 py-2 text-sm rounded-md font-semibold transition ${mode === "signup" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}>Join now</button>
                    <button onClick={() => setMode("signin")} className={`flex-1 py-2 text-sm rounded-md font-semibold transition ${mode === "signin" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}>Sign in</button>
                  </div>
                  {mode === "signup" ? <SignUpForm redirectTo={redirectTo} /> : <SignInForm onForgotPassword={() => setMode("reset")} redirectTo={redirectTo} />}
                  <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
                  </div>
                  <GoogleButton redirectTo={redirectTo} />
                </>
              )}
              <p className="mt-6 text-center text-xs text-muted-foreground">
                By continuing you agree to receive Nexus communications.{" "}
                <Link to="/" className="underline">Back to home</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function GoogleButton({ redirectTo }: { redirectTo: string }) {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    // NOTE: Google OAuth requires a same-origin PUBLIC callback URL.
    // Sending users to a protected route (e.g. /dashboard) breaks the flow.
    // We land back on /auth and the useEffect above pushes them to redirectTo
    // once a session is detected.
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth?redirect=${encodeURIComponent(redirectTo)}`,
    });
    if (res.error) {
      toast.error("Google sign-in failed");
      setLoading(false);
    }
  }
  return (
    <Button onClick={go} disabled={loading} variant="outline" className="w-full border-input">
      {loading ? "Opening Google…" : "Continue with Google"}
    </Button>
  );
}


function ResetForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=signin`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); } else { setSent(true); toast.success("Reset link sent! Check your email."); }
  }

  if (sent) {
    return (
      <div className="rounded-lg bg-secondary/60 p-4 text-center">
        <p className="text-sm font-semibold">Check your inbox</p>
        <p className="text-xs text-muted-foreground mt-1">We sent a password reset link to <strong>{email}</strong></p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="reset-email">Email address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input id="reset-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="you@example.com" />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Sending…" : "Send reset link"}</Button>
    </form>
  );
}

function SignUpForm({ redirectTo }: { redirectTo: string }) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasDisability, setHasDisability] = useState(false);
  const [disabilityType, setDisabilityType] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: unis } = useQuery({
    queryKey: ["unis"],
    queryFn: async () => (await supabase.from("universities").select("name").order("name")).data ?? [],
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) { toast.error("Password needs at least one capital letter and one number"); return; }
    if (!university) { toast.error("Please choose your university or college"); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName, university, has_disability: hasDisability, disability_type: hasDisability ? (disabilityType || null) : null },
        emailRedirectTo: `${window.location.origin}${redirectTo}`,
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    void data;
    toast.success("Welcome to the Nexus!");
    navigate({ to: redirectTo as "/dashboard", replace: true });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="su-name">Full name</Label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input id="su-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-9" placeholder="Asha Wanjiru" />
        </div>
      </div>
      <div className="space-y-1.5">
  <Label htmlFor="su-uni">University / College / Tertiary institution</Label>
  <Input
    id="su-uni"
    list="uni-list"
    value={university}
    onChange={(e) => setUniversity(e.target.value)}
    required
    placeholder="Type to search your institution…"
    autoComplete="off"
  />
  <datalist id="uni-list">
    {(unis ?? []).map((u) => (
      <option key={u.name} value={u.name} />
    ))}
  </datalist>
  <p className="text-[10px] text-muted-foreground">
    Start typing — {unis?.length ?? 0} institutions listed. If yours is missing, type it in exactly.
  </p>
</div>
      
      <div className="space-y-1.5">
        <Label htmlFor="su-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="you@example.com" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="su-pwd">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input id="su-pwd" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="8+ chars, 1 capital, 1 number" />
        </div>
      </div>
      <div className="rounded-lg border bg-secondary/40 p-3 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={hasDisability} onCheckedChange={(v) => setHasDisability(!!v)} id="su-dis" />
          <span className="text-sm">I live with a disability</span>
        </label>
        {hasDisability && (<Input value={disabilityType} onChange={(e) => setDisabilityType(e.target.value)} placeholder="Type of disability (optional, e.g. visual, hearing, physical)" />)}
        <p className="text-[10px] text-muted-foreground">Helps us build an inclusive platform. Private — only you and verified admins can see this.</p>
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
        {loading ? "Creating account…" : "Create my Member ID"}
      </Button>
    </form>
  );
}

function SignInForm({ onForgotPassword, redirectTo }: { onForgotPassword: () => void; redirectTo: string }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back!");
    navigate({ to: redirectTo as "/dashboard", replace: true });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="si-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input id="si-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="si-pwd">Password</Label>
          <button type="button" onClick={onForgotPassword} className="text-xs text-muted-foreground hover:text-primary underline">Forgot password?</button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input id="si-pwd" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
