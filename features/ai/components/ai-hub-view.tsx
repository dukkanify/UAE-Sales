"use client";

import * as React from "react";
import { BookOpen, ClipboardList, Lightbulb, Search, Sparkles, Wand2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { aiFetch, aiJson } from "@/features/ai/lib/api";
import type {
  AiInsight,
  AiPlanHorizon,
  AiRecommendation,
  AiSearchResult,
  AiStudyPlan,
  AiGeneratedQuestion,
} from "@/types/ai";

interface AiHubViewProps {
  roleLabel: string;
  mode: "student" | "instructor" | "admin";
}

function AiHubView({ roleLabel, mode }: AiHubViewProps) {
  const [recs, setRecs] = React.useState<AiRecommendation[]>([]);
  const [plans, setPlans] = React.useState<AiStudyPlan[]>([]);
  const [insights, setInsights] = React.useState<AiInsight[]>([]);
  const [questions, setQuestions] = React.useState<AiGeneratedQuestion[]>([]);
  const [searchQ, setSearchQ] = React.useState("Show my upcoming classes");
  const [searchResults, setSearchResults] = React.useState<AiSearchResult[]>([]);
  const [searchInterp, setSearchInterp] = React.useState("");
  const [writeTopic, setWriteTopic] = React.useState("upcoming navigation live class");
  const [writeBody, setWriteBody] = React.useState("");
  const [summaryText, setSummaryText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    void (async () => {
      if (mode === "student") {
        const [r, p] = await Promise.all([
          aiFetch<AiRecommendation[]>("/api/ai/recommendations"),
          aiFetch<AiStudyPlan[]>("/api/ai/planner"),
        ]);
        setRecs(r.data ?? []);
        setPlans(p.data ?? []);
      }
      if (mode === "admin") {
        const i = await aiFetch<AiInsight[]>("/api/ai/insights");
        setInsights(i.data ?? []);
      }
    })();
  }, [mode]);

  async function genPlan(horizon: AiPlanHorizon) {
    const r = await aiJson<AiStudyPlan>("/api/ai/planner", "POST", { horizon });
    if (!r.success) {
      setError(r.error);
      return;
    }
    setPlans((p) => [r.data!, ...p]);
  }

  async function acceptPlan(planId: string) {
    const r = await aiJson<{ plan: AiStudyPlan; sessionsCreated: number }>(
      "/api/ai/planner",
      "POST",
      { action: "accept", planId },
    );
    if (!r.success) {
      setError(r.error);
      return;
    }
    setPlans((p) => p.map((x) => (x.id === planId ? r.data!.plan : x)));
  }

  async function genQuestions() {
    const r = await aiJson<AiGeneratedQuestion[]>("/api/ai/questions", "POST", {
      difficulty: "medium",
      count: 4,
    });
    if (!r.success) {
      setError(r.error);
      return;
    }
    setQuestions(r.data ?? []);
  }

  async function runSearch() {
    const r = await aiFetch<{ interpretation: string; results: AiSearchResult[] }>(
      `/api/ai/search?q=${encodeURIComponent(searchQ)}`,
    );
    if (!r.success) {
      setError(r.error);
      return;
    }
    setSearchInterp(r.data?.interpretation ?? "");
    setSearchResults(r.data?.results ?? []);
  }

  async function runWrite(kind: string) {
    const r = await aiJson<{ body: string }>("/api/ai/write", "POST", {
      kind,
      topic: writeTopic,
    });
    if (!r.success) {
      setError(r.error);
      return;
    }
    setWriteBody(r.data?.body ?? "");
  }

  async function runSummary() {
    const r = await aiJson<{ summary: string }>("/api/ai/summarize", "POST", {
      kind: "generic",
      text: summaryText || "ATPL navigation principles including dead reckoning and radio aids.",
    });
    if (!r.success) {
      setError(r.error);
      return;
    }
    setWriteBody(r.data?.summary ?? "");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Learning Assistant"
        description="Secure, permission-aware AI for learning, teaching, and operations — without replacing instructors."
        breadcrumbs={[{ label: roleLabel }, { label: "AI Assistant" }]}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5">
        <CardContent className="flex flex-wrap items-center gap-3 p-5">
          <Sparkles className="size-6 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold">Floating assistant is live</p>
            <p className="text-sm text-muted-foreground">
              Use the sparkles button on any dashboard page for chat, suggestions, and history.
            </p>
          </div>
          <Badge variant="secondary" className="capitalize">
            {mode} mode
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="size-4" />
              AI Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
            <Button size="sm" onClick={() => void runSearch()}>
              Search
            </Button>
            {searchInterp ? <p className="text-xs text-muted-foreground">{searchInterp}</p> : null}
            <div className="space-y-2">
              {searchResults.map((r) => (
                <a
                  key={`${r.type}-${r.id}`}
                  href={r.href}
                  className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/40"
                >
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.snippet}</p>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="size-4" />
              Question generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button size="sm" onClick={() => void genQuestions()}>
              Generate practice set
            </Button>
            <div className="space-y-2 text-sm">
              {questions.map((q) => (
                <div key={q.id} className="rounded-lg border px-3 py-2">
                  <p className="font-medium">
                    [{q.type} · {q.difficulty}] {q.prompt}
                  </p>
                  <p className="text-xs text-muted-foreground">Answer: {q.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {mode === "student" ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="size-4" />
                Course recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {recs.map((r) => (
                <div key={r.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{r.courseTitle}</p>
                  <p className="text-xs text-muted-foreground">{r.reason}</p>
                  <Badge className="mt-2" variant="secondary">
                    Score {r.score}
                  </Badge>
                </div>
              ))}
              {!recs.length ? (
                <p className="text-sm text-muted-foreground">No recommendations yet.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI study planner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(["daily", "weekly", "monthly", "revision", "exam"] as const).map((h) => (
                  <Button key={h} size="sm" variant="outline" onClick={() => void genPlan(h)}>
                    {h}
                  </Button>
                ))}
              </div>
              {plans.map((p) => (
                <div key={p.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{p.title}</p>
                    {!p.accepted ? (
                      <Button size="sm" onClick={() => void acceptPlan(p.id)}>
                        Accept into planner
                      </Button>
                    ) : (
                      <Badge>Accepted</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{p.summary}</p>
                  <p className="mt-1 text-xs">{p.items.length} sessions</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : null}

      {mode !== "student" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wand2 className="size-4" />
              Writing assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={writeTopic} onChange={(e) => setWriteTopic(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => void runWrite("announcement")}>
                Announcement
              </Button>
              <Button size="sm" variant="outline" onClick={() => void runWrite("email")}>
                Email
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void runWrite("course_description")}
              >
                Course description
              </Button>
              <Button size="sm" variant="outline" onClick={() => void runWrite("study_guide")}>
                Study guide
              </Button>
            </div>
            {writeBody ? (
              <pre className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-sm">
                {writeBody}
              </pre>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summarization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Paste text to summarize (or leave blank for demo aviation text)"
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
          />
          <Button size="sm" onClick={() => void runSummary()}>
            Summarize
          </Button>
        </CardContent>
      </Card>

      {mode === "admin" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="size-4" />
              AI insights
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {insights.map((i) => (
              <div key={i.id} className="rounded-lg border px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{i.title}</p>
                  <Badge variant={i.severity === "critical" ? "destructive" : "secondary"}>
                    {i.severity}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{i.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export { AiHubView };
