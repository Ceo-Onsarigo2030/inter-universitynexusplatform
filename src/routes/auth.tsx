import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
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
import { Mail, Lock, User as UserIcon, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Sign in or Join — Inter–Universities Nexus" },
    { name: "description", content: "Sign in to your account or create a Nexus Member ID instantly." },
  ]}),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");

  useEffect(() => { if (!loading && user) navigate({ to: "/dashboard", replace: true }); }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="flex-1 grid lg:grid-cols-2">
        <div className="surface-ink hidden lg:flex items-center justify-center p-12">
          <div className="max-w-md space-y-6">
            <p className="text-gold text-xs uppercase tracking-[0.3em]">Welcome</p>
            <h1 className="heading-display text-5xl text-cream">Join Kenya's most ambitious student platform.</h1>
            <p className="text-cream/70">Sign up once. Receive your official Nexus Member ID instantly. Access programs, events and a national network of student leaders.</p>
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
              <div className="flex gap-2 p-1 rounded-lg bg-secondary mb-6">
                <button onClick={() => setMode("signup")} className={`flex-1 py-2 text-sm rounded-md font-semibold transition ${mode === "signup" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}>Join now</button>
                <button onClick={() => setMode("signin")} className={`flex-1 py-2 text-sm rounded-md font-semibold transition ${mode === "signin" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}>Sign in</button>
              </div>
              {mode === "signup" ? <SignUpForm /> : <SignInForm />}
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" /></div>
              <GoogleButton />
              <p className="mt-6 text-center text-xs text-muted-foreground">By continuing you agree to receive Nexus communications. <Link to="/" className="underline">Back to home</Link>.</p>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function GoogleButton() {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (res.error) { toast.error("Google sign-in failed"); setLoading(false); }
  }
  return <Button onClick={go} disabled={loading} variant="outline" className="w-full border-input">{loading ? "Opening Google…" : "Continue with Google"}</Button>;
}

function SignUpForm() {
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: unis } = useQuery({
    queryKey: ["unis"],
    queryFn: async () => (await supabase.from("universities").select("name").order("name")).data ?? [],
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, university }, emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    if (data.user && !data.session) {
      toast.success("Account created! Please check your email to verify your account.");
    } else {
      toast.success("Welcome to the Nexus!");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5"><Label htmlFor="su-name">Full name</Label>
        <div className="relative"><UserIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input id="su-name" required value={fullName} onChange={e => setFullName(e.target.value)} className="pl-9" placeholder="Asha Wanjiru" /></div>
      </div>
      <div className="space-y-1.5"><Label htmlFor="su-uni">University / College</Label>
        <div className="relative"><GraduationCap className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input id="su-uni" required value={university} onChange={e => setUniversity(e.target.value)} list="uni-list" className="pl-9" placeholder="University of Nairobi" />
          <datalist id="uni-list">{(unis ?? []).map(u => <option key={u.name} value={u.name} />)}</datalist>
        </div>
      </div>
      <div className="space-y-1.5"><Label htmlFor="su-email">Email</Label>
        <div className="relative"><Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input id="su-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="pl-9" placeholder="you@example.com" /></div>
      </div>
      <div className="space-y-1.5"><Label htmlFor="su-pwd">Password</Label>
        <div className="relative"><Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input id="su-pwd" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="pl-9" placeholder="At least 8 characters" /></div>
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">{loading ? "Creating account…" : "Create my Member ID"}</Button>
    </form>
  );
}

function SignInForm() {
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
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5"><Label htmlFor="si-email">Email</Label>
        <div className="relative"><Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input id="si-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="pl-9" /></div>
      </div>
      <div className="space-y-1.5"><Label htmlFor="si-pwd">Password</Label>
        <div className="relative"><Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input id="si-pwd" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="pl-9" /></div>
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">{loading ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}
