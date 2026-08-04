"use client";

import * as React from "react";
import {
  BookOpen,
  HeartPulse,
  Lightbulb,
  MessageSquareQuote,
  Rocket,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { OpsStatusBadge } from "@/features/ops/components/ops-status-badge";

function statusBadge(status: string) {
  return <OpsStatusBadge status={status} />;
}

type Props = {
  busy: boolean;
  run: (action: Record<string, unknown>) => Promise<void>;
  hypercare: Record<string, unknown> | null;
  features: Array<Record<string, unknown>>;
  knowledge: Array<Record<string, unknown>>;
  feedback: Array<Record<string, unknown>>;
  feedbackSummary: Record<string, unknown> | null;
  optimization: Array<Record<string, unknown>>;
  maintenanceDash: Record<string, unknown> | null;
};

export function PostLaunchTabs({
  busy,
  run,
  hypercare,
  features,
  knowledge,
  feedback,
  feedbackSummary,
  optimization,
  maintenanceDash,
}: Props) {
  const [checkIn, setCheckIn] = React.useState("");
  const [featTitle, setFeatTitle] = React.useState("");
  const [featValue, setFeatValue] = React.useState("");
  const [kbTitle, setKbTitle] = React.useState("");
  const [kbBody, setKbBody] = React.useState("");
  const [fbTitle, setFbTitle] = React.useState("");
  const [fbComment, setFbComment] = React.useState("");
  const [optTitle, setOptTitle] = React.useState("");

  const openIssues = (maintenanceDash?.openIssues ?? {}) as Record<string, number>;
  const supportMetrics = (maintenanceDash?.supportMetrics ?? {}) as Record<string, unknown>;
  const upcoming = (maintenanceDash?.upcomingMaintenance ?? {}) as Record<string, unknown>;
  const recentReleases = (maintenanceDash?.recentReleases ?? []) as Array<Record<string, unknown>>;
  const checkIns = ((hypercare?.checkIns ?? []) as Array<Record<string, unknown>>) ?? [];

  return (
    <>
      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Rocket className="h-4 w-4" /> Maintenance dashboard
            </CardTitle>
            <CardDescription>
              System health · open issues · releases · support metrics · availability
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Availability</p>
              <div className="mt-1">
                {statusBadge(String(maintenanceDash?.availability ?? "—"))}
              </div>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Open support / bugs / incidents</p>
              <p className="mt-1 font-medium">
                {openIssues.support ?? 0} / {openIssues.bugs ?? 0} / {openIssues.incidents ?? 0}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">SLA breaches · avg resolution (h)</p>
              <p className="mt-1 font-medium">
                {String(supportMetrics.slaBreaches ?? 0)} ·{" "}
                {String(supportMetrics.avgResolutionHours ?? "—")}
              </p>
            </div>
            <div className="rounded-md border p-3 sm:col-span-2">
              <p className="mb-2 text-xs text-muted-foreground">Recent releases</p>
              {recentReleases.length === 0 ? (
                <p className="text-muted-foreground">None</p>
              ) : (
                recentReleases.map((r) => (
                  <p key={String(r.id)} className="text-sm">
                    <span className="font-medium">v{String(r.version)}</span> — {String(r.title)}
                  </p>
                ))
              )}
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Upcoming maintenance</p>
              <p className="mt-1">
                {upcoming.enabled ? statusBadge("degraded") : statusBadge("available")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {String(upcoming.statusMessage ?? "")}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hypercare" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HeartPulse className="h-4 w-4" /> Hypercare period
            </CardTitle>
            <CardDescription>
              Intensive post-launch monitoring — stability, feedback, critical errors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              {hypercare?.enabled ? <Badge>Active</Badge> : <Badge variant="secondary">Off</Badge>}
              <span className="font-medium">{String(hypercare?.label ?? "Hypercare")}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Window: {String(hypercare?.startedAt ?? "—")} → {String(hypercare?.endsAt ?? "—")}
            </p>
            <p className="text-xs text-muted-foreground">
              Watch: {((hypercare?.watchModules as string[]) ?? []).join(" · ")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={busy}
                onClick={() => void run({ action: "update_hypercare", enabled: true })}
              >
                Enable hypercare
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => void run({ action: "update_hypercare", enabled: false })}
              >
                End hypercare
              </Button>
            </div>
            <Textarea
              placeholder="Daily check-in summary"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
            <Button
              size="sm"
              disabled={busy || !checkIn.trim()}
              onClick={() => {
                void run({
                  action: "hypercare_checkin",
                  summary: checkIn,
                  stability: "stable",
                }).then(() => setCheckIn(""));
              }}
            >
              Log check-in
            </Button>
            {checkIns.map((c) => (
              <div key={String(c.id)} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{String(c.summary)}</span>
                  {statusBadge(String(c.stability))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Critical {String(c.openCritical)} · High {String(c.openHigh)} · {String(c.at)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="features" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" /> Feature requests
            </CardTitle>
            <CardDescription>
              Feature ID · business value · effort/cost · approval · development status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Feature title"
              value={featTitle}
              onChange={(e) => setFeatTitle(e.target.value)}
            />
            <Input
              placeholder="Business value"
              value={featValue}
              onChange={(e) => setFeatValue(e.target.value)}
            />
            <Button
              size="sm"
              disabled={busy || !featTitle.trim()}
              onClick={() => {
                void run({
                  action: "create_feature",
                  title: featTitle,
                  description: featTitle,
                  businessValue: featValue || "TBD",
                  priority: "medium",
                  targetVersion: "1.1.0",
                }).then(() => {
                  setFeatTitle("");
                  setFeatValue("");
                });
              }}
            >
              Submit feature request
            </Button>
            {features.map((row) => (
              <div key={String(row.id)} className="rounded-md border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">
                    {String(row.number)} — {String(row.title)}
                  </span>
                  <div className="flex gap-2">
                    {statusBadge(String(row.priority))}
                    {statusBadge(String(row.approvalStatus))}
                    {statusBadge(String(row.developmentStatus))}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{String(row.businessValue)}</p>
                <p className="text-xs text-muted-foreground">
                  Effort {String(row.estimatedEffortHours ?? "—")}h · Cost{" "}
                  {String(row.estimatedCost ?? "—")} {String(row.currency)} · Target{" "}
                  {String(row.targetVersion ?? "—")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      void run({
                        action: "update_feature",
                        id: row.id,
                        approvalStatus: "approved",
                        developmentStatus: "planned",
                      })
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      void run({ action: "update_feature", id: row.id, approvalStatus: "rejected" })
                    }
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="knowledge" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" /> Knowledge base
            </CardTitle>
            <CardDescription>
              FAQs · troubleshooting · role guides · common issues · best practices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Article title"
              value={kbTitle}
              onChange={(e) => setKbTitle(e.target.value)}
            />
            <Textarea
              placeholder="Article body"
              value={kbBody}
              onChange={(e) => setKbBody(e.target.value)}
            />
            <Button
              size="sm"
              disabled={busy || !kbTitle.trim()}
              onClick={() => {
                void run({
                  action: "create_knowledge",
                  title: kbTitle,
                  summary: kbTitle,
                  body: kbBody || kbTitle,
                  category: "faq",
                  audience: "all",
                  published: true,
                }).then(() => {
                  setKbTitle("");
                  setKbBody("");
                });
              }}
            >
              Publish article
            </Button>
            {knowledge.map((row) => (
              <div key={String(row.id)} className="rounded-md border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{String(row.title)}</span>
                  <div className="flex gap-2">
                    {statusBadge(String(row.category))}
                    {row.published ? (
                      <Badge>Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {String(row.summary)} · audience {String(row.audience)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="feedback" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquareQuote className="h-4 w-4" /> Customer feedback
            </CardTitle>
            <CardDescription>
              Bugs · features · satisfaction ratings · comments · monthly summary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {feedbackSummary ? (
              <div className="rounded-md border p-3">
                <p className="font-medium">Month {String(feedbackSummary.month)}</p>
                <p className="text-xs text-muted-foreground">
                  Total {String(feedbackSummary.total)} · Avg rating{" "}
                  {String(feedbackSummary.averageRating ?? "—")} · New{" "}
                  {String(feedbackSummary.newCount)} · Actioned{" "}
                  {String(feedbackSummary.actionedCount)}
                </p>
              </div>
            ) : null}
            <Input
              placeholder="Feedback title"
              value={fbTitle}
              onChange={(e) => setFbTitle(e.target.value)}
            />
            <Textarea
              placeholder="Comment"
              value={fbComment}
              onChange={(e) => setFbComment(e.target.value)}
            />
            <Button
              size="sm"
              disabled={busy || !fbTitle.trim()}
              onClick={() => {
                void run({
                  action: "create_feedback",
                  category: "comment",
                  title: fbTitle,
                  comment: fbComment || fbTitle,
                  rating: 4,
                }).then(() => {
                  setFbTitle("");
                  setFbComment("");
                });
              }}
            >
              Capture feedback
            </Button>
            {feedback.map((row) => (
              <div key={String(row.id)} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{String(row.title)}</span>
                  <div className="flex gap-2">
                    {statusBadge(String(row.category))}
                    {statusBadge(String(row.status))}
                    {row.rating != null ? (
                      <Badge variant="secondary">★ {String(row.rating)}</Badge>
                    ) : null}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{String(row.comment)}</p>
                <Button
                  className="mt-2"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void run({ action: "update_feedback", id: row.id, status: "reviewed" })
                  }
                >
                  Mark reviewed
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="optimization" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4" /> Continuous optimization
            </CardTitle>
            <CardDescription>
              Database · API · dashboards · search · analytics · storage · caching · jobs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Optimization title"
              value={optTitle}
              onChange={(e) => setOptTitle(e.target.value)}
            />
            <Button
              size="sm"
              disabled={busy || !optTitle.trim()}
              onClick={() => {
                void run({
                  action: "create_optimization",
                  area: "api",
                  title: optTitle,
                  finding: optTitle,
                  recommendedAction: "Investigate and measure",
                  status: "open",
                }).then(() => setOptTitle(""));
              }}
            >
              Add note
            </Button>
            {optimization.map((row) => (
              <div key={String(row.id)} className="rounded-md border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{String(row.title)}</span>
                  <div className="flex gap-2">
                    {statusBadge(String(row.area))}
                    {statusBadge(String(row.status))}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{String(row.finding)}</p>
                <p className="text-xs text-muted-foreground">
                  Action: {String(row.recommendedAction)}
                </p>
                {row.status !== "done" ? (
                  <Button
                    className="mt-2"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      void run({ action: "update_optimization", id: row.id, status: "done" })
                    }
                  >
                    Mark done
                  </Button>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
}
