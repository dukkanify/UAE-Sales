"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Save, Search, Send } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authFetch } from "@/features/auth/services/auth-api";
import { SETTINGS_CATEGORIES, type PlatformSettings, type SettingsCategory } from "@/types/settings";
import { cn } from "@/lib/utils";

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function BrandUpload({
  label,
  brandKey,
  value,
  onUploaded,
}: {
  label: string;
  brandKey: string;
  value: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  return (
    <div className="space-y-2 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        <Badge variant="outline" className="font-mono text-[10px]">
          {brandKey}
        </Badge>
      </div>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt={label} className="h-12 w-auto max-w-full object-contain" />
      ) : null}
      <Input
        type="file"
        accept="image/*,.pdf,.ai,.svg"
        disabled={uploading}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploading(true);
          try {
            const csrf =
              document.cookie.match(/(?:^|; )aep_csrf=([^;]*)/)?.[1] ??
              (await (async () => {
                await fetch("/api/auth/me", { credentials: "include" });
                return document.cookie.match(/(?:^|; )aep_csrf=([^;]*)/)?.[1];
              })());
            const form = new FormData();
            form.append("file", file);
            form.append("key", brandKey);
            const res = await fetch("/api/admin/settings/branding", {
              method: "POST",
              credentials: "include",
              headers: csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : undefined,
              body: form,
            });
            const json = (await res.json()) as {
              success: boolean;
              data?: { url: string };
              error?: string;
            };
            if (!json.success || !json.data?.url) {
              toast.error(json.error ?? "Upload failed");
              return;
            }
            onUploaded(json.data.url);
            toast.success(`${label} updated`);
          } finally {
            setUploading(false);
          }
        }}
      />
      {uploading ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
        </p>
      ) : null}
    </div>
  );
}

