"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { routes } from "@/constants/routes";
import { commFetch, commJson } from "@/features/communication/lib/api";
import type { BlogPost, CommentRecord } from "@/types/communication";

export default function BlogArticlePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [post, setPost] = React.useState<BlogPost | null>(null);
  const [related, setRelated] = React.useState<BlogPost[]>([]);
  const [comments, setComments] = React.useState<CommentRecord[]>([]);
  const [body, setBody] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const list = await commFetch<{ posts: BlogPost[] }>("/api/communication/blog?public=1");
      if (cancelled) return;
      const found = (list.data?.posts ?? []).find((p) => p.slug === params.slug);
      if (!found) {
        router.replace("/blog");
        return;
      }
      const detail = await commFetch<{
        post: BlogPost;
        related: BlogPost[];
        comments: CommentRecord[];
      }>(`/api/communication/blog?id=${found.id}`);
      if (cancelled) return;
      setPost(detail.data?.post ?? found);
      setRelated(detail.data?.related ?? []);
      setComments(detail.data?.comments ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [params.slug, router]);

  if (loading || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-muted-foreground">Loading article…</div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Badge key={t} variant="secondary">
              {t}
            </Badge>
          ))}
        </div>
        <h1 className="font-display text-4xl tracking-tight">{post.title}</h1>
        <p className="text-muted-foreground">{post.excerpt}</p>
        <p className="text-xs text-muted-foreground">
          {post.authorName} ·{" "}
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
        </p>
      </header>
      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
      />

      <section className="space-y-3 border-t border-border pt-8">
        <h2 className="font-display text-2xl">Comments</h2>
        {comments.map((c) => (
          <div key={c.id} className="rounded-md border border-border px-3 py-2 text-sm">
            <p className="text-xs text-muted-foreground">{c.authorName}</p>
            <p>{c.body}</p>
          </div>
        ))}
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment"
        />
        <Button
          onClick={() =>
            void commJson("/api/communication/blog", "POST", {
              action: "comment",
              postId: post.id,
              body,
            }).then(async () => {
              setBody("");
              const detail = await commFetch<{ comments: CommentRecord[] }>(
                `/api/communication/blog?id=${post.id}`,
              );
              setComments(detail.data?.comments ?? []);
            })
          }
        >
          Comment
        </Button>
      </section>

      {related.length ? (
        <section className="space-y-3 border-t border-border pt-8">
          <h2 className="font-display text-2xl">Related articles</h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.id}>
                <a
                  className="text-primary underline-offset-4 hover:underline"
                  href={`/blog/${r.slug}`}
                >
                  {r.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-sm text-muted-foreground">
        <a className="underline-offset-4 hover:underline" href={routes.home}>
          Back to platform
        </a>
      </p>
    </article>
  );
}
