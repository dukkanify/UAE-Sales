"use client";

import * as React from "react";
import Link from "next/link";
import { Award, Download, ExternalLink, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CERTIFICATE_STATUS_LABELS } from "@/constants/certificates";
import { certFetch } from "@/features/certificates/lib/api";
import type { Certificate } from "@/types/certificates";

function StudentCertificatesView() {
  const [rows, setRows] = React.useState<Certificate[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      const result = await certFetch<Certificate[]>("/api/certificates");
      setRows(result.data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificate gallery"
        description="Your issued credentials with verification codes and printable views."
        breadcrumbs={[{ label: "Student" }, { label: "Certificates" }]}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/student/transcript">Transcript</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/student/progress">Progress</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/verify/certificate">
                <ShieldCheck className="size-4" />
                Verify
              </Link>
            </Button>
          </div>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Award className="h-6 w-6" />}
          title="No certificates yet"
          description="Completed courses can generate certificates automatically or via instructor approval."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((cert) => (
            <Card key={cert.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="font-display text-xl">{cert.courseName}</CardTitle>
                    <CardDescription className="mt-1">
                      {cert.certificateNumber}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {CERTIFICATE_STATUS_LABELS[cert.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>Issued {cert.issueDate ?? "—"} · Instructor {cert.instructorName}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  Verify: {cert.verificationCode}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/student/certificates/${cert.id}`}>View</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      window.open(`/api/certificates/${cert.id}?print=1`, "_blank");
                    }}
                  >
                    <Download className="size-4" />
                    Print / PDF
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link
                      href={`/verify/certificate?code=${encodeURIComponent(cert.verificationCode)}`}
                    >
                      <ExternalLink className="size-4" />
                      Public verify
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export { StudentCertificatesView };
