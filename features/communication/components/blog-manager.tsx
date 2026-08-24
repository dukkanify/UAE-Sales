"use client";

import * as React from "react";
import { BookOpen, Save } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BLOG_STATUS_LABELS } from "@/constants/communication";
import { commFetch, commJson } from "@/features/communication/lib/api";
import type { BlogCategory, BlogPost, BlogPostStatus } from "@/types/communication";

function BlogManagerView({ manage = false }: { manage?: boolean }) {
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [categories, setCategories] = React.useState<BlogCategory[]>([]);
  const [title, setTitle] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [bodyHtml, setBodyHtml] = React.useState("");
  const [tags, setTags] = React.useState("atpl");
  const [status, setStatus] = React.useState<BlogPostStatus>("draft");
  const [seoTitle, setSeoTitle] = React.useState("");
  const [seoDescription, setSeoDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const url = manage
      ? "/api/communication/blog"
      : "/api/communication/blog?public=1";
    const result = await commFetch<{ posts: BlogPost[]; categories: BlogCategory[] }>(url);
    setPosts(result.data?.posts ?? []);
    setCategories(result.data?.categories ?? []);
  }, [manage]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    const result = await commJson<BlogPost>("/api/communication/blog", "POST", {
      title,
      excerpt,
      bodyHtml: bodyHtml.includes("<") ? bodyHtml : `<p>${bodyHtml}</p>`,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      categoryId: categories[0]?.id ?? null,
    });
    if (!result.success) {
      setError(result.error);
      return;
    }
    setTitle("");
    setExcerpt("");
    setBodyHtml("");
    void load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={manage ? "Blog studio" : "ATPL PASS Blog"}
        description={
          manage
            ? "Draft, schedule, and publish articles with SEO metadata."
            : "Aviation insights, study tips, and platform updates."
        }
        breadcrumbs={[{ label: "Communication" }, { label: "Blog" }]}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {manage ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compose article</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input
              placeholder="Excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
            <Textarea
              placeholder="Rich text / HTML body"
              className="min-h-[140px]"
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as BlogPostStatus)}
              >
                {Object.entries(BLOG_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <Input
                placeholder="SEO title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
              <Input
                placeholder="SEO description"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
              />
            </div>
            <Button onClick={() => void save()}>
              <Save className="size-4" />
              Save article
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="font-display text-xl">{p.title}</CardTitle>
                <Badge variant="secondary">{BLOG_STATUS_LABELS[p.status]}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {p.authorName} · {p.tags.join(", ")}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{p.excerpt}</p>
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: p.bodyHtml }}
              />
              <Button asChild size="sm" variant="outline">
                <a href={`/blog/${p.slug}`}>
                  <BookOpen className="size-4" />
                  Open
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export { BlogManagerView };
