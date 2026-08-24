"use client";

import * as React from "react";
import { History } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { learningFetch } from "@/features/learning/lib/api";
import type { LearningHistoryEvent } from "@/types/learning";

function LearningHistoryView() {
  const [items, setItems] = React.useState<LearningHistoryEvent[]>([]);

  React.useEffect(() => {
    void (async () => {
      const result = await learningFetch<LearningHistoryEvent[]>(
        "/api/learning/history?limit=100",
      );
      setItems(result.data ?? []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning history"
        description="Courses started, lessons completed, downloads, and study activity."
        breadcrumbs={[{ label: "Student" }, { label: "History" }]}
      />
      {items.length === 0 ? (
        <EmptyState
          icon={<History className="h-6 w-6" />}
          title="No activity yet"
          description="Your learning trail will appear as you study."
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-start justify-between gap-3 py-4">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.description ? (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant="secondary">{item.type.replace(/_/g, " ")}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export { LearningHistoryView };