function PlatformSettingsShell() {
  const [settings, setSettings] = React.useState<PlatformSettings | null>(null);
  const [draft, setDraft] = React.useState<PlatformSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [category, setCategory] = React.useState<SettingsCategory>("general");
  const [query, setQuery] = React.useState("");

  const dirty = React.useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(draft),
    [settings, draft],
  );

  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const load = React.useCallback(async () => {
    setLoading(true);
    const result = await authFetch<{ settings: PlatformSettings }>("/api/admin/settings");
    if (result.success && result.data) {
      const safe = structuredClone(result.data.settings);
      if (safe.email.smtpPassword) safe.email.smtpPassword = "";
      setSettings(safe);
      setDraft(structuredClone(safe));
    } else {
      toast.error(result.error ?? "Failed to load settings");
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!draft || !settings) return;
    setSaving(true);
    const patch: Record<string, unknown> = {};
    for (const key of Object.keys(draft) as (keyof PlatformSettings)[]) {
      if (key === "updatedAt" || key === "updatedBy") continue;
      if (JSON.stringify(draft[key]) !== JSON.stringify(settings[key])) {
        patch[key] = draft[key];
      }
    }
    const result = await authFetch<{ settings: PlatformSettings }>("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({ patch }),
    });
    setSaving(false);
    if (!result.success || !result.data) {
      toast.error(result.error ?? "Save failed");
      return;
    }
    const safe = structuredClone(result.data.settings);
    if (safe.email.smtpPassword) safe.email.smtpPassword = "";
    setSettings(safe);
    setDraft(structuredClone(safe));
    toast.success("Settings saved");
  };

  const filteredCategories = SETTINGS_CATEGORIES.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
  });

  if (loading || !draft) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading platform settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform settings"
        description="Configure identity, branding, security, email, and feature flags. Super Admin only."
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "Platform Settings" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {dirty ? <Badge variant="warning">Unsaved changes</Badge> : null}
            <Button variant="outline" onClick={() => setDraft(structuredClone(settings))} disabled={!dirty || saving}>
              Discard
            </Button>
            <Button onClick={() => void save()} disabled={!dirty || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </Button>
          </div>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search settings…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Tabs value={category} onValueChange={(v) => setCategory(v as SettingsCategory)}>
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {filteredCategories.map((c) => (
            <TabsTrigger
              key={c.id}
              value={c.id}
              className={cn(
                "rounded-lg border border-transparent px-3 py-2 data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:shadow-soft",
              )}
            >
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>Platform identity, contact, and status.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Platform name">
                <Input
                  value={draft.general.platformName}
                  onChange={(e) =>
                    setDraft({ ...draft, general: { ...draft.general, platformName: e.target.value } })
                  }
                />
              </Field>
              <Field label="Company name">
                <Input
                  value={draft.general.companyName}
                  onChange={(e) =>
                    setDraft({ ...draft, general: { ...draft.general, companyName: e.target.value } })
                  }
                />
              </Field>
              <Field label="Website URL">
                <Input
                  value={draft.general.websiteUrl}
                  onChange={(e) =>
                    setDraft({ ...draft, general: { ...draft.general, websiteUrl: e.target.value } })
                  }
                />
              </Field>
              <Field label="Contact email">
                <Input
                  type="email"
                  value={draft.general.contactEmail}
                  onChange={(e) =>
                    setDraft({ ...draft, general: { ...draft.general, contactEmail: e.target.value } })
                  }
                />
              </Field>
              <Field label="Support email">
                <Input
                  type="email"
                  value={draft.general.supportEmail}
                  onChange={(e) =>
                    setDraft({ ...draft, general: { ...draft.general, supportEmail: e.target.value } })
                  }
                />
              </Field>
              <Field label="Contact phone">
                <Input
                  value={draft.general.contactPhone}
                  onChange={(e) =>
                    setDraft({ ...draft, general: { ...draft.general, contactPhone: e.target.value } })
                  }
                />
              </Field>
              <Field label="Currency">
                <Input
                  value={draft.general.currency}
                  onChange={(e) =>
                    setDraft({ ...draft, general: { ...draft.general, currency: e.target.value } })
                  }
                />
              </Field>
              <Field label="Country code">
                <Input
                  value={draft.general.country}
                  onChange={(e) =>
                    setDraft({ ...draft, general: { ...draft.general, country: e.target.value } })
                  }
                />
              </Field>
              <Field label="Primary locations" description="Comma-separated">
                <Input
                  value={draft.general.primaryLocations.join(", ")}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      general: {
                        ...draft.general,
                        primaryLocations: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                />
              </Field>
              <Field label="Social handle">
                <Input
                  value={draft.general.socialHandle}
                  onChange={(e) =>
                    setDraft({ ...draft, general: { ...draft.general, socialHandle: e.target.value } })
                  }
                />
              </Field>
              <Field label="Platform status">
                <Select
                  value={draft.general.platformStatus}
                  onValueChange={(v) =>
                    setDraft({
                      ...draft,
                      general: {
                        ...draft.general,
                        platformStatus: v as PlatformSettings["general"]["platformStatus"],
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="degraded">Degraded</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Date format">
                <Input
                  value={draft.general.dateFormat}
                  onChange={(e) =>
                    setDraft({ ...draft, general: { ...draft.general, dateFormat: e.target.value } })
                  }
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Footer details">
                  <Textarea
                    value={draft.general.footerText}
                    onChange={(e) =>
                      setDraft({ ...draft, general: { ...draft.general, footerText: e.target.value } })
                    }
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <ToggleRow
                  label="Maintenance mode"
                  description="Redirect public traffic to the maintenance page"
                  checked={draft.general.maintenanceMode}
                  onCheckedChange={(v) =>
                    setDraft({ ...draft, general: { ...draft.general, maintenanceMode: v } })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Official logo paths and interim colors. Brand guidelines from the client are still pending.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {draft.branding.brandGuidelinesPending ? (
                  <Badge variant="warning">Brand guidelines pending</Badge>
                ) : null}
                {draft.branding.colorPalettePending ? (
                  <Badge variant="warning">Color palette pending</Badge>
                ) : null}
                {draft.branding.typographyPending ? (
                  <Badge variant="warning">Typography pending</Badge>
                ) : null}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <BrandUpload
                  label="Platform logo"
                  brandKey="logoUrl"
                  value={draft.branding.logoUrl}
                  onUploaded={(url) =>
                    setDraft({ ...draft, branding: { ...draft.branding, logoUrl: url } })
                  }
                />
                <BrandUpload
                  label="Dark logo"
                  brandKey="darkLogoUrl"
                  value={draft.branding.darkLogoUrl}
                  onUploaded={(url) =>
                    setDraft({ ...draft, branding: { ...draft.branding, darkLogoUrl: url } })
                  }
                />
                <BrandUpload
                  label="Favicon"
                  brandKey="faviconUrl"
                  value={draft.branding.faviconUrl}
                  onUploaded={(url) =>
                    setDraft({ ...draft, branding: { ...draft.branding, faviconUrl: url } })
                  }
                />
                <BrandUpload
                  label="Login background"
                  brandKey="loginBackgroundUrl"
                  value={draft.branding.loginBackgroundUrl}
                  onUploaded={(url) =>
                    setDraft({ ...draft, branding: { ...draft.branding, loginBackgroundUrl: url } })
                  }
                />
                <BrandUpload
                  label="Login illustration"
                  brandKey="loginIllustrationUrl"
                  value={draft.branding.loginIllustrationUrl}
                  onUploaded={(url) =>
                    setDraft({
                      ...draft,
                      branding: { ...draft.branding, loginIllustrationUrl: url },
                    })
                  }
                />
                <BrandUpload
                  label="Open Graph image"
                  brandKey="openGraphImageUrl"
                  value={draft.branding.openGraphImageUrl}
                  onUploaded={(url) =>
                    setDraft({ ...draft, branding: { ...draft.branding, openGraphImageUrl: url } })
                  }
                />
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Primary color">
                  <Input
                    type="color"
                    value={draft.branding.primaryColor}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        branding: { ...draft.branding, primaryColor: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field label="Secondary color">
                  <Input
                    type="color"
                    value={draft.branding.secondaryColor}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        branding: { ...draft.branding, secondaryColor: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field label="Accent color">
                  <Input
                    type="color"
                    value={draft.branding.accentColor}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        branding: { ...draft.branding, accentColor: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field label="Display typography">
                  <Input
                    value={draft.branding.typographyDisplay}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        branding: { ...draft.branding, typographyDisplay: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field label="Body typography">
                  <Input
                    value={draft.branding.typographyBody}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        branding: { ...draft.branding, typographyBody: e.target.value },
                      })
                    }
                  />
                </Field>
              </div>
              <Field label="Footer information">
                <Textarea
                  value={draft.branding.footerInformation}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      branding: { ...draft.branding, footerInformation: e.target.value },
                    })
                  }
                />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Email configuration</CardTitle>
                <CardDescription>SMTP and future providers (SendGrid, Mailgun, SES).</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const result = await authFetch<{ message: string; queued: boolean }>(
                    "/api/admin/settings/test-email",
                    { method: "POST", body: JSON.stringify({}) },
                  );
                  if (result.success) toast.success(result.data?.message ?? "Test queued");
                  else toast.error(result.error ?? "Test failed");
                }}
              >
                <Send className="h-4 w-4" />
                Test email
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Provider">
                <Select
                  value={draft.email.provider}
                  onValueChange={(v) =>
                    setDraft({
                      ...draft,
                      email: { ...draft.email, provider: v as PlatformSettings["email"]["provider"] },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smtp">SMTP</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                    <SelectItem value="ses">AWS SES</SelectItem>
                    <SelectItem value="resend">Resend</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Encryption">
                <Select
                  value={draft.email.encryption}
                  onValueChange={(v) =>
                    setDraft({
                      ...draft,
                      email: {
                        ...draft.email,
                        encryption: v as PlatformSettings["email"]["encryption"],
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="SMTP host">
                <Input
                  value={draft.email.smtpHost}
                  onChange={(e) =>
                    setDraft({ ...draft, email: { ...draft.email, smtpHost: e.target.value } })
                  }
                />
              </Field>
              <Field label="SMTP port">
                <Input
                  type="number"
                  value={draft.email.smtpPort}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      email: { ...draft.email, smtpPort: Number(e.target.value) || 0 },
                    })
                  }
                />
              </Field>
              <Field label="SMTP username">
                <Input
                  value={draft.email.smtpUsername}
                  onChange={(e) =>
                    setDraft({ ...draft, email: { ...draft.email, smtpUsername: e.target.value } })
                  }
                />
              </Field>
              <Field label="SMTP password" description="Leave blank to keep existing">
                <Input
                  type="password"
                  value={draft.email.smtpPassword}
                  onChange={(e) =>
                    setDraft({ ...draft, email: { ...draft.email, smtpPassword: e.target.value } })
                  }
                />
              </Field>
              <Field label="Sender name">
                <Input
                  value={draft.email.senderName}
                  onChange={(e) =>
                    setDraft({ ...draft, email: { ...draft.email, senderName: e.target.value } })
                  }
                />
              </Field>
              <Field label="Sender email">
                <Input
                  type="email"
                  value={draft.email.senderEmail}
                  onChange={(e) =>
                    setDraft({ ...draft, email: { ...draft.email, senderEmail: e.target.value } })
                  }
                />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-3">
          <ToggleRow
            label="Email notifications"
            checked={draft.notifications.emailNotifications}
            onCheckedChange={(v) =>
              setDraft({
                ...draft,
                notifications: { ...draft.notifications, emailNotifications: v },
              })
            }
          />
          <ToggleRow
            label="In-app notifications"
            checked={draft.notifications.inAppNotifications}
            onCheckedChange={(v) =>
              setDraft({
                ...draft,
                notifications: { ...draft.notifications, inAppNotifications: v },
              })
            }
          />
          <ToggleRow
            label="Reminder emails"
            checked={draft.notifications.reminderEmails}
            onCheckedChange={(v) =>
              setDraft({
                ...draft,
                notifications: { ...draft.notifications, reminderEmails: v },
              })
            }
          />
          <ToggleRow
            label="Marketing emails"
            checked={draft.notifications.marketingEmails}
            onCheckedChange={(v) =>
              setDraft({
                ...draft,
                notifications: { ...draft.notifications, marketingEmails: v },
              })
            }
          />
          <ToggleRow
            label="System alerts"
            checked={draft.notifications.systemAlerts}
            onCheckedChange={(v) =>
              setDraft({
                ...draft,
                notifications: { ...draft.notifications, systemAlerts: v },
              })
            }
          />
        </TabsContent>

        <TabsContent value="authentication" className="mt-6">
          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <Field label="OTP expiration (minutes)">
                <Input
                  type="number"
                  value={draft.authentication.otpExpirationMinutes}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      authentication: {
                        ...draft.authentication,
                        otpExpirationMinutes: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Minimum password length">
                <Input
                  type="number"
                  value={draft.authentication.minimumPasswordLength}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      authentication: {
                        ...draft.authentication,
                        minimumPasswordLength: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Session timeout (minutes)">
                <Input
                  type="number"
                  value={draft.authentication.sessionTimeoutMinutes}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      authentication: {
                        ...draft.authentication,
                        sessionTimeoutMinutes: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Max login attempts">
                <Input
                  type="number"
                  value={draft.authentication.maxLoginAttempts}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      authentication: {
                        ...draft.authentication,
                        maxLoginAttempts: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Account lock duration (minutes)">
                <Input
                  type="number"
                  value={draft.authentication.accountLockDurationMinutes}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      authentication: {
                        ...draft.authentication,
                        accountLockDurationMinutes: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Remember-me days">
                <Input
                  type="number"
                  value={draft.authentication.rememberMeDays}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      authentication: {
                        ...draft.authentication,
                        rememberMeDays: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </Field>
              <div className="sm:col-span-2 space-y-3">
                <ToggleRow
                  label="Password policy enabled"
                  checked={draft.authentication.passwordPolicyEnabled}
                  onCheckedChange={(v) =>
                    setDraft({
                      ...draft,
                      authentication: { ...draft.authentication, passwordPolicyEnabled: v },
                    })
                  }
                />
                <ToggleRow
                  label="Require uppercase"
                  checked={draft.authentication.requireUppercase}
                  onCheckedChange={(v) =>
                    setDraft({
                      ...draft,
                      authentication: { ...draft.authentication, requireUppercase: v },
                    })
                  }
                />
                <ToggleRow
                  label="Require number"
                  checked={draft.authentication.requireNumber}
                  onCheckedChange={(v) =>
                    setDraft({
                      ...draft,
                      authentication: { ...draft.authentication, requireNumber: v },
                    })
                  }
                />
                <ToggleRow
                  label="Require special character"
                  checked={draft.authentication.requireSpecialChar}
                  onCheckedChange={(v) =>
                    setDraft({
                      ...draft,
                      authentication: { ...draft.authentication, requireSpecialChar: v },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6 space-y-3">
          <Field label="Default user role">
            <Select
              value={draft.users.defaultUserRole}
              onValueChange={(v) =>
                setDraft({
                  ...draft,
                  users: {
                    ...draft.users,
                    defaultUserRole: v as PlatformSettings["users"]["defaultUserRole"],
                  },
                })
              }
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <ToggleRow
            label="Instructor approval required"
            checked={draft.users.instructorApprovalRequired}
            onCheckedChange={(v) =>
              setDraft({
                ...draft,
                users: { ...draft.users, instructorApprovalRequired: v },
              })
            }
          />
          <ToggleRow
            label="Student approval required"
            checked={draft.users.studentApprovalRequired}
            onCheckedChange={(v) =>
              setDraft({
                ...draft,
                users: { ...draft.users, studentApprovalRequired: v },
              })
            }
          />
          <ToggleRow
            label="Email verification required"
            checked={draft.users.emailVerificationRequired}
            onCheckedChange={(v) =>
              setDraft({
                ...draft,
                users: { ...draft.users, emailVerificationRequired: v },
              })
            }
          />
          <ToggleRow
            label="Phone verification required"
            checked={draft.users.phoneVerificationRequired}
            onCheckedChange={(v) =>
              setDraft({
                ...draft,
                users: { ...draft.users, phoneVerificationRequired: v },
              })
            }
          />
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-4">
          <ToggleRow
            label="Rate limiting"
            checked={draft.security.rateLimitingEnabled}
            onCheckedChange={(v) =>
              setDraft({ ...draft, security: { ...draft.security, rateLimitingEnabled: v } })
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Requests per minute">
              <Input
                type="number"
                value={draft.security.rateLimitRequestsPerMinute}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    security: {
                      ...draft.security,
                      rateLimitRequestsPerMinute: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            </Field>
            <Field label="Max upload size (MB)">
              <Input
                type="number"
                value={draft.security.maxUploadSizeMb}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    security: {
                      ...draft.security,
                      maxUploadSizeMb: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            </Field>
            <Field label="Trusted domains" description="Comma-separated">
              <Input
                value={draft.security.trustedDomains.join(", ")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    security: {
                      ...draft.security,
                      trustedDomains: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </Field>
            <Field label="Blocked IPs" description="Comma-separated">
              <Input
                value={draft.security.blockedIps.join(", ")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    security: {
                      ...draft.security,
                      blockedIps: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </Field>
            <Field label="Allowed file types" description="MIME types, comma-separated">
              <Textarea
                value={draft.security.allowedFileTypes.join(", ")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    security: {
                      ...draft.security,
                      allowedFileTypes: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </Field>
          </div>
          <ToggleRow
            label="IP blocking"
            checked={draft.security.ipBlockingEnabled}
            onCheckedChange={(v) =>
              setDraft({ ...draft, security: { ...draft.security, ipBlockingEnabled: v } })
            }
          />
          <ToggleRow
            label="Two-factor authentication (future ready)"
            description="Architecture is ready; enforcement ships in a later release."
            checked={draft.security.twoFactorAuthEnabled}
            onCheckedChange={(v) =>
              setDraft({ ...draft, security: { ...draft.security, twoFactorAuthEnabled: v } })
            }
          />
        </TabsContent>

        <TabsContent value="storage" className="mt-6">
          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <Field label="Storage provider">
                <Select
                  value={draft.storage.provider}
                  onValueChange={(v) =>
                    setDraft({
                      ...draft,
                      storage: {
                        ...draft.storage,
                        provider: v as PlatformSettings["storage"]["provider"],
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local (dev)</SelectItem>
                    <SelectItem value="supabase">Supabase Storage</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Supabase bucket">
                <Input
                  value={draft.storage.supabaseBucket}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      storage: { ...draft.storage, supabaseBucket: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="Storage quota (GB)">
                <Input
                  type="number"
                  value={draft.storage.storageQuotaGb}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      storage: {
                        ...draft.storage,
                        storageQuotaGb: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Cleanup older than (days)">
                <Input
                  type="number"
                  value={draft.storage.cleanupOlderThanDays}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      storage: {
                        ...draft.storage,
                        cleanupOlderThanDays: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Allowed extensions" description="Comma-separated">
                  <Input
                    value={draft.storage.allowedExtensions.join(", ")}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        storage: {
                          ...draft.storage,
                          allowedExtensions: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <ToggleRow
                  label="Automatic cleanup"
                  checked={draft.storage.automaticCleanupEnabled}
                  onCheckedChange={(v) =>
                    setDraft({
                      ...draft,
                      storage: { ...draft.storage, automaticCleanupEnabled: v },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localization" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Localization</CardTitle>
              <CardDescription>
                Version 1 is English only. Architecture supports future languages.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Language">
                <Input value={draft.localization.language} disabled />
              </Field>
              <Field label="Timezone">
                <Input
                  value={draft.localization.timezone}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      localization: { ...draft.localization, timezone: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="Country">
                <Input
                  value={draft.localization.country}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      localization: { ...draft.localization, country: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="Regional formatting">
                <Input
                  value={draft.localization.regionalFormatting}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      localization: { ...draft.localization, regionalFormatting: e.target.value },
                    })
                  }
                />
              </Field>
              <div className="sm:col-span-2">
                <ToggleRow
                  label="English only (V1)"
                  description="Disable to prepare multilingual expansion later."
                  checked={draft.localization.englishOnly}
                  onCheckedChange={(v) =>
                    setDraft({
                      ...draft,
                      localization: { ...draft.localization, englishOnly: v },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            Toggle modules without code changes. Disabled modules remain as navigation shells.
          </p>
          {(Object.keys(draft.features) as (keyof PlatformSettings["features"])[]).map((key) => (
            <ToggleRow
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              checked={draft.features[key]}
              onCheckedChange={(v) =>
                setDraft({ ...draft, features: { ...draft.features, [key]: v } })
              }
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { PlatformSettingsShell };
