"use client";

import { Suspense } from "react";

import { PublicCertificateVerifyView } from "@/features/certificates";

export default function VerifyCertificatePage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-muted-foreground">Loading…</p>}>
      <PublicCertificateVerifyView />
    </Suspense>
  );
}
