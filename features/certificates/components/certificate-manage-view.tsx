"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { Award, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CERTIFICATE_STATUS_LABELS } from "@/constants/certificates";
import { certFetch, certJson } from "@/features/certificates/lib/api";
import type { Certificate, CertificateTemplate } from "@/types/certificates";

interface CertificateManageViewProps {
  roleLabel?: string;
  basePath?: string;
}

function CertificateManageView({
  roleLabel = "Admin",
  basePath = "/admin/certificates",
}: CertificateManageViewProps) {
  const [rows, setRows] = React.useState<Certificate[]>([]);
  const [templates, setTemplates] = React.useState<CertificateTemplate[]>([]);
  const [studentId, setStudentId] = React.useState("");
  const [courseId, setCourseId] = React.useState("");

  const load = React.useCallback(async () => {
    const [c, t] = await Promise.all([
      certFetch<Certificate[]>("/api/certificates"),
      certFetch<CertificateTemplate[]>("/api/certificates/templates"),
    ]);
    setRows(c.data ?? []);
    setTemplates(t.data ?? []);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function issue() {
    if (!studentId || !courseId) return;
    await certJson("/api/certificates", "POST", {
      studentId,
      courseId,
      autoApprove: true,
      issueMode: "manual",
    });
    setStudentId("");
    setCourseId("");
    void load();
  }

  async function action(id: string, actionName: "approve" | "revoke" | "reissue") {
    await certJson(`/api/certificates/${id}`, "POST", {
      action: actionName,
      reason: actionName === "revoke" ? "Administrative revocation" : undefined,
    });
    void load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificate management"
        description="Issue, approve, revoke, and reissue digital certificates. Manage reusable templates."
        breadcrumbs={[{ label: roleLabel }, { label: "Certificates" }]}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`${basePath}/templates`}>Templates</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link
                href={
                  roleLabel.includes("Instructor")
                    ? "/instructor/reports"
                    : `${basePath.replace("/certificates", "/reports")}`
                }
              >
                Reports
              </Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Issue certificate</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Student user id"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <Input
            placeholder="Course id"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          />
          <Button onClick={() => void issue()}>
            <Plus className="size-4" />
            Issue
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {rows.map((cert) => (
          <Card key={cert.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-medium">
                  {cert.studentName} · {cert.courseName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {cert.certificateNumber} · {cert.verificationCode}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{CERTIFICATE_STATUS_LABELS[cert.status]}</Badge>
                {cert.status === "pending_approval" ? (
                  <Button size="sm" onClick={() => void action(cert.id, "approve")}>
                    Approve
                  </Button>
                ) : null}
                {cert.status === "issued" ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void action(cert.id, "reissue")}
                    >
                      Reissue
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void action(cert.id, "revoke")}
                    >
                      Revoke
                    </Button>
                  </>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`/api/certificates/${cert.id}?print=1`, "_blank")}
                >
                  <Award className="size-4" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!rows.length ? (
          <p className="text-sm text-muted-foreground">No certificates yet.</p>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Templates available: {templates.length}. Default branding pulls from platform settings.
      </p>
    </div>
  );
}

export { CertificateManageView };
