import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Shield, Send, Bell, FileText, Users, Plus, Trash2,
  Edit2, CheckCircle, CalendarHeart, ThumbsUp, ThumbsDown, Eye
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — UniNexus Connect" }] }),
  component: AdminPage,
});

type Tab = "campaigns" | "push" | "programs" | "articles" | "moderation" | "registrations";

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("campaigns");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          toast.error("Admin access only.");
          navigate({ to: "/" });
        } else {
          setIsAdmin(true);
        }
      });
  }, [user, loading, navigate]);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Verifying admin access…</p>
      </div>
    );
  }

  const TABS: { key: Tab; label: string; icon: typeof Send }[] = [
    { key: "campaigns", label: "Email Campaigns", icon: Send },
    { key: "push", label: "Push Notifications", icon: Bell },
    { key: "programs", label: "Events / Programs", icon: CalendarHeart },
    { key: "articles", label: "Articles", icon: FileText },
    { key: "moderation", label: "Feedback & Suggestions", icon: Eye },
    { key: "registrations", label: "Gala Registrations", icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="size-6 text-gold" />
          <div>
            <h1 className="heading-display text-3xl text-primary">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">UniNexus Connect — Content & Communications Hub</p>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-2 flex-wrap mb-8 border-b border-border pb-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  tab === t.key ? "bg-gold text-ink" : "bg-secondary text-muted-foreground hover:text-primary"
                }`}
              >
                <Icon className="size-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "campaigns" && <EmailCampaigns userId={user!.id} />}
        {tab === "push" && <PushNotifications />}
        {tab === "programs" && <ProgramsManager userId={user!.id} />}
        {tab === "articles" && <ArticlesManager userId={user!.id} />}
        {tab === "moderation" && <ModerationPanel />}
        {tab === "registrations" && <GalaRegistrations />}
      </main>
      <SiteFooter />
    </div>
  );
}

/* ─── EMAIL CAMPAIGNS ──────────────────────────────────────────────────────── */

function EmailCampaigns({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");

  const { data: history } = useQuery({
    queryKey: ["email-campaigns"],
    queryFn: async () =>
      (await supabase.from("email_campaigns").select("*").order("sent_at", { ascending: false }).limit(20)).data ?? [],
  });

  const send = useMutation({
    mutationFn: async () => {
      const { data: campaign, error } = await supabase
        .from("email_campaigns")
        .insert({ subject, body_html: body, audience, sent_by: userId, recipient_count: 0 })
        .select("id").single();
      if (error) throw error;
      const res = await supabase.functions.invoke("send-campaign", {
        body: { campaign_id: campaign.id, subject, body_html: body, audience },
      });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`✅ Sent to ${data?.sent ?? 0} recipients!`);
      setSubject(""); setBody("");
      qc.invalidateQueries({ queryKey: ["email-campaigns"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-lg flex items-center gap-2"><Send className="size-4 text-gold" /> Compose & Send Campaign</h2>
        <p className="text-sm text-muted-foreground">Type your message, select your audience, click Send — it delivers to everyone at once.</p>
        <div className="space-y-1.5">
          <Label>Subject line</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. You're invited — Gala Awards 2026 🎟️" />
        </div>
        <div className="space-y-1.5">
          <Label>Message body (HTML supported)</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10}
            placeholder={"Write your email here. Plain text or HTML both work.\ne.g. <h2>Hello from UniNexus!</h2><p>We have exciting news...</p>"}
            className="font-mono text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label>Audience</Label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone (members + gala + partners)</SelectItem>
              <SelectItem value="members">Registered Members only</SelectItem>
              <SelectItem value="gala_registrants">Gala Registrants only</SelectItem>
              <SelectItem value="partners">Partners only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => send.mutate()} disabled={send.isPending || !subject || !body}
          className="bg-gold text-ink hover:bg-gold/90 font-semibold">
          <Send className="size-4" />
          {send.isPending ? "Sending…" : "Send Campaign Now"}
        </Button>
      </div>

      {(history ?? []).length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><CheckCircle className="size-4 text-green-500" /> Sent Campaigns</h3>
          <div className="space-y-3">
            {history!.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-secondary/40 text-sm">
                <div>
                  <p className="font-semibold">{c.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Audience: {c.audience} · {c.recipient_count} recipients ·{" "}
                    {new Date(c.sent_at).toLocaleDateString("en-KE", { dateStyle: "medium" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────── */

function PushNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/programs");

  const send = useMutation({
    mutationFn: async () => {
      const res = await supabase.functions.invoke("send-push", { body: { title, body, url } });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`🔔 Push sent to ${data?.sent ?? 0} devices!`);
      setTitle(""); setBody(""); setUrl("/programs");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4 max-w-xl">
      <h2 className="font-semibold text-lg flex items-center gap-2"><Bell className="size-4 text-gold" /> Send Push Notification</h2>
      <p className="text-sm text-muted-foreground">Sends an instant pop-up notification to all registered members' phones.</p>
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New Event: Gala Awards 2026 🎉" />
      </div>
      <div className="space-y-1.5">
        <Label>Body (keep under 120 characters)</Label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} placeholder="Short message shown in the notification" />
      </div>
      <div className="space-y-1.5">
        <Label>Tap-to-open link (page path)</Label>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/programs" />
      </div>
      <Button onClick={() => send.mutate()} disabled={send.isPending || !title || !body}
        className="bg-gold text-ink hover:bg-gold/90 font-semibold">
        <Bell className="size-4" />
        {send.isPending ? "Sending…" : "Send to all devices"}
      </Button>
    </div>
  );
}

/* ─── PROGRAMS / EVENTS MANAGER ────────────────────────────────────────────── */

function ProgramsManager({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const empty = { title: "", description: "", overview: "", category: "Gala", event_date: "", location: "", ticket_regular: "", ticket_vip: "", ticket_vvip: "", is_published: true };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { data: programs } = useQuery({
    queryKey: ["admin-programs"],
    queryFn: async () => (await supabase.from("programs").select("*").order("event_date", { ascending: true })).data ?? [],
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        description: form.description,
        overview: form.overview,
        category: form.category,
        event_date: form.event_date || null,
        location: form.location,
        ticket_regular: form.ticket_regular ? Number(form.ticket_regular) : null,
        ticket_vip: form.ticket_vip ? Number(form.ticket_vip) : null,
        ticket_vvip: form.ticket_vvip ? Number(form.ticket_vvip) : null,
        is_published: form.is_published,
        created_by: userId,
      };
      if (editId) {
        const { error } = await supabase.from("programs").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("programs").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editId ? "Event updated!" : "Event published!");
      setForm(empty); setEditId(null); setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-programs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("programs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Event deleted."); qc.invalidateQueries({ queryKey: ["admin-programs"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  function startEdit(p: Record<string, unknown>) {
    setForm({
      title: String(p.title ?? ""),
      description: String(p.description ?? ""),
      overview: String(p.overview ?? ""),
      category: String(p.category ?? "Gala"),
      event_date: p.event_date ? String(p.event_date).slice(0, 16) : "",
      location: String(p.location ?? ""),
      ticket_regular: String(p.ticket_regular ?? ""),
      ticket_vip: String(p.ticket_vip ?? ""),
      ticket_vvip: String(p.ticket_vvip ?? ""),
      is_published: Boolean(p.is_published),
    });
    setEditId(String(p.id));
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg flex items-center gap-2"><CalendarHeart className="size-4 text-gold" /> Events & Programs</h2>
        {!open && (
          <Button onClick={() => { setForm(empty); setEditId(null); setOpen(true); }} size="sm" className="bg-gold text-ink hover:bg-gold/90">
            <Plus className="size-4" /> New Event
          </Button>
        )}
      </div>

      {open && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h3 className="font-semibold">{editId ? "Edit Event" : "New Event"}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gala">Gala / Awards</SelectItem>
                  <SelectItem value="Summit">Summit</SelectItem>
                  <SelectItem value="Forum">Forum</SelectItem>
                  <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                  <SelectItem value="Showcase">Showcase</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date & Time</Label>
              <Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. KISE, Kasarani, Nairobi" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Short Description (shown on cards)</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Full Overview (shown in detail view)</Label>
              <Textarea value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} rows={6} />
            </div>
            <div className="space-y-1.5">
              <Label>Ticket — Regular (KSh)</Label>
              <Input type="number" value={form.ticket_regular} onChange={(e) => setForm({ ...form, ticket_regular: e.target.value })} placeholder="e.g. 1500" />
            </div>
            <div className="space-y-1.5">
              <Label>Ticket — VIP (KSh)</Label>
              <Input type="number" value={form.ticket_vip} onChange={(e) => setForm({ ...form, ticket_vip: e.target.value })} placeholder="e.g. 3000" />
            </div>
            <div className="space-y-1.5">
              <Label>Ticket — VVIP (KSh)</Label>
              <Input type="number" value={form.ticket_vvip} onChange={(e) => setForm({ ...form, ticket_vvip: e.target.value })} placeholder="e.g. 5000" />
            </div>
            <div className="space-y-1.5">
              <Label>Published?</Label>
              <Select value={form.is_published ? "yes" : "no"} onValueChange={(v) => setForm({ ...form, is_published: v === "yes" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">✅ Published (visible on site)</SelectItem>
                  <SelectItem value="no">📝 Draft (hidden)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.title} className="bg-gold text-ink hover:bg-gold/90">
              {save.isPending ? "Saving…" : editId ? "Update Event" : "Publish Event"}
            </Button>
            <Button variant="outline" onClick={() => { setOpen(false); setEditId(null); setForm(empty); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(programs ?? []).map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-4 p-4 rounded-xl border bg-card">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold truncate">{p.title}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${p.is_published ? "bg-green-900/40 text-green-300" : "bg-yellow-900/40 text-yellow-300"}`}>
                  {p.is_published ? "Published" : "Draft"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {p.event_date ? new Date(p.event_date).toLocaleDateString("en-KE", { dateStyle: "medium", timeStyle: "short" }) : "Date TBA"} · {p.location ?? "No location"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.category}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => startEdit(p as unknown as Record<string, unknown>)}><Edit2 className="size-3.5" /></Button>
              <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete this event?")) del.mutate(p.id); }}><Trash2 className="size-3.5" /></Button>
            </div>
          </div>
        ))}
        {(programs ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No events yet.</p>}
      </div>
    </div>
  );
}

