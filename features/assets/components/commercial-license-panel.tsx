"use client";

import * as React from "react";
import { Download, FileText, Plus, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authFetch, csrfHeaders, ensureBrowserCsrf } from "@/features/auth/services/auth-api";
import type { CommercialLicenseRecord } from "@/types/licenses";

export function CommercialLicensePanel({ embedded = false }: { embedded?: boolean }) {
  const [licenses, setLicenses] = React.useState<CommercialLicenseRecord[]>([]);
  const [title, setTitle] = React.useState("Commercial License");
  const [issuer, setIssuer] = React.useState("");
  const [docNumber, setDocNumber] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const res = await authFetch<CommercialLicenseRecord[]>("/api/admin/licenses");
    setLicenses(res.data ?? []);
    if (!res.success) setError(res.error);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (!selectedId && licenses[0]) setSelectedId(licenses[0].id);
  }, [licenses, selectedId]);

  const selected = licenses.find((l) => l.id === selectedId) ?? null;
  const current = selected?.versions.find((v) => v.id === selected.currentVersionId) ?? null;

  async function createLicense() {
    setBusy(true);
    setError(null);
    const res = await authFetch<CommercialLicenseRecord>("/api/admin/licenses", {
      method: "POST",
      body: JSON.stringify({ title, issuer, documentNumber: docNumber }),
    });
    setBusy(false);
    if (!res.success || !res.data) {
      setError(res.error);
      toast.error(res.error ?? "Create failed");
      return;
    }
    toast.success("License record created");
    setSelectedId(res.data.id);
    void load();
  }

  async function uploadPdf(file: File) {
    if (!selectedId) {
      toast.error("Create or select a license first");
      return;
    }
    setBusy(true);
    await ensureBrowserCsrf();
    const form = new FormData();
    form.append("file", file);
    form.append("licenseId", selectedId);
    const res = await fetch("/api/admin/licenses", {
      method: "POST",
      credentials: "include",
      headers: csrfHeaders(),
      body: form,
    });
    const json = (await res.json()) as { success: boolean; error?: string };
    setBusy(false);
    if (!json.success) {
      toast.error(json.error ?? "Upload failed");
      return;
    }
    toast.success("License PDF uploaded");
    void load();
  }

  const body = (
    <div className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New license record</CardTitle>
          <CardDescription>Super Admin only. PDF upload with version history.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Issuer</Label>
            <Input value={issuer} onChange={(e) => setIssuer(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Document number</Label>
            <Input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
          </div>
          <Button onClick={() => void createLicense()} disabled={busy} className="sm:col-span-2">
            <Plus className="me-2 size-4" />
            Create record
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {licenses.map((l) => (
          <Button
            key={l.id}
            size="sm"
            variant={l.id === selectedId ? "default" : "outline"}
            onClick={() => setSelectedId(l.id)}
          >
            {l.title}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => void load()} aria-label="Refresh licenses">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {selected ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{selected.title}</CardTitle>
            <CardDescription>
              {selected.issuer || "No issuer"} · {selected.documentNumber || "No number"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <Upload className="size-4" />
                  Upload PDF version
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadPdf(file);
                    e.target.value = "";
                  }}
                />
              </Label>
              {current ? (
                <>
                  <Badge>Current: {current.versionLabel}</Badge>
                  <Button size="sm" variant="outline" asChild>
                    <a href={current.url} target="_blank" rel="noreferrer">
                      <FileText className="me-2 size-4" />
                      Preview
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={current.url} download>
                      <Download className="me-2 size-4" />
                      Download
                    </a>
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No PDF uploaded yet.</p>
              )}
            </div>

            {current ? (
              <div className="overflow-hidden rounded-lg border bg-muted/30">
                <iframe
                  title={`Preview ${current.fileName}`}
                  src={current.url}
                  className="h-[420px] w-full"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="text-sm font-medium">Version history</p>
              <ul className="space-y-2 text-sm">
                {selected.versions.map((v) => (
                  <li
                    key={v.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
                  >
                    <span>
                      {v.versionLabel} · {v.fileName} · {Math.round(v.sizeBytes / 1024)} KB
                    </span>
                    <span className="flex items-center gap-2">
                      <Badge variant={v.status === "current" ? "default" : "secondary"}>
                        {v.status}
                      </Badge>
                      <a className="text-primary underline" href={v.url} download>
                        Download
                      </a>
                    </span>
                  </li>
                ))}
                {selected.versions.length === 0 ? (
                  <li className="text-muted-foreground">No versions yet.</li>
                ) : null}
              </ul>
            </div>
            <Textarea
              readOnly
              value="Restricted: Super Admin only. Store originals outside git in a secure vault as well."
              className="text-xs text-muted-foreground"
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );

  if (embedded) return body;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commercial license"
        description="Secure PDF storage with preview, download, and version history."
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "Commercial license" },
        ]}
      />
      {body}
    </div>
  );
}
