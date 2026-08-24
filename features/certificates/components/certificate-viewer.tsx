"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CERTIFICATE_STATUS_LABELS } from "@/constants/certificates";
import { certFetch } from "@/features/certificates/lib/api";
import type { Certificate } from "@/types/certificates";

function CertificateViewer() {
  const params = useParams<{ id: string }>();
  const [data, setData] = React.useState<{
    certificate: Certificate;
    qrDataUrl: string;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    void (async () => {
      const result = await certFetch<{ certificate: Certificate; qrDataUrl: string }>(
        `/api/certificates/${params.id}`,
      );
      if (!result.success || !result.data) {
        setError(result.error ?? "Unable to load certificate");
        return;
      }
      setData(result.data);
    })();
  }, [params.id]);

  if (error) return <p className="p-6 text-sm text-destructive">{error}</p>;
  if (!data) return <p className="p-6 text-sm text-muted-foreground">Loading certificate…</p>;

  const c = data.certificate;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificate viewer"
        description={c.certificateNumber}
        breadcrumbs={[
          { label: "Certificates", href: "/student/certificates" },
          { label: c.courseName },
        ]}
        actions={
          <Button
            size="sm"
            onClick={() => window.open(`/api/certificates/${c.id}?print=1`, "_blank")}
          >
            Print / Save PDF
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card className="overflow-hidden border-2">
          <CardContent className="space-y-4 bg-gradient-to-br from-background via-muted/20 to-background p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Certificate of Completion
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-tight">
              {c.studentName}
            </h2>
            <p className="text-muted-foreground">has successfully completed</p>
            <h3 className="font-display text-2xl">{c.courseName}</h3>
            <p className="text-sm">
              Instructor {c.instructorName} · Completed {c.completionDate} · Issued{" "}
              {c.issueDate ?? "—"}
            </p>
            <Badge variant="secondary">{CERTIFICATE_STATUS_LABELS[c.status]}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.qrDataUrl}
              alt="Verification QR code"
              className="mx-auto h-40 w-40"
            />
            <p className="font-mono text-xs">{c.verificationCode}</p>
            <p className="break-all text-[10px] text-muted-foreground">
              Sig {c.digitalSignature.slice(0, 32)}…
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href={`/verify/certificate?code=${encodeURIComponent(c.verificationCode)}`}>
                Open public page
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { CertificateViewer };
