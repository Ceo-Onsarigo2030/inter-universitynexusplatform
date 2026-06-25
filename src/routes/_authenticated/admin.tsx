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

function ArticlesAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-articles"], queryFn: async () => (await supabase.from("articles").select("*").order("updated_at", { ascending: false })).data ?? [] });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<typeof data extends Array<infer T> | null ? T | null : never>(null as never);
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => { setEditing(null as never); setOpen(!open); }} className="bg-primary text-primary-foreground"><Plus className="size-4" /> {open ? "Cancel" : "New article"}</Button></div>
      {open && <ArticleForm initial={editing} onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["admin-articles"] }); qc.invalidateQueries({ queryKey: ["articles-all"] }); qc.invalidateQueries({ queryKey: ["articles-preview"] }); }} />}
      <div className="grid gap-3">
        {data?.map(a => (
          <div key={a.id} className="rounded-lg border bg-card p-4 flex justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-accent">{a.category} · <span className={a.status === "draft" ? "text-amber-600" : "text-emerald-600"}>{a.status}</span></p>
              <p className="font-display text-lg text-primary">{a.title}</p>
              {a.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => { setEditing(a as never); setOpen(true); }}>Edit</Button>
              <Button variant="ghost" size="icon" onClick={async () => {
                if (!confirm("Delete article?")) return;
                const { error } = await supabase.from("articles").delete().eq("id", a.id);
                if (error) toast.error(error.message); else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-articles"] }); }
              }}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
        {!data?.length && <p className="text-muted-foreground text-center py-8">No articles yet.</p>}
      </div>
    </div>
  );
}

function ArticleForm({ initial, onDone }: { initial: { id: string; title: string; slug: string; excerpt: string | null; body: string; category: string; status: string } | null; onDone: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [category, setCategory] = useState(initial?.category ?? "news");
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const autoSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setSaving(true);
    const payload = { title, slug: autoSlug, excerpt: excerpt || null, body, category, status, published_at: status === "published" ? new Date().toISOString() : null };
    const res = initial ? await supabase.from("articles").update(payload).eq("id", initial.id) : await supabase.from("articles").insert(payload);
    setSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(initial ? "Article updated" : "Article saved"); onDone();
  }
  return (
    <form onSubmit={save} className="rounded-xl border bg-card p-5 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
        <div className="space-y-1.5"><Label>Slug (auto if empty)</Label><Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. data-protection" /></div>
        <div className="space-y-1.5"><Label>Category</Label>
          <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["news","announcement","policy","event-recap","feature"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Status</Label>
          <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["draft","published"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5"><Label>Excerpt</Label><Input value={excerpt} onChange={e => setExcerpt(e.target.value)} maxLength={300} /></div>
      <div className="space-y-1.5"><Label>Body (markdown: ##, ###, - for bullets)</Label><Textarea rows={10} value={body} onChange={e => setBody(e.target.value)} required /></div>
      <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground">{saving ? "Saving…" : initial ? "Update article" : "Save article"}</Button>
    </form>
  );
}

function SuggestionsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-suggestions"], queryFn: async () => (await supabase.from("suggestions").select("*").order("created_at", { ascending: false })).data ?? [] });
  return (
    <div className="grid gap-3">
      {data?.map(s => (
        <div key={s.id} className={`rounded-lg border bg-card p-4 ${!s.approved ? "opacity-60" : ""}`}>
          <div className="flex justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-accent">{s.category}</p>
              <p className="text-sm mt-1">{s.message}</p>
              <p className="text-xs text-muted-foreground mt-2"><span className="font-semibold text-primary">{s.name}</span>{s.university && ` · ${s.university}`} · {format(new Date(s.created_at), "PP p")}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={async () => {
                const { error } = await supabase.from("suggestions").update({ approved: !s.approved }).eq("id", s.id);
                if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin-suggestions"] });
              }}>{s.approved ? <XCircle className="size-4" /> : <CheckCircle className="size-4 text-primary" />}</Button>
              <Button variant="ghost" size="icon" onClick={async () => {
                if (!confirm("Delete suggestion?")) return;
                const { error } = await supabase.from("suggestions").delete().eq("id", s.id);
                if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin-suggestions"] });
              }}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          </div>
        </div>
      ))}
      {!data?.length && <p className="text-muted-foreground text-center py-8">No suggestions yet.</p>}
    </div>
  );
}

function ReportsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-reports"], queryFn: async () => (await supabase.from("feedback_reports").select("*, feedback(message,name)").order("created_at", { ascending: false })).data ?? [] });
  return (
    <div className="grid gap-3">
      {data?.map(r => (
        <div key={r.id} className={`rounded-lg border bg-card p-4 ${r.resolved ? "opacity-60" : ""}`}>
          <p className="text-[10px] uppercase tracking-widest text-destructive font-semibold">Report · {r.resolved ? "Resolved" : "Open"}</p>
          <p className="text-sm font-semibold mt-2">Reason: {r.reason}</p>
          {(r as { feedback?: { message?: string; name?: string } }).feedback?.message && (
            <div className="mt-2 rounded-lg bg-secondary/50 p-3 text-sm">
              <p className="text-xs text-muted-foreground">Reported comment by {(r as { feedback?: { name?: string } }).feedback?.name}:</p>
              <p className="italic">"{(r as { feedback?: { message?: string } }).feedback?.message}"</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">{format(new Date(r.created_at), "PP p")}</p>
          {!r.resolved && (
            <Button size="sm" variant="outline" className="mt-3" onClick={async () => {
              const { error } = await supabase.from("feedback_reports").update({ resolved: true }).eq("id", r.id);
              if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin-reports"] });
            }}>Mark resolved</Button>
          )}
        </div>
      ))}
      {!data?.length && <p className="text-muted-foreground text-center py-8">No reports yet.</p>}
    </div>
  );
}

function PartnersAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-partners"], queryFn: async () => (await supabase.from("partner_inquiries").select("*").order("created_at", { ascending: false })).data ?? [] });
  return (
    <div className="grid gap-3">
      {data?.map(p => (
        <div key={p.id} className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex justify-between gap-3 items-start">
            <div>
              <p className="font-display text-lg text-primary">{p.organization}</p>
              <p className="text-xs text-muted-foreground">{p.contact_name} · <a href={`mailto:${p.email}`} className="underline">{p.email}</a> {p.phone && <>· {p.phone}</>}</p>
              <p className="text-[10px] uppercase tracking-widest text-accent mt-1">{p.partnership_type} · {p.status}</p>
            </div>
            <Select value={p.status} onValueChange={async (v) => {
              const { error } = await supabase.from("partner_inquiries").update({ status: v }).eq("id", p.id);
              if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin-partners"] });
            }}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{["new","contacted","in-talks","accepted","declined"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <p className="text-sm">{p.message}</p>
          {p.proposal_url && <a href={p.proposal_url} target="_blank" rel="noreferrer" className="text-xs text-accent underline">View proposal</a>}
          <p className="text-xs text-muted-foreground">{format(new Date(p.created_at), "PP p")}</p>
        </div>
      ))}
      {!data?.length && <p className="text-muted-foreground text-center py-8">No partner inquiries yet.</p>}
    </div>
  );
}
