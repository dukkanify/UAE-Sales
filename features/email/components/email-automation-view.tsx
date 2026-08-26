"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EmailAutomationOverview } from "@/types/email-automation";
import { EMAIL_AUTOMATION_EVENTS } from "@/types/email-automation";

async function apiGet(): Promise<EmailAutomationOverview> {
  const res = await fetch("/api/email/automation", { cache: "no-store" });
  const json = (await res.json()) as {
    success: boolean;
    data: EmailAutomationOverview;
    error: string | null;
  };
  if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to load");
  return json.data;
}

async function apiPost(body: Record<string, unknown>) {
  const res = await fetch("/api/email/automation", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { success: boolean; data: unknown; error: string | null };
  if (!res.ok || !json.success) throw new Error(json.error ?? "Request failed");
  return json.data;
}

export function EmailAutomationView({
  breadcrumbs,
}: {
  breadcrumbs: Array<{ label: string; href?: string }>;
}) {
  const [overview, setOverview] = React.useState<EmailAutomationOverview | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [event, setEvent] = React.useState<string>("registration");
  const [to, setTo] = React.useState("");
  const [title, setTitle] = React.useState("AviatorPass notice");
  const [detail, setDetail] = React.useState("This is a test automation dispatch.");

  const load = React.useCallback(async () => {
    const data = await apiGet();
    setOverview(data);
  }, []);

  React.useEffect(() => {
    void load().catch((err: Error) => setError(err.message));
  }, [load]);

  async function toggleEvent(ev: string, enabled: boolean) {
    setBusy(true);
    setError(null);
    try {
      await apiPost({ action: "configure", event: ev, enabled });
      toast.success(enabled ? "Event enabled" : "Event disabled");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function dispatchTest(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiPost({
        action: "dispatch",
        event,
        to: to || undefined,
        title,
        detail,
        data: { recipientName: "Aviator" },
      });
      toast.success("Dispatched");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Dispatch failed";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Email automation"
        description="Professional lifecycle emails across registration, payments, schedule, certificates, and role alerts."
        breadcrumbs={breadcrumbs}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 border-b border-border/50 pb-6"
      >
        <h2 className="font-display text-xl tracking-tight">Delivery</h2>
        <p className="text-sm text-muted-foreground">
          SMTP {overview?.smtpConfigured ? "configured" : "outbox mode"} · Notifications{" "}
          {overview?.emailNotificationsEnabled ? "on" : "off"} · Dispatched{" "}
          {overview?.stats.dispatched ?? 0} · Sent {overview?.stats.sent ?? 0} · Failed{" "}
          {overview?.stats.failed ?? 0}
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-4 border-b border-border/50 pb-8"
      >
        <div>
          <h2 className="font-display text-xl tracking-tight">Event catalog</h2>
          <p className="text-sm text-muted-foreground">
            Enable or pause automation types without changing domain services.
          </p>
        </div>
        <ul className="space-y-3">
          {(overview?.catalog ?? []).map((item) => (
            <li
              key={item.event}
              className="flex flex-col gap-2 border-b border-border/40 pb-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {item.label}{" "}
                  <Badge variant="outline" className="ml-1">
                    {item.audience}
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Button
                size="sm"
                variant={item.enabled !== false ? "secondary" : "outline"}
                disabled={busy}
                onClick={() => void toggleEvent(item.event, item.enabled === false)}
              >
                {item.enabled !== false ? "Enabled" : "Disabled"}
              </Button>
            </li>
          ))}
        </ul>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 border-b border-border/50 pb-8"
      >
        <div>
          <h2 className="font-display text-xl tracking-tight">Manual dispatch</h2>
          <p className="text-sm text-muted-foreground">
            Send a branded test for any event into SMTP or the durable outbox.
          </p>
        </div>
        <form onSubmit={(e) => void dispatchTest(e)} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Event</Label>
            <Select value={event} onValueChange={setEvent}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_AUTOMATION_EVENTS.map((ev) => (
                  <SelectItem key={ev} value={ev}>
                    {ev.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">Recipient email</Label>
            <Input
              id="to"
              type="email"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail">Detail</Label>
            <Input id="detail" value={detail} onChange={(e) => setDetail(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={busy}>
              Dispatch email
            </Button>
          </div>
        </form>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-4"
      >
        <h2 className="font-display text-xl tracking-tight">Recent automation</h2>
        <ul className="space-y-3">
          {(overview?.recent ?? []).length === 0 ? (
            <li className="text-sm text-muted-foreground">No automation dispatches yet.</li>
          ) : (
            overview!.recent.map((row) => (
              <li key={row.id} className="border-b border-border/40 pb-3">
                <p className="font-medium">
                  {row.event.replaceAll("_", " ")} · {row.subject}
                </p>
                <p className="text-sm text-muted-foreground">
                  {row.to} · {row.mode} · {row.success ? "ok" : row.error || "failed"} ·{" "}
                  {new Date(row.createdAt).toLocaleString()}
                </p>
              </li>
            ))
          )}
        </ul>
      </motion.section>
    </div>
  );
}
