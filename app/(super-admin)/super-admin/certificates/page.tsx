"use client";

import { CertificateManageView } from "@/features/certificates";

export default function SuperAdminCertificatesPage() {
  return (
    <CertificateManageView roleLabel="Super Admin" basePath="/super-admin/certificates" />
  );
}
