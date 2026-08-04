"use client";

import * as React from "react";
import { Megaphone } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ANNOUNCEMENT_TARGET_LABELS } from "@/constants/communication";
import { commFetch, commJson } from "@/features/communication/lib/api";
import type { Announcement, AnnouncementTarget } from "@/types/communication";

function AnnouncementCenter({ canPublish = false }: { canPublish?: boolean }) {
  const [rows, setRows] = React.useState<Announcement[]>([]);
  const [title, setTitle] = React.useState("");
  const [bodyHtml, setBodyHtml] = React.useState("");
  const [target, setTarget] = React.useState<AnnouncementTarget>("platform");
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const result = await commFetch<Announcement[]>("/api/communication/announcements");
    setRows(result.data ?? []);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function publish() {
    const result = await commJson<Announcement>("/api/communication/announcements", "POST", {
      title,
      bodyHtml: bodyHtml.includes("<") ? bodyHtml : `<p>${bodyHtml}</p>`,
      target,
    });
    if (!result.success) {
      setError(result.error);
      return;
    }
    setTitle("");
    setBodyHtml("");
    void load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcement center"
        description="Targeted platform, course, group, and learner announcements."
        breadcrumbs={[{ label: "Communication" }, { label: "Announcements" }]}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {canPublish ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="size-4" />
              Publish announcement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <Textarea
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              placeholder="Rich content"
            />
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={target}
              onChange={(e) => setTarget(e.target.value as AnnouncementTarget)}
            >
              {Object.entries(ANNOUNCEMENT_TARGET_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <Button onClick={() => void publish()}>Publish</Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        {rows.map((a) => (
          <Card key={a.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="font-display text-xl">{a.title}</CardTitle>
                <Badge variant="secondary">{ANNOUNCEMENT_TARGET_LABELS[a.target]}</Badge>
                <Badge>{a.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {a.authorName} · {a.publishedAt ? new Date(a.publishedAt).toLocaleString() : "Scheduled"}
              </p>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: a.bodyHtml }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export { AnnouncementCenter };
