import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { ArticleComments } from "@/components/article-comments";

export const Route = createFileRoute("/articles/$slug")({
  head: () => ({ meta: [
    { title: "Article — Inter–Universities Nexus" },
    { name: "description", content: "Read this article from the Inter–Universities Nexus Platform." },
  ]}),
  component: ArticlePage,
});

function renderMarkdown(text: string): ReactNode[] {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let listBuf: string[] = [];
  const flushList = (key: number) => {
    if (listBuf.length) {
      blocks.push(<ul key={"l"+key} className="list-disc pl-6 my-3 space-y-1">{listBuf.map((li, i) => <li key={i}>{li}</li>)}</ul>);
      listBuf = [];
    }
  };
  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (line.startsWith("## ")) { flushList(i); blocks.push(<h2 key={i} className="heading-display text-3xl text-primary mt-8 mb-3">{line.slice(3)}</h2>); }
    else if (line.startsWith("### ")) { flushList(i); blocks.push(<h3 key={i} className="heading-display text-xl text-primary mt-6 mb-2">{line.slice(4)}</h3>); }
    else if (line.startsWith("- ")) { listBuf.push(line.slice(2)); }
    else if (line.trim() === "") { flushList(i); }
    else { flushList(i); blocks.push(<p key={i} className="leading-relaxed my-3">{line}</p>); }
  });
  flushList(9999);
  return blocks;
}

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("articles").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="py-12 flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Link to="/articles" className="inline-flex items-center gap-1 text-sm text-accent hover:underline mb-6"><ArrowLeft className="size-4" /> Back to articles</Link>
          {isLoading ? (
            <p className="text-muted-foreground">Loading article…</p>
          ) : error ? (
            <p className="text-destructive">Couldn't load this article. Please try again.</p>
          ) : !data ? (
            <div className="rounded-xl border bg-card p-8 text-center">
              <p className="heading-display text-2xl text-primary">Article not found</p>
              <p className="mt-2 text-muted-foreground text-sm">This article may have been unpublished or moved.</p>
              <Link to="/articles" className="inline-flex items-center gap-1 mt-4 text-accent underline"><ArrowLeft className="size-4" /> Browse all articles</Link>
            </div>
          ) : (
            <article>
              <p className="text-[10px] uppercase tracking-widest text-accent font-semibold">{data.category}</p>
              <h1 className="mt-2 heading-display text-4xl sm:text-5xl text-primary">{data.title}</h1>
              {data.published_at && <p className="mt-2 text-sm text-muted-foreground">{format(new Date(data.published_at), "PPP")}</p>}
              {data.excerpt && <p className="mt-6 text-lg leading-relaxed text-foreground/80 italic border-l-4 border-gold pl-4">{data.excerpt}</p>}
              <div className="mt-6 text-foreground">{renderMarkdown(data.body)}</div>
              <ArticleComments articleId={data.id} />
            </article>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
