"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  StickyNote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { learningFetch, learningJson } from "@/features/learning/lib/api";
import type { Lesson, LessonResource } from "@/types/courses";
import type {
  CourseLearningState,
  LessonProgressRecord,
  StudentNote,
} from "@/types/learning";

type PlayerPayload = {
  course: {
    id: string;
    title: string;
    modules: Array<{
      id: string;
      title: string;
      order: number;
      lessons: Array<{
        id: string;
        title: string;
        order: number;
        estimatedStudyMinutes: number;
        durationMinutes: number;
        completed: boolean;
      }>;
    }>;
  };
  module: { id: string; title: string };
  lesson: Lesson & { resources: LessonResource[] };
  progress: LessonProgressRecord | null;
  learning: CourseLearningState;
  notes: StudentNote[];
  bookmarks: Array<{ id: string; label: string }>;
  adjacent: {
    prev: { id: string; title: string; moduleId: string } | null;
    next: { id: string; title: string; moduleId: string } | null;
  };
};

interface CoursePlayerViewProps {
  courseId: string;
  lessonId: string;
}

function CoursePlayerView({ courseId, lessonId }: CoursePlayerViewProps) {
  const router = useRouter();
  const [data, setData] = React.useState<PlayerPayload | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [noteTitle, setNoteTitle] = React.useState("");
  const [noteBody, setNoteBody] = React.useState("");
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const result = await learningFetch<PlayerPayload>(
      `/api/learning/courses/${courseId}/lessons/${lessonId}`,
    );
    if (!result.success || !result.data) {
      setError(result.error ?? "Unable to load lesson");
      setData(null);
    } else {
      setData(result.data);
      setError(null);
    }
    setLoading(false);
  }, [courseId, lessonId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Auto-save progress every 20s
  React.useEffect(() => {
    if (!data) return;
    const id = window.setInterval(() => {
      const pos = videoRef.current?.currentTime ?? data.progress?.resumePosition ?? 0;
      void learningJson("/api/learning/progress", "POST", {
        courseId,
        lessonId,
        deltaSeconds: 20,
        resumePosition: Math.round(pos),
      });
    }, 20_000);
    return () => window.clearInterval(id);
  }, [data, courseId, lessonId]);

  async function completeLesson() {
    await learningJson("/api/learning/progress", "POST", {
      courseId,
      lessonId,
      complete: true,
    });
    void load();
    if (data?.adjacent.next) {
      router.push(`/student/courses/${courseId}/lessons/${data.adjacent.next.id}`);
    }
  }

  async function saveNote() {
    if (!noteTitle.trim()) return;
    await learningJson("/api/learning/notes", "POST", {
      courseId,
      lessonId,
      title: noteTitle,
      body: noteBody,
    });
    setNoteTitle("");
    setNoteBody("");
    void load();
  }

  async function bookmarkLesson() {
    await learningJson("/api/learning/bookmarks", "POST", {
      targetType: "lesson",
      targetId: lessonId,
      courseId,
      lessonId,
      label: data?.lesson.title ?? "Lesson",
    });
    void load();
  }

  async function downloadResource(res: LessonResource) {
    await learningJson("/api/learning/resources", "POST", {
      courseId,
      lessonId,
      resourceId: res.id,
      title: res.title,
    });
    window.open(res.url, "_blank", "noopener,noreferrer");
  }

  async function cacheOffline() {
    await learningJson("/api/learning/offline", "POST", {
      courseId,
      lessonId,
      contentVersion: data?.lesson.updatedAt,
    });
  }

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[280px_1fr_300px]">
        <Skeleton className="hidden h-[70vh] rounded-2xl lg:block" />
        <Skeleton className="h-[70vh] rounded-2xl" />
        <Skeleton className="hidden h-[70vh] rounded-2xl xl:block" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="p-6 text-sm text-destructive">{error ?? "Lesson unavailable"}</p>;
  }

  const pct = Math.round(data.learning.progressPercent);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {data.course.title}
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {data.lesson.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ~{data.lesson.estimatedStudyMinutes || data.lesson.durationMinutes || 15} min ·{" "}
            {data.module.title}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setSidebarOpen((v) => !v)}>
            Outline
          </Button>
          <Button variant="outline" size="sm" onClick={() => void bookmarkLesson()}>
            <Bookmark className="size-4" />
            Bookmark
          </Button>
          <Button variant="outline" size="sm" onClick={() => void cacheOffline()}>
            Offline ready
          </Button>
          <Button
            size="sm"
            variant={data.progress?.completed ? "success" : "default"}
            onClick={() => void completeLesson()}
            disabled={Boolean(data.progress?.completed)}
          >
            <CheckCircle2 className="size-4" />
            {data.progress?.completed ? "Completed" : "Mark complete"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,300px)]">
        <aside
          className={cn(
            "rounded-2xl border border-border bg-card p-3",
            sidebarOpen ? "block" : "hidden lg:block",
          )}
        >
          <div className="mb-3">
            <p className="text-xs text-muted-foreground">Course progress</p>
            <Progress value={pct} className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {data.learning.completedLessons}/{data.learning.totalLessons} · {pct}%
            </p>
          </div>
          <nav className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
            {data.course.modules.map((mod) => (
              <div key={mod.id}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {mod.title}
                </p>
                <ul className="space-y-1">
                  {mod.lessons.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/student/courses/${courseId}/lessons/${l.id}`}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                          l.id === lessonId && "bg-primary/10 font-medium text-primary",
                        )}
                      >
                        <span className="truncate">{l.title}</span>
                        {l.completed ? (
                          <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 space-y-4">
          {data.lesson.videoUrl ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-black">
              <video
                ref={videoRef}
                className="aspect-video w-full"
                controls
                preload="metadata"
                poster={undefined}
                src={data.lesson.videoUrl}
                onLoadedMetadata={(e) => {
                  const start = data.progress?.resumePosition ?? 0;
                  if (start > 5) e.currentTarget.currentTime = start;
                }}
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
              No video for this lesson — study the content below.
            </div>
          )}

          {data.lesson.contentHtml ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lesson content</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: data.lesson.contentHtml }}
                />
              </CardContent>
            </Card>
          ) : null}

          {data.lesson.resources?.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.lesson.resources.map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{res.title}</p>
                      <p className="text-xs uppercase text-muted-foreground">{res.type}</p>
                    </div>
                    <div className="flex gap-1">
                      {res.downloadable ? (
                        <Button
                          size="icon-sm"
                          variant="outline"
                          onClick={() => void downloadResource(res)}
                          aria-label={`Download ${res.title}`}
                        >
                          <Download className="size-4" />
                        </Button>
                      ) : (
                        <Button size="icon-sm" variant="outline" asChild>
                          <a href={res.url} target="_blank" rel="noreferrer">
                            <ExternalLink className="size-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <div className="flex flex-wrap justify-between gap-2">
            {data.adjacent.prev ? (
              <Button variant="outline" asChild>
                <Link href={`/student/courses/${courseId}/lessons/${data.adjacent.prev.id}`}>
                  <ChevronLeft className="size-4" />
                  Previous
                </Link>
              </Button>
            ) : (
              <span />
            )}
            {data.adjacent.next ? (
              <Button asChild>
                <Link href={`/student/courses/${courseId}/lessons/${data.adjacent.next.id}`}>
                  Next lesson
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <StickyNote className="size-4" />
                Private notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Note title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              <Textarea
                placeholder="Write privately…"
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                rows={4}
              />
              <Button size="sm" onClick={() => void saveNote()}>
                Save note
              </Button>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {data.notes.map((n) => (
                  <div key={n.id} className="rounded-lg border border-border/60 p-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="line-clamp-3 text-xs text-muted-foreground">{n.body}</p>
                  </div>
                ))}
                {!data.notes.length ? (
                  <p className="text-xs text-muted-foreground">No notes yet.</p>
                ) : null}
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student/notes">
                  <FileText className="size-4" />
                  All notes
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export { CoursePlayerView };
