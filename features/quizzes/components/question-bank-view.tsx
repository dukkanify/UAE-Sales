"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Plus, Search, Upload } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  QUESTION_DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
} from "@/constants/quizzes";
import { quizFetch, quizJson } from "@/features/quizzes/lib/api";
import type { BankQuestion, QuestionType } from "@/types/quizzes";

interface QuestionBankViewProps {
  basePath?: string;
}

function QuestionBankView({ basePath = "/instructor/quizzes" }: QuestionBankViewProps) {
  const [rows, setRows] = React.useState<BankQuestion[]>([]);
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState<QuestionType | "all">("all");
  const [stem, setStem] = React.useState("");
  const [newType, setNewType] = React.useState<QuestionType>("multiple_choice_single");
  const [correct, setCorrect] = React.useState("b");
  const [optionsText, setOptionsText] = React.useState("A|B|C|D");
  const [csv, setCsv] = React.useState("");

  const load = React.useCallback(async () => {
    const params = new URLSearchParams({ pageSize: "100" });
    if (q) params.set("q", q);
    if (type !== "all") params.set("type", type);
    const result = await quizFetch<{ data: BankQuestion[] }>(`/api/quizzes/bank?${params}`);
    setRows(result.data?.data ?? []);
  }, [q, type]);

  React.useEffect(() => {
    const t = window.setTimeout(() => void load(), 200);
    return () => window.clearTimeout(t);
  }, [load]);

  async function createQuestion() {
    const labels = optionsText.split("|").map((s) => s.trim()).filter(Boolean);
    const options = labels.map((label, i) => ({
      id: String.fromCharCode(97 + i),
      label,
      order: i + 1,
    }));
    await quizJson("/api/quizzes/bank", "POST", {
      stem,
      type: newType,
      difficulty: "medium",
      options,
      correctAnswer:
        newType === "multiple_choice_multiple"
          ? correct.split("|").map((s) => s.trim())
          : correct.trim(),
      points: 1,
      tags: ["manual"],
    });
    setStem("");
    void load();
  }

  async function importCsv() {
    await quizJson("/api/quizzes/bank/import", "POST", { csv, format: "csv" });
    setCsv("");
    void load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question bank"
        description="Reusable questions with categories, tags, search, and CSV / PILOT100-ready import."
        breadcrumbs={[
          { label: "Quizzes", href: basePath },
          { label: "Question bank" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.href = "/api/quizzes/bank/import?format=csv";
            }}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search stem, tags, external id…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value as QuestionType | "all")}
        >
          <option value="all">All types</option>
          {QUESTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {QUESTION_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Question stem"
              value={stem}
              onChange={(e) => setStem(e.target.value)}
              rows={3}
            />
            <select
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
              value={newType}
              onChange={(e) => setNewType(e.target.value as QuestionType)}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {QUESTION_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <Input
              placeholder="Options A|B|C|D"
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
            />
            <Input
              placeholder="Correct (option id, or a|b for multi)"
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
            />
            <Button onClick={() => void createQuestion()}>
              <Plus className="size-4" />
              Add to bank
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bulk import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="CSV with header: stem,type,difficulty,subject,tags,options,correctAnswer,points"
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              rows={8}
            />
            <Button variant="outline" onClick={() => void importCsv()}>
              <Upload className="size-4" />
              Import CSV / Excel rows
            </Button>
            <p className="text-xs text-muted-foreground">
              API also accepts JSON rows and a future <code>pilot100</code> payload mapper.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        {rows.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.stem}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.subject}
                  {item.moduleLabel ? ` · ${item.moduleLabel}` : ""}
                  {item.externalId ? ` · ${item.externalSource}:${item.externalId}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{QUESTION_TYPE_LABELS[item.type]}</Badge>
                <Badge variant="outline">
                  {QUESTION_DIFFICULTY_LABELS[item.difficulty]}
                </Badge>
                <Badge variant="outline">{item.points} pts</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await quizJson(`/api/quizzes/bank/${item.id}`, "DELETE");
                    void load();
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!rows.length ? (
          <p className="text-sm text-muted-foreground">No questions match your filters.</p>
        ) : null}
      </div>

      <Button asChild variant="ghost" size="sm">
        <Link href={basePath}>Back to quizzes</Link>
      </Button>
    </div>
  );
}

export { QuestionBankView };
