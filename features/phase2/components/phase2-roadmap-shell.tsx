"use client";

import * as React from "react";
import { Rocket } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authFetch } from "@/features/auth/services/auth-api";
import type { Phase2CapabilityStatus } from "@/types/phase2";

type Payload = {
  version: string;
  stability: string;
  capabilities: Phase2CapabilityStatus[];
};

export function Phase2RoadmapShell() {
  const [data, setData] = React.useState<Payload | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    void authFetch<Payload>("/api/v2/capabilities").then((r) => {
      if (r.data) setData(r.data);
      if (!r.success) setError(r.error);
    });
  }, []);

  const byTrain = React.useMemo(() => {
    const map = new Map<string, Phase2CapabilityStatus[]>();
    for (const c of data?.capabilities ?? []) {
      const list = map.get(c.train) ?? [];
      list.push(c);
      map.set(c.train, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [data]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phase 2 — Enterprise expansion"
        description="Version 2.0 roadmap. Capabilities are planned and feature-flagged; v1.0 remains stable."
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "Phase 2" },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{data?.version ?? "2.0-planned"}</Badge>
        <Badge variant="outline">Additive · non-breaking</Badge>
        <Badge variant="warning">Execution epics separately contracted</Badge>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <p className="text-sm text-muted-foreground">{data?.stability}</p>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <a href="/super-admin/settings">Feature flags (Platform Settings)</a>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Specs: docs/PHASE2_ENTERPRISE_ROADMAP.md · docs/ARCHITECTURE_V2.md · docs/phase2/*
      </p>

      {byTrain.map(([train, items]) => (
        <Card key={train}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Rocket className="size-4" />
              Release train {train}
            </CardTitle>
            <CardDescription>{items.length} pillars</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {items.map((c) => (
              <div key={c.id} className="rounded-lg border p-3">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {c.id} · {c.title}
                  </span>
                  <Badge variant={c.enabled ? "default" : "secondary"}>
                    flag {c.flag}: {c.enabled ? "on" : "off"}
                  </Badge>
                  <Badge variant="outline">{c.implemented ? "implemented" : "planned"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{c.summary}</p>
                <p className="mt-2 text-xs text-muted-foreground">{c.docPath}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