/* ─── ARTICLES MANAGER ─────────────────────────────────────────────────────── */

function ArticlesManager({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const empty = { title: "", body: "", excerpt: "", category: "General", slug: "", status: "published" };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { data: articles } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => (await supabase.from("articles").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        body: form.body,
        excerpt: form.excerpt,
        category: form.category,
        slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        status: form.status,
        author_id: userId,
        published_at: form.status === "published" ? new Date().toISOString() : null,
      };
      if (editId) {
        const { error } = await supabase.from("articles").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("articles").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editId ? "Article updated!" : "Article published!");
      setForm(empty); setEditId(null); setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Article deleted."); qc.invalidateQueries({ queryKey: ["admin-articles"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  function startEdit(a: Record<string, unknown>) {
    setForm({
      title: String(a.title ?? ""),
      body: String(a.body ?? ""),
      excerpt: String(a.excerpt ?? ""),
      category: String(a.category ?? "General"),
      slug: String(a.slug ?? ""),
      status: String(a.status ?? "published"),
    });
    setEditId(String(a.id));
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg flex items-center gap-2"><FileText className="size-4 text-gold" /> Articles & Announcements</h2>
        {!open && (
          <Button onClick={() => { setForm(empty); setEditId(null); setOpen(true); }} size="sm" className="bg-gold text-ink hover:bg-gold/90">
            <Plus className="size-4" /> New Article
          </Button>
        )}
      </div>

      {open && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h3 className="font-semibold">{editId ? "Edit Article" : "New Article"}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Article title" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="General" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">✅ Published</SelectItem>
                  <SelectItem value="draft">📝 Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Excerpt (preview text)</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} placeholder="Short summary shown in article cards" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Full Body (HTML supported)</Label>
              <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={12} className="font-mono text-sm" placeholder="<h2>Introduction</h2><p>Your content here...</p>" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.title} className="bg-gold text-ink hover:bg-gold/90">
              {save.isPending ? "Saving…" : editId ? "Update Article" : "Publish Article"}
            </Button>
            <Button variant="outline" onClick={() => { setOpen(false); setEditId(null); setForm(empty); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(articles ?? []).map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-4 p-4 rounded-xl border bg-card">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold truncate">{a.title}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${a.status === "published" ? "bg-green-900/40 text-green-300" : "bg-yellow-900/40 text-yellow-300"}`}>
                  {a.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{a.excerpt}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.category} · {new Date(a.created_at).toLocaleDateString("en-KE", { dateStyle: "medium" })}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => startEdit(a as unknown as Record<string, unknown>)}><Edit2 className="size-3.5" /></Button>
              <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete this article?")) del.mutate(a.id); }}><Trash2 className="size-3.5" /></Button>
            </div>
          </div>
        ))}
        {(articles ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No articles yet.</p>}
      </div>
    </div>
  );
}

/* ─── MODERATION PANEL ─────────────────────────────────────────────────────── */

function ModerationPanel() {
  const qc = useQueryClient();

  const { data: feedbacks } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: async () => (await supabase.from("feedback").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const { data: suggestions } = useQuery({
    queryKey: ["admin-suggestions"],
    queryFn: async () => (await supabase.from("suggestions").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const approveFeedback = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase.from("feedback").update({ approved }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated!"); qc.invalidateQueries({ queryKey: ["admin-feedback"] }); },
  });

  const delFeedback = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feedback").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["admin-feedback"] }); },
  });

  const approveSuggestion = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase.from("suggestions").update({ approved }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated!"); qc.invalidateQueries({ queryKey: ["admin-suggestions"] }); },
  });

  const delSuggestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suggestions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["admin-suggestions"] }); },
  });

  return (
    <div className="space-y-10">
      {/* FEEDBACK */}
      <div>
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-4"><Eye className="size-4 text-gold" /> Feedback Wall ({feedbacks?.length ?? 0})</h2>
        <div className="space-y-3">
          {(feedbacks ?? []).map((f) => (
            <div key={f.id} className={`p-4 rounded-xl border bg-card flex items-start justify-between gap-4 ${!f.approved ? "border-yellow-500/40" : ""}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{f.name}</p>
                  {f.university && <span className="text-xs text-muted-foreground">{f.university}</span>}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${f.approved ? "bg-green-900/40 text-green-300" : "bg-yellow-900/40 text-yellow-300"}`}>
                    {f.approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{f.message}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => approveFeedback.mutate({ id: f.id, approved: !f.approved })}>
                  {f.approved ? <ThumbsDown className="size-3.5" /> : <ThumbsUp className="size-3.5" />}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete?")) delFeedback.mutate(f.id); }}><Trash2 className="size-3.5" /></Button>
              </div>
            </div>
          ))}
          {(feedbacks ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No feedback yet.</p>}
        </div>
      </div>

      {/* SUGGESTIONS */}
      <div>
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-4"><Eye className="size-4 text-gold" /> Suggestion Wall ({suggestions?.length ?? 0})</h2>
        <div className="space-y-3">
          {(suggestions ?? []).map((s) => (
            <div key={s.id} className={`p-4 rounded-xl border bg-card flex items-start justify-between gap-4 ${!s.approved ? "border-yellow-500/40" : ""}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{s.name}</p>
                  {s.university && <span className="text-xs text-muted-foreground">{s.university}</span>}
                  <span className="text-xs text-muted-foreground">{s.category}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${s.approved ? "bg-green-900/40 text-green-300" : "bg-yellow-900/40 text-yellow-300"}`}>
                    {s.approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{s.message}</p>
                <p className="text-xs text-muted-foreground mt-1">👍 {s.upvotes} upvotes</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => approveSuggestion.mutate({ id: s.id, approved: !s.approved })}>
                  {s.approved ? <ThumbsDown className="size-3.5" /> : <ThumbsUp className="size-3.5" />}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete?")) delSuggestion.mutate(s.id); }}><Trash2 className="size-3.5" /></Button>
              </div>
            </div>
          ))}
          {(suggestions ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No suggestions yet.</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── GALA REGISTRATIONS ───────────────────────────────────────────────────── */

function GalaRegistrations() {
  const { data: regs } = useQuery({
    queryKey: ["admin-gala-regs"],
    queryFn: async () => (await supabase.from("gala_registrations").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg flex items-center gap-2"><Users className="size-4 text-gold" /> Gala Registrations ({regs?.length ?? 0})</h2>
      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-secondary/60">
            <tr>
              <th className="text-left p-3 font-semibold">Name</th>
              <th className="text-left p-3 font-semibold">Email</th>
              <th className="text-left p-3 font-semibold">Institution</th>
              <th className="text-left p-3 font-semibold">Tier</th>
              <th className="text-left p-3 font-semibold">Pass ID</th>
              <th className="text-left p-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {(regs ?? []).map((r, i) => (
              <tr key={r.id} className={i % 2 === 0 ? "bg-background" : "bg-secondary/20"}>
                <td className="p-3 font-medium">{r.full_name}</td>
                <td className="p-3 text-muted-foreground">{r.email}</td>
                <td className="p-3 text-muted-foreground">{r.institution ?? "—"}</td>
                <td className="p-3">
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                    r.ticket_tier === "vvip" ? "bg-red-900/40 text-red-300" :
                    r.ticket_tier === "vip" ? "bg-blue-900/40 text-blue-300" :
                    "bg-green-900/40 text-green-300"
                  }`}>{r.ticket_tier}</span>
                </td>
                <td className="p-3 font-mono text-xs text-gold">{r.pass_id}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-KE")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(regs ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">No registrations yet.</p>
        )}
      </div>
    </div>
  );
}
