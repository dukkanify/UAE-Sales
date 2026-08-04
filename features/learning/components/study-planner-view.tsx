"use client";

import * as React from "react";
import { Target } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { learningFetch, learningJson } from "@/features/learning/lib/api";
import type { StudyGoal, StudySession } from "@/types/learning";

function StudyPlannerView() {
  const [sessions, setSessions] = React.useState<StudySession[]>([]);
  const [goals, setGoals] = React.useState<StudyGoal[]>([]);
  const [suggestion, setSuggestion] = React.useState<StudyGoal | null>(null);
  const [title, setTitle] = React.useState("");
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
  const [goalHours, setGoalHours] = React.useState("4");

  async function load() {
    const [s, g] = await Promise.all([
      learningFetch<StudySession[]>("/api/learning/planner/sessions"),
      learningFetch<{ suggestion: StudyGoal; goals: StudyGoal[] } | StudyGoal[]>(
        "/api/learning/planner/goals?suggest=1",
      ),
    ]);
    setSessions(s.data ?? []);
    if (g.data && !Array.isArray(g.data) && "goals" in g.data) {
      setGoals(g.data.goals);
      setSuggestion(g.data.suggestion);
    } else {
      setGoals((g.data as StudyGoal[]) ?? []);
    }
  }

  React.useEffect(() => {
    void load();
  }, []);

  async function addSession() {
    if (!title || !start || !end) return;
    await learningJson("/api/learning/planner/sessions", "POST", {
      title,
      scheduledStart: new Date(start).toISOString(),
      scheduledEnd: new Date(end).toISOString(),
    });
    setTitle("");
    setStart("");
    setEnd("");
    void load();
  }

  async function completeSession(id: string) {
    await learningJson(`/api/learning/planner/sessions/${id}`, "PATCH", {
      completed: true,
    });
    void load();
  }

  async function addGoal(aiSuggested = false) {
    await learningJson("/api/learning/planner/goals", "POST", {
      title: aiSuggested
        ? suggestion?.title ?? "AI suggested weekly goal"
        : "Weekly learning goal",
      period: "weekly",
      targetHours: Number(goalHours) || 4,
      aiSuggested,
    });
    void load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study planner"
        description="Plan sessions, set weekly and monthly goals, and track completion."
        breadcrumbs={[{ label: "Student" }, { label: "Planner" }]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan a study session</CardTitle>
            <CardDescription>Block time for focused ATPL study.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Session title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              aria-label="Session start"
            />
            <Input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              aria-label="Session end"
            />
            <Button onClick={() => void addSession()}>Add session</Button>
            <ul className="space-y-2 pt-2">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border/70 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.scheduledStart).toLocaleString()} →{" "}
                      {new Date(s.scheduledEnd).toLocaleString()}
                    </p>
                  </div>
                  {s.completed ? (
                    <span className="text-xs text-success">Done</span>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => void completeSession(s.id)}>
                      Complete
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4" />
              Learning goals
            </CardTitle>
            <CardDescription>
              Track weekly and monthly targets. AI suggestions are supported later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Input
                className="w-28"
                type="number"
                min={1}
                value={goalHours}
                onChange={(e) => setGoalHours(e.target.value)}
                aria-label="Target hours"
              />
              <Button onClick={() => void addGoal(false)}>Set weekly goal</Button>
              <Button variant="outline" onClick={() => void addGoal(true)}>
                Accept AI suggestion
              </Button>
            </div>
            {suggestion ? (
              <p className="rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                Future AI: {suggestion.title}
              </p>
            ) : null}
            <div className="space-y-3">
              {goals.map((g) => {
                const pct = Math.min(
                  100,
                  Math.round((g.completedHours / g.targetHours) * 100),
                );
                return (
                  <div key={g.id} className="rounded-xl border border-border/70 p-3">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{g.title}</span>
                      <span className="text-muted-foreground">
                        {g.completedHours}/{g.targetHours}h · {g.status}
                      </span>
                    </div>
                    <Progress value={pct} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { StudyPlannerView };
