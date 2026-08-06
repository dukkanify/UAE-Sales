"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QUESTION_TYPE_LABELS } from "@/constants/quizzes";
import { quizFetch, quizJson } from "@/features/quizzes/lib/api";
import type { BankQuestion, Quiz, QuizQuestionLink } from "@/types/quizzes";

type Detail = {
  quiz: Quiz;
  questions: Array<{ link: QuizQuestionLink; question: BankQuestion }>;
};

interface QuizBuilderViewProps {
  basePath?: string;
}

function QuizBuilderView({ basePath = "/instructor/quizzes" }: QuizBuilderViewProps) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = React.useState<Detail | null>(null);
  const [bank, setBank] = React.useState<BankQuestion[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    const [d, b] = await Promise.all([
      quizFetch<Detail>(`/api/quizzes/${params.id}`),
      quizFetch<{ data: BankQuestion[] }>("/api/quizzes/bank?pageSize=100"),
    ]);
    if (d.success && d.data) {
      setDetail(d.data);
      setSelected(d.data.questions.map((q) => q.question.id));
    }
    if (b.success && b.data) {
      setBank(b.data.data ?? []);
    }
  }, [params.id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function saveSettings() {
    if (!detail) return;
    setSaving(true);
    await quizJson(`/api/quizzes/${params.id}`, "PATCH", {
      title: detail.quiz.title,
      description: detail.quiz.description,
      passingScore: detail.quiz.passingScore,
      timeLimitMinutes: detail.quiz.timeLimitMinutes,
      maxAttempts: detail.quiz.maxAttempts,
      randomQuestions: detail.quiz.randomQuestions,
      randomAnswers: detail.quiz.randomAnswers,
      negativeMarking: detail.quiz.negativeMarking,
      showResultsImmediately: detail.quiz.showResultsImmediately,
      reviewAnswers: detail.quiz.reviewAnswers,
      allowResume: detail.quiz.allowResume,
      autoSubmitOnExpiry: detail.quiz.autoSubmitOnExpiry,
      preventDuplicateAttempts: detail.quiz.preventDuplicateAttempts,
      instructions: detail.quiz.instructions,
      courseId: detail.quiz.courseId,
    });
    await quizJson(`/api/quizzes/${params.id}/actions`, "POST", {
      action: "set_questions",
      questionIds: selected,
    });
    setSaving(false);
    void load();
  }

  if (!detail) {
    return <p className="text-sm text-muted-foreground p-6">Loading builder…</p>;
  }

  const q = detail.quiz;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quiz builder"
        description="Configure settings, attach bank questions, and preview the student experience."
        breadcrumbs={[{ label: "Quizzes", href: basePath }, { label: q.title }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={basePath}>
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
            <Button size="sm" onClick={() => void saveSettings()} disabled={saving}>
              <Save className="size-4" />
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                await quizJson(`/api/quizzes/${params.id}/actions`, "POST", {
                  action: "publish",
                });
                router.refresh();
                void load();
              }}
            >
              Publish
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quiz settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={q.title}
              onChange={(e) => setDetail({ ...detail, quiz: { ...q, title: e.target.value } })}
              aria-label="Title"
            />
            <Textarea
              value={q.description}
              onChange={(e) =>
                setDetail({ ...detail, quiz: { ...q, description: e.target.value } })
              }
              rows={3}
              aria-label="Description"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-muted-foreground">
                Passing score %
                <Input
                  type="number"
                  className="mt-1"
                  value={q.passingScore}
                  onChange={(e) =>
                    setDetail({
                      ...detail,
                      quiz: { ...q, passingScore: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label className="text-xs text-muted-foreground">
                Time limit (min)
                <Input
                  type="number"
                  className="mt-1"
                  value={q.timeLimitMinutes ?? ""}
                  onChange={(e) =>
                    setDetail({
                      ...detail,
                      quiz: {
                        ...q,
                        timeLimitMinutes: e.target.value ? Number(e.target.value) : null,
                      },
                    })
                  }
                />
              </label>
              <label className="text-xs text-muted-foreground">
                Max attempts
                <Input
                  type="number"
                  className="mt-1"
                  value={q.maxAttempts}
                  onChange={(e) =>
                    setDetail({
                      ...detail,
                      quiz: { ...q, maxAttempts: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label className="text-xs text-muted-foreground">
                Course ID (optional)
                <Input
                  className="mt-1"
                  value={q.courseId ?? ""}
                  onChange={(e) =>
                    setDetail({
                      ...detail,
                      quiz: { ...q, courseId: e.target.value || null },
                    })
                  }
                />
              </label>
            </div>
            <Textarea
              value={q.instructions}
              onChange={(e) =>
                setDetail({ ...detail, quiz: { ...q, instructions: e.target.value } })
              }
              rows={3}
              aria-label="Instructions"
            />
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              {(
                [
                  ["randomQuestions", "Random questions"],
                  ["randomAnswers", "Random answers"],
                  ["negativeMarking", "Negative marking"],
                  ["showResultsImmediately", "Show results immediately"],
                  ["reviewAnswers", "Review answers"],
                  ["allowResume", "Allow resume"],
                  ["autoSubmitOnExpiry", "Auto-submit on expiry"],
                  ["preventDuplicateAttempts", "Prevent duplicate attempts"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(q[key])}
                    onChange={(e) =>
                      setDetail({
                        ...detail,
                        quiz: { ...q, [key]: e.target.checked },
                      })
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
            <Badge variant="secondary">Status: {q.status}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Questions ({selected.length} selected)</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[70vh] space-y-2 overflow-y-auto">
            {bank.map((item) => {
              const checked = selected.includes(item.id);
              return (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 px-3 py-2"
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checked}
                    onChange={() => {
                      setSelected((prev) =>
                        checked ? prev.filter((id) => id !== item.id) : [...prev, item.id],
                      );
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{item.stem}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {QUESTION_TYPE_LABELS[item.type]} · {item.points} pts · {item.difficulty}
                    </p>
                  </div>
                </label>
              );
            })}
            {!bank.length ? (
              <p className="text-sm text-muted-foreground">
                No bank questions.{" "}
                <Link className="underline" href={`${basePath}/bank`}>
                  Open question bank
                </Link>
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { QuizBuilderView };
