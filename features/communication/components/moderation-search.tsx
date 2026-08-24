"use client";

import * as React from "react";
import { Search, Shield } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { commFetch, commJson } from "@/features/communication/lib/api";
import type { ModerationLog, ModerationRule, SearchHit } from "@/types/communication";

function ModerationPanel() {
  const [rules, setRules] = React.useState<ModerationRule[]>([]);
  const [logs, setLogs] = React.useState<ModerationLog[]>([]);

  const load = React.useCallback(async () => {
    const result = await commFetch<{ rules: ModerationRule[]; logs: ModerationLog[] }>(
      "/api/communication/moderation",
    );
    setRules(result.data?.rules ?? []);
    setLogs(result.data?.logs ?? []);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content moderation"
        description="Configurable rules for profanity, contact leakage, spam, and suspicious content."
        breadcrumbs={[{ label: "Communication" }, { label: "Moderation" }]}
      />
      <div className="grid gap-3">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium capitalize">{rule.kind.replace(/_/g, " ")}</p>
                <p className="text-sm text-muted-foreground">{rule.description}</p>
                <p className="mt-1 font-mono text-xs">{rule.pattern}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{rule.action}</Badge>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(enabled) =>
                    void commJson("/api/communication/moderation", "POST", {
                      ruleId: rule.id,
                      enabled,
                    }).then(load)
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-4" />
            Recent moderation log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No flagged content yet.</p>
          ) : (
            logs.map((l) => (
              <div key={l.id} className="rounded-md border border-border px-3 py-2 text-sm">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{l.action}</Badge>
                  <span>{l.ruleKind}</span>
                  <span>{l.contentType}</span>
                  <span>{new Date(l.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1">{l.snippet}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CommunicationSearch({ basePath }: { basePath: string }) {
  const [q, setQ] = React.useState("");
  const [hits, setHits] = React.useState<SearchHit[]>([]);

  async function run() {
    const result = await commFetch<SearchHit[]>(
      `/api/communication/search?q=${encodeURIComponent(q)}`,
    );
    setHits(result.data ?? []);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication search"
        description="Search messages, posts, comments, announcements, tickets, users, and communities."
        breadcrumbs={[{ label: "Communication" }, { label: "Search" }]}
      />
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the communication center…"
            onKeyDown={(e) => {
              if (e.key === "Enter") void run();
            }}
          />
        </div>
        <Button onClick={() => void run()}>Search</Button>
      </div>
      <div className="space-y-2">
        {hits.map((h) => (
          <a
            key={`${h.type}-${h.id}`}
            href={h.href.startsWith("/") ? h.href : `${basePath}/${h.href}`}
            className="block rounded-lg border border-border px-4 py-3 hover:bg-muted/40"
          >
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{h.type}</Badge>
              <p className="font-medium">{h.title}</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{h.snippet}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

export { ModerationPanel, CommunicationSearch };
