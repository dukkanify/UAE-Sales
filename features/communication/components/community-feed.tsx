"use client";

import * as React from "react";
import { Megaphone, Pin, Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { COMMUNITY_KIND_LABELS } from "@/constants/communication";
import { cn } from "@/lib/utils";
import { commFetch, commJson } from "@/features/communication/lib/api";
import type { Community, CommunityPost } from "@/types/communication";

function CommunityFeedView({ canModerate = false }: { canModerate?: boolean }) {
  const [communities, setCommunities] = React.useState<Community[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [posts, setPosts] = React.useState<CommunityPost[]>([]);
  const [q, setQ] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const loadCommunities = React.useCallback(async () => {
    const result = await commFetch<Community[]>("/api/communication/communities");
    setCommunities(result.data ?? []);
    if (!activeId && result.data?.[0]) setActiveId(result.data[0].id);
  }, [activeId]);

  const loadFeed = React.useCallback(async (id: string, query?: string) => {
    const qs = query ? `?q=${encodeURIComponent(query)}` : "";
    const result = await commFetch<{ community: Community; posts: CommunityPost[] }>(
      `/api/communication/communities/${id}${qs}`,
    );
    if (result.success && result.data) setPosts(result.data.posts);
    else setError(result.error);
  }, []);

  React.useEffect(() => {
    void loadCommunities();
  }, [loadCommunities]);

  React.useEffect(() => {
    if (activeId) void loadFeed(activeId, q || undefined);
  }, [activeId, loadFeed, q]);

  async function createPost(asAnnouncement = false) {
    if (!activeId || !title.trim() || !body.trim()) return;
    const result = await commJson<CommunityPost>(
      `/api/communication/communities/${activeId}`,
      "POST",
      {
        action: "post",
        title,
        body,
        isAnnouncement: asAnnouncement,
        pinned: asAnnouncement,
      },
    );
    if (!result.success) {
      setError(result.error);
      return;
    }
    setTitle("");
    setBody("");
    void loadFeed(activeId);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communities"
        description="Course, subject, batch, and instructor learning communities."
        breadcrumbs={[{ label: "Communication" }, { label: "Communities" }]}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2">
          {communities.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              className={cn(
                "w-full rounded-lg border border-border px-3 py-3 text-left hover:bg-muted/50",
                activeId === c.id && "border-primary bg-muted",
              )}
            >
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                {COMMUNITY_KIND_LABELS[c.kind]} · {c.memberIds.length} members
              </p>
            </button>
          ))}
        </aside>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search posts…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="size-4" />
                New post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea
                placeholder="Share an update with the community…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void createPost(false)}>Publish</Button>
                {canModerate ? (
                  <Button variant="outline" onClick={() => void createPost(true)}>
                    <Megaphone className="size-4" />
                    Announce
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {posts.map((p) => (
              <Card key={p.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {p.pinned ? (
                      <Badge variant="secondary">
                        <Pin className="mr-1 size-3" />
                        Pinned
                      </Badge>
                    ) : null}
                    {p.isAnnouncement ? <Badge>Announcement</Badge> : null}
                    {p.moderated ? <Badge variant="destructive">Flagged</Badge> : null}
                    <CardTitle className="font-display text-xl">{p.title}</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p.authorName} · {new Date(p.createdAt).toLocaleString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{p.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { CommunityFeedView };
