"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { QUESTION_TYPE_LABELS } from "@/constants/quizzes";
import { quizFetch, quizJson } from "@/features/quizzes/lib/api";
import type { Quiz, QuizAttempt } from "@/types/quizzes";

type StudentQuestion = {
  id: string;
  stem: string;
  type: string;
  points: number;
  options: Array<{ id: string; label: string }>;
};

function StudentQuizTakeView() {
  const params = useParams<{ id: string; attemptId?: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = React.useState<Quiz | null>(null);
  const [attempt, setAttempt] = React.useState<QuizAttempt | null>(null);
  const [questions, setQuestions] = React.useState<StudentQuestion[]>([]);
  const [responses, setResponses] = React.useState<Record<string, unknown>>({});
  const [index, setIndex] = React.useState(0);
  const [remaining, setRemaining] = React.useState<number | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const startedRef = React.useRef(false);

  const boot = React.useCallback(async () => {
    if (params.attemptId) {
      const result = await quizFetch<{
        attempt: QuizAttempt;
        quiz: Quiz;
        questions: StudentQuestion[];
        answers: Array<{ questionId: string; response: unknown }>;
      }>(`/api/quizzes/attempts/${params.attemptId}`);
      if (!result.success || !result.data) {
        setMessage(result.error ?? "Unable to load attempt");
        return;
      }
      setAttempt(result.data.attempt);
      setQuiz(result.data.quiz);
      setQuestions(result.data.questions as StudentQuestion[]);
      const map: Record<string, unknown> = {};
      for (const a of result.data.answers) map[a.questionId] = a.response;
      setResponses(map);
      return;
    }

    const detail = await quizFetch<{ quiz: Quiz; attempts: QuizAttempt[] }>(
      `/api/quizzes/${params.id}`,
    );
    if (!detail.success || !detail.data) {
      setMessage(detail.error ?? "Quiz unavailable");
      return;
    }
    setQuiz(detail.data.quiz);
    const active = detail.data.attempts.find((a) => a.status === "in_progress");
    if (active) {
      router.replace(`/student/quizzes/${params.id}/attempt/${active.id}`);
      return;
    }
  }, [params.attemptId, params.id, router]);

  React.useEffect(() => {
    void boot();
  }, [boot]);

  async function start() {
    if (startedRef.current) return;
    startedRef.current = true;
    const result = await quizJson<{
      attempt: QuizAttempt;
      questions: StudentQuestion[];
    }>(`/api/quizzes/${params.id}/attempts`, "POST");
    if (!result.success || !result.data) {
      setMessage(result.error ?? "Unable to start");
      startedRef.current = false;
      return;
    }
    router.replace(`/student/quizzes/${params.id}/attempt/${result.data.attempt.id}`);
  }

  // Timer
  React.useEffect(() => {
    if (!attempt?.expiresAt || attempt.status !== "in_progress") return;
    const tick = () => {
      const ms = Date.parse(attempt.expiresAt!) - Date.now();
      setRemaining(Math.max(0, Math.floor(ms / 1000)));
      if (ms <= 0) {
        void submit(true);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.id, attempt?.expiresAt, attempt?.status]);

  // Auto-save every 15s
  React.useEffect(() => {
    if (!attempt || attempt.status !== "in_progress") return;
    const id = window.setInterval(() => {
      void quizJson(`/api/quizzes/attempts/${attempt.id}`, "PATCH", {
        answers: Object.entries(responses).map(([questionId, response]) => ({
          questionId,
          response,
        })),
        timeSpentSeconds: Math.floor(
          (Date.now() - Date.parse(attempt.startedAt)) / 1000,
        ),
        clientMeta: { path: window.location.pathname },
      });
    }, 15_000);
    return () => window.clearInterval(id);
  }, [attempt, responses]);

  // Refresh / visibility suspicious logging
  React.useEffect(() => {
    if (!attempt || attempt.status !== "in_progress") return;
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        void quizJson(`/api/quizzes/attempts/${attempt.id}`, "PATCH", {
          answers: [],
          suspicious: { type: "tab_blur", detail: "Student left the quiz tab" },
        });
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [attempt]);

  async function submit(auto = false) {
    if (!attempt) return;
    const result = await quizJson<{
      attempt: QuizAttempt;
      reviewAllowed: boolean;
    }>(`/api/quizzes/attempts/${attempt.id}`, "PATCH", {
      submit: true,
      answers: Object.entries(responses).map(([questionId, response]) => ({
        questionId,
        response,
      })),
      timeSpentSeconds: Math.floor((Date.now() - Date.parse(attempt.startedAt)) / 1000),
    });
    if (result.success) {
      router.push(`/student/quizzes/${params.id}/results/${attempt.id}`);
    } else {
      setMessage(result.error ?? (auto ? "Auto-submit failed" : "Submit failed"));
    }
  }

  if (message) {
    return <p className="p-6 text-sm text-destructive">{message}</p>;
  }

  if (!params.attemptId && quiz) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4">
        <h1 className="font-display text-3xl font-semibold">{quiz.title}</h1>
        <p className="text-muted-foreground">{quiz.description}</p>
        <Card>
          <CardContent className="space-y-3 pt-6 text-sm">
            <p>{quiz.instructions}</p>
            <p>
              Time limit: {quiz.timeLimitMinutes ?? "None"} min · Attempts left policy: max{" "}
              {quiz.maxAttempts}
            </p>
            <p>Passing score: {quiz.passingScore}%</p>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button onClick={() => void start()}>Start quiz</Button>
          <Button asChild variant="outline">
            <Link href="/student/quizzes">Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!attempt || !quiz || !questions.length) {
    return <p className="p-6 text-sm text-muted-foreground">Preparing assessment…</p>;
  }

  const current = questions[index]!;
  const progress = Math.round(((index + 1) / questions.length) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{quiz.title}</p>
          <h1 className="font-display text-2xl font-semibold">
            Question {index + 1} / {questions.length}
          </h1>
        </div>
        {remaining != null ? (
          <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm">
            <Clock3 className="size-4" />
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
          </div>
        ) : null}
      </div>
      <Progress value={progress} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base leading-snug">{current.stem}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {QUESTION_TYPE_LABELS[current.type as keyof typeof QUESTION_TYPE_LABELS] ??
              current.type}{" "}
            · {current.points} pts
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <QuestionInput
            question={current}
            value={responses[current.id]}
            onChange={(value) =>
              setResponses((prev) => ({ ...prev, [current.id]: value }))
            }
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-between gap-2">
        <Button
          variant="outline"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Previous
        </Button>
        <div className="flex gap-2">
          {index < questions.length - 1 ? (
            <Button onClick={() => setIndex((i) => i + 1)}>Next</Button>
          ) : (
            <Button onClick={() => void submit(false)}>Submit quiz</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: StudentQuestion;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (
    question.type === "multiple_choice_single" ||
    question.type === "true_false"
  ) {
    return (
      <div className="space-y-2">
        {question.options.map((opt) => (
          <label
            key={opt.id}
            className="flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-sm"
          >
            <input
              type="radio"
              name={question.id}
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    );
  }
  if (question.type === "multiple_choice_multiple") {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="space-y-2">
        {question.options.map((opt) => {
          const checked = selected.includes(opt.id);
          return (
            <label
              key={opt.id}
              className="flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => {
                  onChange(
                    checked
                      ? selected.filter((id) => id !== opt.id)
                      : [...selected, opt.id],
                  );
                }}
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    );
  }
  if (question.type === "ordering") {
    const order = Array.isArray(value)
      ? (value as string[])
      : question.options.map((o) => o.id);
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Enter option ids in order, comma-separated.</p>
        <Input
          value={order.join(",")}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
        />
        <ul className="text-sm text-muted-foreground">
          {question.options.map((o) => (
            <li key={o.id}>
              {o.id}: {o.label}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (question.type === "essay" || question.type === "short_answer") {
    return (
      <Textarea
        rows={question.type === "essay" ? 8 : 3}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
  );
}

export { StudentQuizTakeView };
