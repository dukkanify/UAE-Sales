"use client";

import { CertificateManageView } from "@/features/certificates";

export default function AdminCertificatesPage() {
  return <CertificateManageView roleLabel="Admin" basePath="/admin/certificates" />;
}
