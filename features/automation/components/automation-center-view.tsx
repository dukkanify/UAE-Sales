"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "@/components/ui/app-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AutomationCenterOverview,
  AutomationControl,
  AutomationDomainCard,
} from "@/types/automation-center";

async function apiGet(): Promise<AutomationCenterOverview> {
  const res = await fetch("/api/automation", { cache: "no-store" });
  const json = (await res.json()) as {
    success: boolean;
    data: AutomationCenterOverview;
    error: string | null;
  };
  if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to load");
  return json.data;
}

async function apiPost(body: Record<string, unknown>): Promise<AutomationCenterOverview> {
  const res = await fetch("/api/automation", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as {
    success: boolean;
    data: AutomationCenterOverview;
    error: string | null;
  };
  if (!res.ok || !json.success) throw new Error(json.error ?? "Request failed");
  return json.data;
}

function ControlEditor({
  control,
  value,
  onChange,
}: {
  control: AutomationControl;
  value: string | number | boolean | null;
  onChange: (v: string | number | boolean | null) => void;
}) {
  if (control.type === "boolean") {
    return (
      <Button
        type="button"
        size="sm"
        variant={value ? "secondary" : "outline"}
        onClick={() => onChange(!value)}
      >
        {value ? "On" : "Off"}
      </Button>
    );
  }
  if (control.type === "select") {
    return (
      <Select value={String(value ?? "")} onValueChange={(v) => onChange(v)}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(control.options ?? []).map((opt) => (
            <SelectItem key={opt.value || "empty"} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  return (
    <Input
      type={control.type === "number" ? "number" : "text"}
      value={value === null || value === undefined ? "" : String(value)}
      onChange={(e) =>
        onChange(control.type === "number" ? Number(e.target.value) : e.target.value)
      }
      className="max-w-xs"
    />
  );
}

function DomainCard({
  domain,
  busy,
  onSave,
}: {
  domain: AutomationDomainCard;
  busy: boolean;
  onSave: (domainId: string, patch: Record<string, string | number | boolean | null>) => void;
}) {
  const [draft, setDraft] = React.useState<Record<string, string | number | boolean | null>>(() => {
    const init: Record<string, string | number | boolean | null> = {};
    for (const c of domain.controls) init[c.key] = c.value;
    return init;
  });

  React.useEffect(() => {
    const init: Record<string, string | number | boolean | null> = {};
    for (const c of domain.controls) init[c.key] = c.value;
    setDraft(init);
  }, [domain]);

  return (
    <li className="space-y-4 border-b border-border/50 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium">
            {domain.label}{" "}
            <Badge variant={domain.enabled ? "default" : "outline"}>
              {domain.enabled ? "Active" : "Off"}
            </Badge>
          </p>
          <p className="text-sm text-muted-foreground">{domain.description}</p>
          <p className="text-xs text-muted-foreground">{domain.statusLabel}</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={domain.href}>Open console</Link>
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {domain.controls.map((control) => (
          <div key={control.key} className="space-y-1.5">
            <Label>{control.label}</Label>
            <ControlEditor
              control={control}
              value={draft[control.key] ?? control.value}
              onChange={(v) => setDraft((prev) => ({ ...prev, [control.key]: v }))}
            />
            {control.help ? <p className="text-xs text-muted-foreground">{control.help}</p> : null}
          </div>
        ))}
      </div>
      <Button size="sm" disabled={busy} onClick={() => onSave(domain.id, draft)}>
        Save {domain.label}
      </Button>
    </li>
  );
}

export function AutomationCenterView() {
  const [overview, setOverview] = React.useState<AutomationCenterOverview | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    const data = await apiGet();
    setOverview(data);
  }, []);

  React.useEffect(() => {
    void load().catch((err: Error) => setError(err.message));
  }, [load]);

  async function saveDomain(
    domainId: string,
    patch: Record<string, string | number | boolean | null>,
  ) {
    setBusy(true);
    setError(null);
    try {
      const data = await apiPost({ action: "configure", domain: domainId, patch });
      setOverview(data);
      toast.success("Saved");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleMaintenance() {
    if (!overview) return;
    setBusy(true);
    try {
      const data = await apiPost({
        action: "maintenance",
        maintenanceMode: !overview.platform.maintenanceMode,
      });
      setOverview(data);
      toast.success(data.platform.maintenanceMode ? "Maintenance mode on" : "Platform online");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Automation Center"
        description="Control course types, publishing, instructors, Zoom, schedules, payments, installments, messages, certificates, reports, CGI, and mock exams — without developer intervention."
        breadcrumbs={[{ label: "Super Admin" }, { label: "Automation Center" }]}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3 border-b border-border/50 pb-6"
      >
        <h2 className="font-display text-xl tracking-tight">System status</h2>
        <p className="text-sm text-muted-foreground">
          Status {overview?.platform.platformStatus ?? "…"} · Domains{" "}
          {overview?.stats.domainsEnabled ?? 0}/{overview?.stats.domainsTotal ?? 0} active · Email{" "}
          {overview?.platform.emailNotifications ? "on" : "off"} · SMTP{" "}
          {overview?.platform.smtpConfigured ? "ready" : "outbox"}
          {overview?.stats.lastConfiguredAt
            ? ` · Last change ${new Date(overview.stats.lastConfiguredAt).toLocaleString()}`
            : ""}
        </p>
        <Button
          size="sm"
          variant={overview?.platform.maintenanceMode ? "destructive" : "secondary"}
          disabled={busy || !overview}
          onClick={() => void toggleMaintenance()}
        >
          {overview?.platform.maintenanceMode ? "Exit maintenance" : "Enter maintenance mode"}
        </Button>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-6"
      >
        <div>
          <h2 className="font-display text-xl tracking-tight">Domain controls</h2>
          <p className="text-sm text-muted-foreground">
            Edit hot settings inline, or open the full console for deep operations.
          </p>
        </div>
        <ul className="space-y-8">
          {(overview?.domains ?? []).map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              busy={busy}
              onSave={(id, patch) => void saveDomain(id, patch)}
            />
          ))}
        </ul>
      </motion.section>
    </div>
  );
}
