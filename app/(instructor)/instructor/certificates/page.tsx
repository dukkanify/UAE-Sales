"use client";

import { CertificateManageView } from "@/features/certificates";

export default function InstructorCertificatesPage() {
  return (
    <CertificateManageView roleLabel="Instructor" basePath="/instructor/certificates" />
  );
}
