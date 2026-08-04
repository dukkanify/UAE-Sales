"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { PublicVerificationResult } from "@/types/certificates";

function PublicCertificateVerifyView() {
  const search = useSearchParams();
  const initial = search.get("code") || search.get("number") || "";
  const [code, setCode] = React.useState(initial);
  const [result, setResult] = React.useState<PublicVerificationResult | null>(null);
  const [loading, setLoading] = React.useState(false);

  const verify = React.useCallback(async (value: string) => {
    if (!value.trim()) return;
    setLoading(true);
    const res = await fetch(
      `/api/certificates/verify?code=${encodeURIComponent(value.trim())}`,
    );
    const json = (await res.json()) as {
      success: boolean;
      data: PublicVerificationResult | null;
    };
    setResult(json.data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    if (initial) void verify(initial);
  }, [initial, verify]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center gap-6 px-4 py-16">
      <div className="text-center">
        <ShieldCheck className="mx-auto mb-3 size-10 text-primary" />
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Verify a certificate
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter a certificate number or verification code, or scan the QR code on the document.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row">
          <Input
            placeholder="Certificate number or verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void verify(code);
            }}
          />
          <Button onClick={() => void verify(code)} disabled={loading}>
            {loading ? "Checking…" : "Verify"}
          </Button>
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-base">
              Verification result
              <Badge variant={result.valid ? "secondary" : "outline"}>
                {result.validity}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {result.validity === "not_found" ? (
              <p className="text-muted-foreground">No matching certificate was found.</p>
            ) : (
              <>
                <p>
                  <span className="text-muted-foreground">Student:</span> {result.studentName}
                </p>
                <p>
                  <span className="text-muted-foreground">Course:</span> {result.courseName}
                </p>
                <p>
                  <span className="text-muted-foreground">Issued:</span> {result.issueDate ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Number:</span>{" "}
                  {result.certificateNumber}
                </p>
                <p>
                  <span className="text-muted-foreground">Instructor:</span>{" "}
                  {result.instructorName}
                </p>
                <p>
                  <span className="text-muted-foreground">Organization:</span>{" "}
                  {result.organizationName}
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span> {result.status}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export { PublicCertificateVerifyView };
