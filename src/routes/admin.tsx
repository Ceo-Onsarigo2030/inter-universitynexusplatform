import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { Shield, Send, Bell, FileText, Users, Plus, Trash2, Edit2, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — UniNexus Connect" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"articles" | "campaigns" | "push" | "registrations">("campaigns");

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth", search: { redirect: "/admin" } as never }); return; }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { navigate({ to: "/" }); toast.error("Admin access only."); }
        else setIsAdmin(true);
      });
  }, [user, loading, navigate]);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Verifying admin access…</p>
      </div>
    );
  }

  const TABS = [
    { key: "campaigns", label: "Email Campaigns", icon: Send },
    { key: "push", label: "Push Notifications", icon: Bell },
    { key: "articles", label: "Articles / Content", icon: FileText },
    { key: "registrations", label: "Gala Registrations", icon: Users },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="size-6 text-gold" />
          <div>
            <h1 className="heading-display text-3xl text-primary">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">UniNexus Connect — Content & Communications</p>
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
                  tab === t.key
                    ? "bg-gold text-ink"
                    : "bg-secondary text-muted-foreground hover:text-primary"
                }`}
              >
                <Icon className="size-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "campaigns" && <EmailCampaigns />}
        {tab === "push" && <PushNotifications />}
        {tab === "articles" && <ArticlesManager />}
        {tab === "registrations" && <GalaRegistrations />}
      </main>
      <SiteFooter />
    </div>
  );
}

// ─── EMAIL CAMPAIGNS ───────────────────────────────────────────────────────────

function EmailCampaigns() {
  const qc = useQueryClient();
  const { user } = useAuth();
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
      // Save campaign record first
      const { data: campaign, error } = await supabase
        .from("email_campaigns")
        .insert({ subject, body_html: body, audience, sent_by: user?.id, recipient_count: 0 })
        .select("id")
        .single();
      if (error) throw error;

      // Invoke edge function
      const res = await supabase.functions.invoke("send-campaign", {
        body: { campaign_id: campaign.id, subject, body_html: body, audience },
      });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`✅ Campaign sent to ${data?.sent ?? 0} recipients!`);
      setSubject("");
      setBody("");
      qc.invalidateQueries({ queryKey: ["email-campaigns"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-lg flex items-center gap-2"><Send className="size-4 text-gold" /> Compose & Send Campaign</h2>
        <p className="text-sm text-muted-foreground">Type your message below, select your audience, and hit Send — it delivers to everyone at once.</p>

        <div className="space-y-1.5">
          <Label>Subject line</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. You're invited — Gala Awards 2026 🎟️" />
        </div>

        <div className="space-y-1.5">
          <Label>Message body (HTML supported)</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            placeholder="Write your email here. You can use plain text or HTML. e.g. <h2>Hello from UniNexus!</h2><p>We have exciting news...</p>"
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Audience</Label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone (all members + gala + partners)</SelectItem>
              <SelectItem value="members">Registered Members only</SelectItem>
              <SelectItem value="gala_registrants">Gala Registrants only</SelectItem>
              <SelectItem value="partners">Partners only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => send.mutate()}
          disabled={send.isPending || !subject || !body}
          className="bg-gold text-ink hover:bg-gold/90 font-semibold w-full sm:w-auto"
        >
          <Send className="size-4" />
          {send.isPending ? "Sending to everyone…" : "Send Campaign"}
        </Button>
      </div>

      {/* Campaign history */}
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

// ─── PUSH NOTIFICATIONS ────────────────────────────────────────────────────────

function PushNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");

  const send = useMutation({
    mutationFn: async () => {
      const res = await supabase.functions.invoke("send-push", {
        body: { title, body, url },
      });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`🔔 Push sent to ${data?.sent ?? 0} devices!`);
      setTitle("");
      setBody("");
      setUrl("/");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4 max-w-xl">
      <h2 className="font-semibold text-lg flex items-center gap-2"><Bell className="size-4 text-gold" /> Send Push Notification</h2>
      <p className="text-sm text-muted-foreground">Sends a real-time pop-up notification to all registered members' phones instantly.</p>

      <div className="space-y-1.5">
        <Label>Notification title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New Event: Gala Awards 2026 🎉" />
      </div>
      <div className="space-y-1.5">
        <Label>Notification body</Label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Short message (keep under 120 characters for best display)" />
      </div>
      <div className="space-y-1.5">
        <Label>Tap-to-open link (path on the site)</Label>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/programs" />
      </div>

      <Button
        onClick={() => send.mutate()}
        disabled={send.isPending || !title || !body}
        className="bg-gold text-ink hover:bg-gold/90 font-semibold"
      >
        <Bell className="size-4" />
        {send.isPending ? "Sending push…" : "Send to all devices"}
      </Button>
    </div>
  );
}

// ─── ARTICLES MANAGER ──────────────────────────────────────────────────────────

function ArticlesManager() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [editing, setEditing] = useState<Record<string, string> | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", summary: "", content: "", slug: "" });

  const { data: articles } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () =>
      (await supabase.from("articles").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("articles").update(form).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("articles")
          .insert({ ...form, author_id: user?.id, is_published: true });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Article updated!" : "Article published!");
      setEditing(null);
      setCreating(false);
      setForm({ title: "", summary: "", content: "", slug: "" });
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Article deleted.");
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isFormOpen = creating || !!editing;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg flex items-center gap-2"><FileText className="size-4 text-gold" /> Articles & Content</h2>
        {!isFormOpen && (
          <Button onClick={() => setCreating(true)} size="sm" className="bg-gold text-ink hover:bg-gold/90">
            <Plus className="size-4" /> New Article
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h3 className="font-semibold">{editing ? "Edit Article" : "New Article"}</h3>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Article title" />
          </div>
          <div className="space-y-1.5">
            <Label>Slug (URL path, e.g. my-article-title)</Label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} placeholder="my-article-title" />
          </div>
          <div className="space-y-1.5">
            <Label>Summary (shown in preview cards)</Label>
            <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Content (HTML supported)</Label>
            <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} className="font-mono text-sm" />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.title} className="bg-gold text-ink hover:bg-gold/90">
              {save.isPending ? "Saving…" : editing ? "Update Article" : "Publish Article"}
            </Button>
            <Button
              variant="outline"
              onClick={() => { setEditing(null); setCreating(false); setForm({ title: "", summary: "", content: "", slug: "" }); }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(articles ?? []).map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-4 p-4 rounded-xl border bg-card">
            <div>
              <p className="font-semibold">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.summary}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(a.created_at).toLocaleDateString("en-KE", { dateStyle: "medium" })}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(a);
                  setForm({ title: a.title, summary: a.summary ?? "", content: a.content ?? "", slug: a.slug ?? "" });
                  setCreating(false);
                }}
              >
                <Edit2 className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (confirm("Delete this article?")) del.mutate(a.id);
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {(articles ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No articles yet. Create the first one!</p>
        )}
      </div>
    </div>
  );
}

// ─── GALA REGISTRATIONS ────────────────────────────────────────────────────────

function GalaRegistrations() {
  const { data: regs } = useQuery({
    queryKey: ["admin-gala-regs"],
    queryFn: async () =>
      (await supabase.from("gala_registrations").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg flex items-center gap-2"><Users className="size-4 text-gold" /> Gala Registrations ({regs?.length ?? 0})</h2>
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60">
            <tr>
              <th className="text-left p-3 font-semibold">Name</th>
              <th className="text-left p-3 font-semibold hidden sm:table-cell">Email</th>
              <th className="text-left p-3 font-semibold hidden md:table-cell">Institution</th>
              <th className="text-left p-3 font-semibold">Tier</th>
              <th className="text-left p-3 font-semibold hidden lg:table-cell">Pass ID</th>
            </tr>
          </thead>
          <tbody>
            {(regs ?? []).map((r, i) => (
              <tr key={r.id} className={i % 2 === 0 ? "bg-background" : "bg-secondary/20"}>
                <td className="p-3">{r.full_name}</td>
                <td className="p-3 hidden sm:table-cell text-muted-foreground">{r.email}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{r.institution}</td>
                <td className="p-3">
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                    r.ticket_tier === "vvip" ? "bg-red-900/40 text-red-300" :
                    r.ticket_tier === "vip" ? "bg-blue-900/40 text-blue-300" :
                    "bg-green-900/40 text-green-300"
                  }`}>
                    {r.ticket_tier}
                  </span>
                </td>
                <td className="p-3 hidden lg:table-cell font-mono text-xs text-gold">{r.pass_id}</td>
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
