"use client";

import * as React from "react";
import { Download, FolderOpen, Search } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { learningFetch, learningJson } from "@/features/learning/lib/api";
import type { ResourceLibraryItem } from "@/types/learning";

function ResourceLibraryView() {
  const [items, setItems] = React.useState<ResourceLibraryItem[]>([]);
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState("all");

  const load = React.useCallback(async () => {
    const params = new URLSearchParams({ type });
    if (q) params.set("q", q);
    const result = await learningFetch<ResourceLibraryItem[]>(
      `/api/learning/resources?${params}`,
    );
    setItems(result.data ?? []);
  }, [q, type]);

  React.useEffect(() => {
    const t = window.setTimeout(() => void load(), 200);
    return () => window.clearTimeout(t);
  }, [load]);

  async function download(item: ResourceLibraryItem) {
    await learningJson("/api/learning/resources", "POST", {
      courseId: item.courseId,
      lessonId: item.lessonId,
      resourceId: item.id,
      title: item.title,
    });
    window.open(item.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource library"
        description="PDFs, documents, slides, images, and links from enrolled courses."
        breadcrumbs={[{ label: "Student" }, { label: "Resources" }]}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search resources…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Filter by type"
        >
          <option value="all">All types</option>
          <option value="pdf">PDF</option>
          <option value="doc">Word</option>
          <option value="ppt">PowerPoint</option>
          <option value="image">Images</option>
          <option value="link">External links</option>
          <option value="video">Video</option>
        </select>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-6 w-6" />}
          title="No resources"
          description="Lesson resources from your courses will collect here."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={`${item.courseId}-${item.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{item.title}</CardTitle>
                  <Badge variant="secondary">{item.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.courseTitle} · {item.lessonTitle}
                </p>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void download(item)}
                  disabled={!item.downloadable && item.type !== "link"}
                >
                  <Download className="size-4" />
                  {item.downloadable ? "Download" : "Open"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export { ResourceLibraryView };
