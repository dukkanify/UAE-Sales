"use client";

import * as React from "react";
import { KeyRound, Plug, RefreshCw, Webhook } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authFetch, csrfHeaders } from "@/features/auth/services/auth-api";

export function ApiPlatformShell() {
  const [keys, setKeys] = React.useState<Array<Record<string, unknown>>>([]);
  const [integrations, setIntegrations] = React.useState<Array<Record<string, unknown>>>([]);
  const [webhooks, setWebhooks] = React.useState<Array<Record<string, unknown>>>([]);
  const [monitoring, setMonitoring] = React.useState<Record<string, unknown> | null>(null);
  const [secretOnce, setSecretOnce] = React.useState<string | null>(null);
  const [keyName, setKeyName] = React.useState("Mobile server key");
  const [hookUrl, setHookUrl] = React.useState("https://example.com/hooks/aep");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    const [k, i, w, m] = await Promise.all([
      authFetch<Array<Record<string, unknown>>>("/api/v1/platform/keys"),
      authFetch<Array<Record<string, unknown>>>("/api/v1/platform/integrations"),
      authFetch<Array<Record<string, unknown>>>("/api/v1/platform/webhooks"),
      authFetch<Record<string, unknown>>("/api/v1/platform/monitoring"),
    ]);
    setKeys(k.data ?? []);
    setIntegrations(i.data ?? []);
    setWebhooks(w.data ?? []);
    setMonitoring(m.data);
    if (!k.success) setError(k.error);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function post(path: string, body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const res = await fetch(path, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as {
      success: boolean;
      data?: Record<string, unknown>;
      error?: { message?: string } | string | null;
    };
    if (!json.success) {
      const msg =
        typeof json.error === "string" ? json.error : json.error?.message || "Request failed";
      setError(msg);
    } else if (json.data?.secret) {
      setSecretOnce(String(json.data.secret));
    }
    await load();
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Platform"
        description="Mobile-ready v1 API keys, webhooks, integrations, queue monitoring, and OpenAPI."
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "API Platform" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <a href="/api/v1/openapi" target="_blank" rel="noreferrer">
                OpenAPI JSON
              </a>
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void load()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      />

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {secretOnce ? (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
          Copy API key now (shown once): <code className="break-all">{secretOnce}</code>
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Requests (1h)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {String(monitoring?.requestsLastHour ?? "—")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Failed (1h)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {String(monitoring?.failedLastHour ?? "—")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg response</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {String(monitoring?.avgResponseMs ?? "—")} ms
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="keys">
        <TabsList>
          <TabsTrigger value="keys">API keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="mt-4 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4" /> API keys
              </CardTitle>
              <CardDescription>
                Hashed at rest · scopes · rate limits · IP allowlists
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input value={keyName} onChange={(e) => setKeyName(e.target.value)} />
                <Button
                  disabled={busy || !keyName.trim()}
                  onClick={() =>
                    void post("/api/v1/platform/keys", {
                      name: keyName,
                      scopes: ["mobile:full", "public:read"],
                    })
                  }
                >
                  Create key
                </Button>
              </div>
              {keys.map((k) => (
                <div key={String(k.id)} className="rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      {String(k.name)} · <code>{String(k.keyPrefix)}…</code>
                    </span>
                    <Badge>{String(k.status)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    scopes: {Array.isArray(k.scopes) ? k.scopes.join(", ") : ""} ·{" "}
                    {String(k.rateLimitPerMinute)}/min
                  </p>
                  {k.status === "active" ? (
                    <Button
                      className="mt-2"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        void post("/api/v1/platform/keys", {
                          action: "revoke",
                          id: k.id,
                          name: k.name,
                        })
                      }
                    >
                      Revoke
                    </Button>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Webhook className="h-4 w-4" /> Outbound webhooks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input value={hookUrl} onChange={(e) => setHookUrl(e.target.value)} />
                <Button
                  disabled={busy}
                  onClick={() =>
                    void post("/api/v1/platform/webhooks", {
                      action: "create",
                      url: hookUrl,
                      events: ["payment.*", "user.registered", "integration.test"],
                    })
                  }
                >
                  Add endpoint
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => void post("/api/v1/platform/webhooks", { action: "test" })}
                >
                  Send test
                </Button>
              </div>
              {webhooks.map((w) => (
                <div key={String(w.id)} className="rounded-md border p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium break-all">{String(w.url)}</span>
                    <Badge variant={w.active ? "default" : "secondary"}>
                      {w.active ? "active" : "off"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Array.isArray(w.events) ? w.events.join(", ") : ""} · failures{" "}
                    {String(w.failureCount)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plug className="h-4 w-4" /> Integration catalog
              </CardTitle>
              <CardDescription>
                Zoom · SMTP · Stripe · Google/Microsoft Calendar · Slack · Teams · CRM · Marketing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {integrations.map((i) => (
                <div
                  key={String(i.id)}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{String(i.label)}</p>
                    <p className="text-xs text-muted-foreground">{String(i.notes)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{String(i.status)}</Badge>
                    <Badge>{i.enabled ? "on" : "off"}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
