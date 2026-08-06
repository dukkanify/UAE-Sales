"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quizFetch } from "@/features/quizzes/lib/api";
import type { Quiz, QuizAnswer, QuizAttempt } from "@/types/quizzes";

function StudentQuizResultsView() {
  const params = useParams<{ id: string; attemptId: string }>();
  const [data, setData] = React.useState<{
    attempt: QuizAttempt;
    quiz: Quiz;
    answers: QuizAnswer[];
    questions: Array<{ id: string; stem: string; explanation?: string; correctAnswer?: unknown }>;
    review: { comments: string } | null;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    void (async () => {
      const result = await quizFetch<NonNullable<typeof data>>(
        `/api/quizzes/attempts/${params.attemptId}`,
      );
      if (!result.success || !result.data) {
        setError(result.error ?? "Unable to load results");
        return;
      }
      setData(result.data);
    })();
  }, [params.attemptId]);

  if (error) return <p className="p-6 text-sm text-destructive">{error}</p>;
  if (!data) return <p className="p-6 text-sm text-muted-foreground">Loading results…</p>;

  const { attempt, quiz, answers, questions, review } = data;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{quiz.title}</p>
        <h1 className="font-display text-3xl font-semibold">Attempt results</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Score</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {attempt.score ?? "—"} / {attempt.maxScore}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Percent</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{attempt.percent ?? "—"}%</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">
              {attempt.passed == null
                ? attempt.gradeStatus.replace(/_/g, " ")
                : attempt.passed
                  ? "Pass"
                  : "Fail"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">
        Time spent: {Math.round(attempt.timeSpentSeconds / 60)} min · Attempt #
        {attempt.attemptNumber}
      </p>

      {review?.comments ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instructor feedback</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{review.comments}</CardContent>
        </Card>
      ) : null}

      {quiz.reviewAnswers && quiz.showResultsImmediately ? (
        <div className="space-y-3">
          <h2 className="font-display text-xl">Answer review</h2>
          {questions.map((q) => {
            const ans = answers.find((a) => a.questionId === q.id);
            return (
              <Card key={q.id}>
                <CardHeader>
                  <CardTitle className="text-sm leading-snug">{q.stem}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>
                    Your answer:{" "}
                    <span className="font-medium">{JSON.stringify(ans?.response)}</span>
                  </p>
                  {q.correctAnswer != null ? (
                    <p className="text-muted-foreground">
                      Correct: {JSON.stringify(q.correctAnswer)}
                    </p>
                  ) : null}
                  {q.explanation ? <p className="text-muted-foreground">{q.explanation}</p> : null}
                  {ans?.feedback ? <p>Feedback: {ans.feedback}</p> : null}
                  <Badge variant="outline">
                    {ans?.finalScore ?? ans?.autoScore ?? "—"} pts
                    {ans?.needsManualGrading ? " · pending review" : ""}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Detailed answer review is disabled for this quiz or pending instructor grading.
        </p>
      )}

      <Button asChild variant="outline">
        <Link href="/student/quizzes">Back to quizzes</Link>
      </Button>
    </div>
  );
}

export { StudentQuizResultsView };
