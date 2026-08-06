"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { HelpCircle, PlayCircle } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { quizFetch } from "@/features/quizzes/lib/api";
import type { QuizAttempt, QuizListItem } from "@/types/quizzes";

function StudentQuizzesView() {
  const [quizzes, setQuizzes] = React.useState<QuizListItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      const result = await quizFetch<QuizListItem[]>("/api/quizzes");
      setQuizzes(result.data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My assessments"
        description="Start quizzes, resume in-progress attempts, and review your history."
        breadcrumbs={[{ label: "Student" }, { label: "Quizzes" }]}
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={<HelpCircle className="h-6 w-6" />}
          title="No quizzes available"
          description="Published quizzes for your enrolled courses will appear here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <StudentQuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentQuizCard({ quiz }: { quiz: QuizListItem }) {
  const [attempts, setAttempts] = React.useState<QuizAttempt[]>([]);

  React.useEffect(() => {
    void (async () => {
      const detail = await quizFetch<{ attempts: QuizAttempt[] }>(`/api/quizzes/${quiz.id}`);
      setAttempts(detail.data?.attempts ?? []);
    })();
  }, [quiz.id]);

  const active = attempts.find((a) => a.status === "in_progress");
  const latest = attempts[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">{quiz.title}</CardTitle>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min · ` : ""}
          Pass {quiz.passingScore}% · Max {quiz.maxAttempts} attempts
          {quiz.courseTitle ? ` · ${quiz.courseTitle}` : ""}
        </p>
        {latest && latest.status !== "in_progress" ? (
          <Badge variant="secondary">
            Last: {latest.percent ?? "—"}% ·{" "}
            {latest.passed == null ? latest.gradeStatus : latest.passed ? "Pass" : "Fail"}
          </Badge>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={`/student/quizzes/${quiz.id}${active ? `/attempt/${active.id}` : ""}`}>
              <PlayCircle className="size-4" />
              {active ? "Resume" : "Start / Open"}
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/student/quizzes/${quiz.id}`}>History</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export { StudentQuizzesView };
