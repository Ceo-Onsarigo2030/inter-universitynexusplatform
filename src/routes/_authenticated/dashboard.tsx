import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shield, BadgeCheck } from "lucide-react";
import nexusLogo from "@/assets/nexus-logo.jpg.asset.json";
import baLogo from "@/assets/ba-connect-logo.jpg.asset.json";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard — Nexus" }, { name: "description", content: "Your Nexus member dashboard and digital ID card." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: profile, refetch } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
  });
  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).eq("role", "admin").maybeSingle();
      return !!data;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="surface-ink py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-gold text-xs uppercase tracking-[0.3em]">My Dashboard</p>
          <h1 className="mt-2 heading-display text-4xl text-cream">Welcome, {profile?.full_name?.split(" ")[0] ?? "member"}.</h1>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-[420px_1fr] gap-8">
          <div>
            {profile && <IdCard profile={profile} />}
            {isAdmin && (
              <div className="mt-6 rounded-xl border bg-card p-5 shadow-elegant">
                <div className="flex items-center gap-2 text-primary"><Shield className="size-4 text-gold" /><span className="text-sm font-semibold">Admin access</span></div>
                <p className="text-xs text-muted-foreground mt-1">You can manage members, programs, universities and feedback.</p>
                <Button asChild className="mt-3 w-full bg-primary text-primary-foreground"><Link to="/admin">Open admin dashboard</Link></Button>
              </div>
            )}
          </div>
          <div className="space-y-6">
            {profile && <ProfileEditor profile={profile} onSaved={refetch} />}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function IdCard({ profile }: { profile: { full_name: string; member_id: string; university: string; course: string | null; created_at: string } }) {
  const initials = profile.full_name.split(/\s+/).slice(0,2).map(s => s[0]?.toUpperCase() ?? "").join("");
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-gold border border-gold/40">
      <div className="surface-ink p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={nexusLogo.url} alt="" className="h-10 w-10 object-contain" />
            <img src={baLogo.url} alt="" className="h-10 w-10 object-contain rounded" />
          </div>
          <BadgeCheck className="size-6 text-gold" />
        </div>
        <p className="mt-4 text-[10px] tracking-[0.3em] text-gold/80 uppercase">Inter–Universities Nexus Platform</p>
        <p className="text-[10px] tracking-[0.25em] text-cream/50 uppercase">Official Member Card</p>
      </div>
      <div className="bg-gradient-to-br from-cream via-background to-secondary px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="size-20 rounded-full bg-ink text-gold grid place-items-center font-display text-3xl font-bold border-2 border-gold">{initials || "•"}</div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Member</p>
            <p className="font-display text-2xl font-semibold text-primary truncate">{profile.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.university}</p>
            {profile.course && <p className="text-xs text-muted-foreground truncate italic">{profile.course}</p>}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 pt-4 border-t border-border">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Member ID</p>
            <p className="font-mono text-base font-bold text-primary tracking-wider">{profile.member_id}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Issued</p>
            <p className="text-sm font-semibold text-primary">{new Date(profile.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "short" })}</p>
          </div>
        </div>
      </div>
      <div className="h-2 bg-gradient-to-r from-primary via-accent to-gold" />
    </div>
  );
}

function ProfileEditor({ profile, onSaved }: { profile: { full_name: string; university: string; course: string | null; bio: string | null }; onSaved: () => void }) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [university, setUniversity] = useState(profile.university);
  const [course, setCourse] = useState(profile.course ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [saving, setSaving] = useState(false);
  useEffect(() => { setFullName(profile.full_name); setUniversity(profile.university); setCourse(profile.course ?? ""); setBio(profile.bio ?? ""); }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("profiles").update({ full_name: fullName, university, course: course || null, bio: bio || null, updated_at: new Date().toISOString() }).eq("id", u.user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
    onSaved();
  }

  return (
    <form onSubmit={save} className="rounded-2xl border bg-card p-6 shadow-elegant space-y-4">
      <h2 className="heading-display text-2xl text-primary">My Profile</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label>Full name</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} required /></div>
        <div className="space-y-1.5"><Label>University</Label><Input value={university} onChange={e => setUniversity(e.target.value)} required /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label>Course / Programme</Label><Input value={course} onChange={e => setCourse(e.target.value)} placeholder="e.g. BSc Computer Science" /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label>Bio</Label><Textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell the Nexus a bit about yourself…" /></div>
      </div>
      <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground">{saving ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}
