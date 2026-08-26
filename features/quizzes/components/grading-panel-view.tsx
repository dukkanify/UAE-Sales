"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { quizFetch, quizJson } from "@/features/quizzes/lib/api";
import type { BankQuestion, Quiz, QuizAnswer, QuizAttempt, QuizListItem } from "@/types/quizzes";

interface GradingPanelViewProps {
  basePath?: string;
}

function GradingPanelView({ basePath = "/instructor/quizzes" }: GradingPanelViewProps) {
  const [quizzes, setQuizzes] = React.useState<QuizListItem[]>([]);
  const [quizId, setQuizId] = React.useState("");
  const [attempts, setAttempts] = React.useState<QuizAttempt[]>([]);
  const [selected, setSelected] = React.useState<{
    attempt: QuizAttempt;
    quiz: Quiz;
    answers: Array<QuizAnswer & { question: BankQuestion | null }>;
  } | null>(null);
  const [comments, setComments] = React.useState("");
  const [adjustment, setAdjustment] = React.useState("0");

  React.useEffect(() => {
    void (async () => {
      const result = await quizFetch<{ data: QuizListItem[] }>("/api/quizzes?pageSize=50");
      const rows = result.data?.data ?? [];
      setQuizzes(rows);
      if (rows[0]) setQuizId(rows[0].id);
    })();
  }, []);

  React.useEffect(() => {
    if (!quizId) return;
    void (async () => {
      const result = await quizFetch<QuizAttempt[]>(
        `/api/quizzes/grading?quizId=${quizId}&pending=1`,
      );
      const all = await quizFetch<QuizAttempt[]>(`/api/quizzes/grading?quizId=${quizId}`);
      setAttempts((result.data?.length ? result.data : all.data) ?? []);
    })();
  }, [quizId]);

  async function openAttempt(attemptId: string) {
    const result = await quizFetch<NonNullable<typeof selected>>(
      `/api/quizzes/grading?attemptId=${attemptId}`,
    );
    if (result.success && result.data) setSelected(result.data);
  }

  async function gradeAnswer(questionId: string, score: number, feedback: string) {
    if (!selected) return;
    await quizJson("/api/quizzes/grading", "POST", {
      action: "grade_answer",
      attemptId: selected.attempt.id,
      questionId,
      score,
      feedback,
    });
    await openAttempt(selected.attempt.id);
  }

  async function finalize() {
    if (!selected) return;
    await quizJson("/api/quizzes/grading", "POST", {
      action: "finalize",
      attemptId: selected.attempt.id,
      comments,
      scoreAdjustment: Number(adjustment) || 0,
      approved: true,
    });
    setSelected(null);
    setComments("");
    setAdjustment("0");
    const all = await quizFetch<QuizAttempt[]>(`/api/quizzes/grading?quizId=${quizId}`);
    setAttempts(all.data ?? []);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instructor grading"
        description="Manual review for essays and short answers, feedback, score adjustment, and final approval."
        breadcrumbs={[{ label: "Quizzes", href: basePath }, { label: "Grading" }]}
      />

      <div className="flex flex-wrap gap-3">
        <select
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
        >
          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>
              {q.title}
            </option>
          ))}
        </select>
        <Button asChild variant="outline" size="sm">
          <Link href={basePath}>Back</Link>
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attempts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {attempts.map((a) => (
              <button
                key={a.id}
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-border/70 px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => void openAttempt(a.id)}
              >
                <span>
                  #{a.attemptNumber} · {a.gradeStatus}
                </span>
                <Badge variant="secondary">{a.percent ?? "—"}%</Badge>
              </button>
            ))}
            {!attempts.length ? (
              <p className="text-xs text-muted-foreground">No attempts for this quiz.</p>
            ) : null}
          </CardContent>
        </Card>

        {selected ? (
          <div className="space-y-4">
            {selected.answers
              .filter(
                (a) =>
                  a.needsManualGrading ||
                  a.question?.type === "essay" ||
                  a.question?.type === "short_answer",
              )
              .map((a) => (
                <ManualAnswerCard
                  key={a.id}
                  answer={a}
                  onGrade={(score, feedback) => void gradeAnswer(a.questionId, score, feedback)}
                />
              ))}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Finalize review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Overall comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
                <Input
                  type="number"
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                  aria-label="Score adjustment"
                />
                <Button onClick={() => void finalize()}>Approve final grade</Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select an attempt to grade.</p>
        )}
      </div>
    </div>
  );
}

function ManualAnswerCard({
  answer,
  onGrade,
}: {
  answer: QuizAnswer & { question: BankQuestion | null };
  onGrade: (score: number, feedback: string) => void;
}) {
  const [score, setScore] = React.useState(
    String(answer.manualScore ?? answer.question?.points ?? 0),
  );
  const [feedback, setFeedback] = React.useState(answer.feedback ?? "");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm leading-snug">
          {answer.question?.stem ?? answer.questionId}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="rounded-xl bg-muted/40 p-3 text-sm whitespace-pre-wrap">
          {String(answer.response ?? "")}
        </p>
        <Input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          aria-label="Score"
        />
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Feedback"
        />
        <Button size="sm" onClick={() => onGrade(Number(score) || 0, feedback)}>
          Save grade
        </Button>
      </CardContent>
    </Card>
  );
}

export { GradingPanelView };
