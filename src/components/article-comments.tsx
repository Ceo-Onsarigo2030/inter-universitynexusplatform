import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageCircle, Shield, Trash2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Comment = {
  id: string;
  body: string;
  approved: boolean;
  created_at: string;
  user_id: string;
  author_name?: string | null;
  author_member_id?: string | null;
};

export function ArticleComments({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
      return data;
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["article-comments", articleId, user?.id, isAdmin],
    queryFn: async () => {
      const { data, error } = await supabase.from("article_comments").select("id, body, approved, created_at, user_id").eq("article_id", articleId).order("created_at", { ascending: false });
      if (error) throw error;
      const ids = Array.from(new Set((data ?? []).map((c) => c.user_id)));
      let profiles: Record<string, { full_name: string; member_id: string }> = {};
      if (ids.length) {
        const { data: p } = await supabase.from("profiles").select("id, full_name, member_id").in("id", ids);
        profiles = Object.fromEntries((p ?? []).map((x) => [x.id, { full_name: x.full_name, member_id: x.member_id }]));
      }
      return (data ?? []).map((c) => ({ ...c, author_name: profiles[c.user_id]?.full_name ?? "Member", author_member_id: profiles[c.user_id]?.member_id ?? null })) as Comment[];
    },
  });

  const post = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to comment");
      const trimmed = body.trim();
      if (trimmed.length < 2) throw new Error("Comment too short");
      const { error } = await supabase.from("article_comments").insert({ article_id: articleId, user_id: user.id, body: trimmed });
      if (error) throw error;
    },
    onSuccess: () => { setBody(""); toast.success("Comment submitted — visible after admin approval."); qc.invalidateQueries({ queryKey: ["article-comments", articleId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const approve = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("article_comments").update({ approved: true }).eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["article-comments", articleId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("article_comments").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["article-comments", articleId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="heading-display text-2xl text-primary flex items-center gap-2">
        <MessageCircle className="size-5 text-gold" /> Member Discussion
      </h2>
      {user ? (
        <form onSubmit={(e) => { e.preventDefault(); post.mutate(); }} className="mt-5 space-y-2">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your thoughts… (will appear after admin approval)" rows={3} maxLength={2000} />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Signed in as a Nexus member</p>
            <Button type="submit" disabled={post.isPending || body.trim().length < 2}>{post.isPending ? "Posting…" : "Post comment"}</Button>
          </div>
        </form>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed bg-secondary/40 p-4 text-sm">
          <Link to="/auth" className="text-accent underline font-semibold">Sign in</Link> with your Nexus Member ID to join the discussion.
        </div>
      )}
      <ul className="mt-8 space-y-4">
        {comments.length === 0 && <li className="text-sm text-muted-foreground">No comments yet — be the first.</li>}
        {comments.map((c) => (
          <li key={c.id} className={`rounded-lg border p-4 ${c.approved ? "bg-card" : "bg-amber-50/40 border-amber-200/60 dark:bg-amber-950/10"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-primary">{c.author_name}</p>
                {c.author_member_id && <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.author_member_id}</p>}
              </div>
              <p className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</p>
            </div>
            <p className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap">{c.body}</p>
            {!c.approved && <p className="mt-2 text-[11px] flex items-center gap-1 text-amber-700 dark:text-amber-400"><Clock className="size-3" /> Pending admin approval</p>}
            {isAdmin && (
              <div className="mt-3 flex gap-2">
                {!c.approved && <Button size="sm" variant="outline" onClick={() => approve.mutate(c.id)} disabled={approve.isPending}><Shield className="size-3" /> Approve</Button>}
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(c.id)} disabled={remove.isPending} className="text-destructive hover:text-destructive"><Trash2 className="size-3" /> Delete</Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
