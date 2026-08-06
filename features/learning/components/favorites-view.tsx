"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { Star } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { learningFetch, learningJson } from "@/features/learning/lib/api";
import type { Favorite } from "@/types/learning";

function FavoritesView() {
  const [items, setItems] = React.useState<Favorite[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    setLoading(true);
    const result = await learningFetch<Favorite[]>("/api/learning/favorites");
    setItems(result.data ?? []);
    setLoading(false);
  }

  React.useEffect(() => {
    void load();
  }, []);

  async function remove(id: string) {
    await learningJson(`/api/learning/favorites/${id}`, "DELETE");
    void load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Favorites"
        description="Courses, lessons, and resources you marked as favorites."
        breadcrumbs={[{ label: "Student" }, { label: "Favorites" }]}
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Star className="h-6 w-6" />}
          title="No favorites yet"
          description="Star a course from My Courses to pin it here."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <div>
                  <CardTitle className="text-base">{item.label}</CardTitle>
                  <p className="mt-1 text-xs uppercase text-muted-foreground">{item.targetType}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => void remove(item.id)}>
                  Remove
                </Button>
              </CardHeader>
              <CardContent>
                {item.targetType === "course" || item.courseId ? (
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={
                        item.targetType === "lesson" && item.courseId
                          ? `/student/courses/${item.courseId}/lessons/${item.targetId}`
                          : `/student/courses/${item.courseId ?? item.targetId}`
                      }
                    >
                      Open
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export { FavoritesView };
