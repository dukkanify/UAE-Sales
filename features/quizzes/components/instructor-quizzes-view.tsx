"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { Archive, BarChart3, Copy, HelpCircle, Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { QUIZ_STATUS_LABELS } from "@/constants/quizzes";
import { quizFetch, quizJson } from "@/features/quizzes/lib/api";
import type { QuizListItem } from "@/types/quizzes";

interface InstructorQuizzesViewProps {
  roleLabel?: string;
  basePath?: string;
}

function InstructorQuizzesView({
  roleLabel = "Instructor",
  basePath = "/instructor/quizzes",
}: InstructorQuizzesViewProps) {
  const [rows, setRows] = React.useState<QuizListItem[]>([]);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [overview, setOverview] = React.useState<{
    totalQuizzes: number;
    publishedQuizzes: number;
    totalQuestions: number;
    needsReview: number;
  } | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "50" });
    if (q) params.set("q", q);
    const [list, stats] = await Promise.all([
      quizFetch<{ data: QuizListItem[] }>(`/api/quizzes?${params}`),
      quizFetch<{
        totalQuizzes: number;
        publishedQuizzes: number;
        totalQuestions: number;
        needsReview: number;
      }>("/api/quizzes/analytics"),
    ]);
    if (!list.success) {
      setError(list.error ?? "Unable to load quizzes");
      setRows([]);
    } else {
      const payload = list.data as unknown as { data?: QuizListItem[] } | QuizListItem[] | null;
      setRows(Array.isArray(payload) ? payload : (payload?.data ?? []));
      setError(null);
    }
    if (stats.success && stats.data) setOverview(stats.data);
    setLoading(false);
  }, [q]);

  React.useEffect(() => {
    const t = window.setTimeout(() => void load(), 200);
    return () => window.clearTimeout(t);
  }, [load]);

  async function createQuiz() {
    const result = await quizJson<QuizListItem>("/api/quizzes", "POST", {
      title: "New assessment",
      description: "Draft quiz",
      timeLimitMinutes: 30,
      maxAttempts: 2,
    });
    if (result.success && result.data) {
      window.location.href = `${basePath}/${result.data.id}`;
    }
  }

  async function runAction(id: string, action: string) {
    await quizJson(`/api/quizzes/${id}/actions`, "POST", { action });
    void load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        description="Build quizzes, manage the question bank, grade attempts, and review analytics."
        breadcrumbs={[{ label: roleLabel }, { label: "Quizzes" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`${basePath}/bank`}>Question bank</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`${basePath}/grading`}>
                Grading
                {overview?.needsReview ? ` (${overview.needsReview})` : ""}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`${basePath}/analytics`}>
                <BarChart3 className="size-4" />
                Analytics
              </Link>
            </Button>
            <Button size="sm" onClick={() => void createQuiz()}>
              <Plus className="size-4" />
              Create quiz
            </Button>
          </div>
        }
      />

      {overview ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Quizzes</CardDescription>
              <CardTitle className="text-2xl">{overview.totalQuizzes}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Published</CardDescription>
              <CardTitle className="text-2xl">{overview.publishedQuizzes}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Question bank</CardDescription>
              <CardTitle className="text-2xl">{overview.totalQuestions}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Needs review</CardDescription>
              <CardTitle className="text-2xl">{overview.needsReview}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      ) : null}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search quizzes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<HelpCircle className="h-6 w-6" />}
          title="No quizzes yet"
          description="Create your first assessment or import questions into the bank."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="font-display text-lg">{quiz.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {quiz.description || "No description"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{QUIZ_STATUS_LABELS[quiz.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {quiz.questionLinks} questions · {quiz.attemptsCount} attempts · pass{" "}
                  {quiz.passingScore}%{quiz.courseTitle ? ` · ${quiz.courseTitle}` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`${basePath}/${quiz.id}`}>Edit</Link>
                  </Button>
                  {quiz.status !== "published" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void runAction(quiz.id, "publish")}
                    >
                      Publish
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void runAction(quiz.id, "unpublish")}
                    >
                      Unpublish
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void runAction(quiz.id, "duplicate")}
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void runAction(quiz.id, "archive")}
                  >
                    <Archive className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export { InstructorQuizzesView };
