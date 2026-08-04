/**
 * Integration: certificates verification ↔ issued certificate records.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { ensureCertificatesSeeded } from "@/services/certificates/seed";
import { listCertificates } from "@/services/certificates/certificate-service";
import { verifyCertificatePublic } from "@/services/certificates/verification-service";

describe("certificates ↔ student progress", () => {
  beforeAll(() => {
    ensureCertificatesSeeded();
  });

  it("lists certificates and verifies a known code when present", () => {
    const certs = listCertificates({ status: "all" });
    expect(Array.isArray(certs)).toBe(true);
    if (certs.length > 0) {
      const code = certs[0]!.verificationCode || certs[0]!.certificateNumber;
      const result = verifyCertificatePublic(code);
      expect(result).toBeTruthy();
      expect(result.validity).toBeDefined();
    }
  });
});
