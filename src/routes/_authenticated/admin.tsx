import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus, CheckCircle, XCircle, FileText, Handshake, Flag, Lightbulb } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
    if (!role) throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Admin — Nexus" }] }),
  component: Admin,
});

function Admin() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="surface-ink py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-gold text-xs uppercase tracking-[0.3em]">Admin Console</p>
          <h1 className="mt-2 heading-display text-4xl text-cream">Platform Management</h1>
        </div>
      </section>
      <section className="py-10 flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Tabs defaultValue="overview">
            <TabsList className="bg-secondary flex-wrap h-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="programs">Programs</TabsTrigger>
              <TabsTrigger value="universities">Universities</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="articles"><FileText className="size-3.5" /> Articles</TabsTrigger>
              <TabsTrigger value="suggestions"><Lightbulb className="size-3.5" /> Suggestions</TabsTrigger>
              <TabsTrigger value="reports"><Flag className="size-3.5" /> Reports</TabsTrigger>
              <TabsTrigger value="partners"><Handshake className="size-3.5" /> Partners</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6"><Overview /></TabsContent>
            <TabsContent value="members" className="mt-6"><MembersAdmin /></TabsContent>
            <TabsContent value="programs" className="mt-6"><ProgramsAdmin /></TabsContent>
            <TabsContent value="universities" className="mt-6"><UniversitiesAdmin /></TabsContent>
            <TabsContent value="feedback" className="mt-6"><FeedbackAdmin /></TabsContent>
            <TabsContent value="articles" className="mt-6"><ArticlesAdmin /></TabsContent>
            <TabsContent value="suggestions" className="mt-6"><SuggestionsAdmin /></TabsContent>
            <TabsContent value="reports" className="mt-6"><ReportsAdmin /></TabsContent>
            <TabsContent value="partners" className="mt-6"><PartnersAdmin /></TabsContent>
          </Tabs>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function Overview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [m, u, p, f] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("universities").select("id", { count: "exact", head: true }),
        supabase.from("programs").select("id", { count: "exact", head: true }),
        supabase.from("feedback").select("id", { count: "exact", head: true }),
      ]);
      return { members: m.count ?? 0, unis: u.count ?? 0, programs: p.count ?? 0, feedback: f.count ?? 0 };
    }
  });
  const items = [
    { l: "Members", v: data?.members ?? 0 }, { l: "Universities", v: data?.unis ?? 0 },
    { l: "Programs", v: data?.programs ?? 0 }, { l: "Feedback posts", v: data?.feedback ?? 0 },
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(it => (
        <div key={it.l} className="rounded-xl border bg-card p-6">
          <p className="text-3xl heading-display text-primary">{it.v.toLocaleString()}</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{it.l}</p>
        </div>
      ))}
    </div>
  );
}

function MembersAdmin() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-members"],
    queryFn: async () => (await supabase.from("profiles").select("*").order("member_number", { ascending: true })).data ?? [],
  });
  if (isLoading) return <p>Loading…</p>;
  return (
    <div className="rounded-xl border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left text-xs uppercase tracking-wider"><tr><th className="p-3">Member ID</th><th className="p-3">Name</th><th className="p-3">University</th><th className="p-3">Joined</th></tr></thead>
        <tbody>{data?.map(m => (
          <tr key={m.id} className="border-t"><td className="p-3 font-mono text-accent">{m.member_id}</td><td className="p-3 font-medium">{m.full_name}</td><td className="p-3 text-muted-foreground">{m.university}</td><td className="p-3 text-muted-foreground">{format(new Date(m.created_at), "PP")}</td></tr>
        ))}</tbody>
      </table>
      {!data?.length && <p className="p-6 text-muted-foreground text-center">No members yet.</p>}
    </div>
  );
}

function ProgramsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-programs"], queryFn: async () => (await supabase.from("programs").select("*").order("created_at", { ascending: false })).data ?? [] });
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setOpen(!open)} className="bg-primary text-primary-foreground"><Plus className="size-4" /> {open ? "Cancel" : "New program"}</Button></div>
      {open && <ProgramForm onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["admin-programs"] }); qc.invalidateQueries({ queryKey: ["programs", "published"] }); }} />}
      <div className="grid gap-3">
        {data?.map(p => (
          <div key={p.id} className="rounded-lg border bg-card p-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-accent">{p.category}{!p.is_published && " · Draft"}</p>
              <p className="font-display text-lg text-primary">{p.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
              {p.event_date && <p className="text-xs text-muted-foreground mt-1">{format(new Date(p.event_date), "PPP")}{p.location ? ` · ${p.location}` : ""}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={async () => {
              if (!confirm("Delete this program?")) return;
              const { error } = await supabase.from("programs").delete().eq("id", p.id);
              if (error) toast.error(error.message); else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-programs"] }); }
            }}><Trash2 className="size-4 text-destructive" /></Button>
          </div>
        ))}
        {!data?.length && <p className="text-muted-foreground text-center py-8">No programs yet.</p>}
      </div>
    </div>
  );
}

function ProgramForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState(""); const [cat, setCat] = useState("Summit"); const [date, setDate] = useState(""); const [loc, setLoc] = useState("");
  const [saving, setSaving] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("programs").insert({ title, description: desc, category: cat, event_date: date || null, location: loc || null, created_by: u.user?.id ?? null });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Program created"); onDone();
  }
  return (
    <form onSubmit={save} className="rounded-xl border bg-card p-5 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
        <div className="space-y-1.5"><Label>Category</Label>
          <Select value={cat} onValueChange={setCat}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Summit","Forum","Bootcamp","Showcase","Wellness","Competition","Mentorship","Exhibition"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Event date</Label><Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Location</Label><Input value={loc} onChange={e => setLoc(e.target.value)} /></div>
      </div>
      <div className="space-y-1.5"><Label>Description</Label><Textarea rows={4} value={desc} onChange={e => setDesc(e.target.value)} required /></div>
      <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground">{saving ? "Saving…" : "Create program"}</Button>
    </form>
  );
}

function UniversitiesAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-unis"], queryFn: async () => (await supabase.from("universities").select("*").order("name")).data ?? [] });
  const [name, setName] = useState(""); const [loc, setLoc] = useState("");
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("universities").insert({ name, location: loc || null });
    if (error) { toast.error(error.message); return; }
    setName(""); setLoc(""); qc.invalidateQueries({ queryKey: ["admin-unis"] }); toast.success("Added");
  }
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider"><tr><th className="p-3">Name</th><th className="p-3">Location</th><th className="p-3"></th></tr></thead>
          <tbody>{data?.map(u => (
            <tr key={u.id} className="border-t"><td className="p-3 font-medium">{u.name}</td><td className="p-3 text-muted-foreground">{u.location ?? "—"}</td>
              <td className="p-3 text-right"><Button variant="ghost" size="icon" onClick={async () => {
                if (!confirm("Remove?")) return;
                const { error } = await supabase.from("universities").delete().eq("id", u.id);
                if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin-unis"] });
              }}><Trash2 className="size-4 text-destructive" /></Button></td></tr>
          ))}</tbody>
        </table>
      </div>
      <form onSubmit={add} className="rounded-xl border bg-card p-5 space-y-3 h-fit">
        <h3 className="font-display text-xl text-primary">Add university</h3>
        <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
        <div className="space-y-1.5"><Label>Location</Label><Input value={loc} onChange={e => setLoc(e.target.value)} /></div>
        <Button type="submit" className="bg-primary text-primary-foreground w-full">Add</Button>
      </form>
    </div>
  );
}

function FeedbackAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-feedback"], queryFn: async () => (await supabase.from("feedback").select("*").order("created_at", { ascending: false })).data ?? [] });
  async function toggle(id: string, approved: boolean) {
    const { error } = await supabase.from("feedback").update({ approved: !approved }).eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin-feedback"] });
  }
  async function del(id: string) {
    if (!confirm("Delete this comment?")) return;
    const { error } = await supabase.from("feedback").delete().eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin-feedback"] });
  }
  return (
    <div className="grid gap-3">
      {data?.map(f => (
        <div key={f.id} className={`rounded-lg border bg-card p-4 ${!f.approved ? "opacity-60" : ""}`}>
          <div className="flex justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm">{f.message}</p>
              <p className="text-xs text-muted-foreground mt-2"><span className="font-semibold text-primary">{f.name}</span>{f.university && ` · ${f.university}`} · {format(new Date(f.created_at), "PP p")}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => toggle(f.id, f.approved)} title={f.approved ? "Hide" : "Approve"}>{f.approved ? <XCircle className="size-4" /> : <CheckCircle className="size-4 text-primary" />}</Button>
              <Button variant="ghost" size="icon" onClick={() => del(f.id)}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          </div>
        </div>
      ))}
      {!data?.length && <p className="text-muted-foreground text-center py-8">No feedback yet.</p>}
    </div>
  );
}
