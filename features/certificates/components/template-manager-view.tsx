"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { certFetch, certJson } from "@/features/certificates/lib/api";
import type { CertificateTemplate } from "@/types/certificates";

interface TemplateManagerViewProps {
  basePath?: string;
}

function TemplateManagerView({ basePath = "/admin/certificates" }: TemplateManagerViewProps) {
  const [templates, setTemplates] = React.useState<CertificateTemplate[]>([]);
  const [name, setName] = React.useState("New branded template");
  const [bodyHtml, setBodyHtml] = React.useState("");

  const load = React.useCallback(async () => {
    const result = await certFetch<CertificateTemplate[]>("/api/certificates/templates");
    setTemplates(result.data ?? []);
    if (result.data?.[0] && !bodyHtml) setBodyHtml(result.data[0].bodyHtml);
  }, [bodyHtml]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function create() {
    await certJson("/api/certificates/templates", "POST", {
      name,
      bodyHtml: bodyHtml || undefined,
      isDefault: templates.length === 0,
    });
    void load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificate templates"
        description="Reusable layouts with branding, logo, colors, signature, and dynamic fields."
        breadcrumbs={[{ label: "Certificates", href: basePath }, { label: "Templates" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea
            rows={10}
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            placeholder="HTML with {{studentName}}, {{courseName}}, …"
          />
          <Button onClick={() => void create()}>Save template</Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {templates.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {t.name} {t.isDefault ? "(Default)" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p>
                Colors {t.primaryColor} / {t.accentColor}
              </p>
              <p>
                Signature: {t.signatureName} — {t.signatureTitle}
              </p>
              <p>Fields: {t.fields.join(", ")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button asChild variant="ghost" size="sm">
        <Link href={basePath}>Back</Link>
      </Button>
    </div>
  );
}

export { TemplateManagerView };
