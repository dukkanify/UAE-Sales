"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { learningFetch } from "@/features/learning/lib/api";
import type { CourseListItem } from "@/types/courses";
import type { ResourceLibraryItem } from "@/types/learning";

type SearchResult = {
  courses: CourseListItem[];
  lessons: Array<{ id: string; title: string; courseId: string; courseTitle: string }>;
  resources: ResourceLibraryItem[];
};

function LearningSearchView() {
  const [q, setQ] = React.useState("");
  const [data, setData] = React.useState<SearchResult | null>(null);

  React.useEffect(() => {
    if (!q.trim()) {
      setData(null);
      return;
    }
    const t = window.setTimeout(() => {
      void (async () => {
        const result = await learningFetch<SearchResult>(
          `/api/learning/search?q=${encodeURIComponent(q)}`,
        );
        setData(result.data);
      })();
    }, 250);
    return () => window.clearTimeout(t);
  }, [q]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning search"
        description="Search courses, lessons, modules, and resources across your enrollments."
        breadcrumbs={[{ label: "Student" }, { label: "Search" }]}
      />
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by keyword, course, lesson, instructor…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
      </div>

      {data ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Courses ({data.courses.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.courses.map((c) => (
                <Link
                  key={c.id}
                  href={`/student/courses/${c.id}`}
                  className="block rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
                >
                  {c.title}
                </Link>
              ))}
              {!data.courses.length ? (
                <p className="text-xs text-muted-foreground">No matches</p>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lessons ({data.lessons.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.lessons.map((l) => (
                <Link
                  key={l.id}
                  href={`/student/courses/${l.courseId}/lessons/${l.id}`}
                  className="block rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <span className="font-medium">{l.title}</span>
                  <span className="block text-xs text-muted-foreground">{l.courseTitle}</span>
                </Link>
              ))}
              {!data.lessons.length ? (
                <p className="text-xs text-muted-foreground">No matches</p>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Resources ({data.resources.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.resources.map((r) => (
                <a
                  key={`${r.courseId}-${r.id}`}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
                >
                  {r.title}
                </a>
              ))}
              {!data.resources.length ? (
                <p className="text-xs text-muted-foreground">No matches</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Start typing to search your learning library.</p>
      )}
    </div>
  );
}

export { LearningSearchView };
