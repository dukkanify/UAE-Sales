import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requireAuth, requirePermission } from "@/services/auth/guards";
import {
  assertOwnOrManage,
  CertificateError,
} from "@/services/certificates/access";
import {
  approveCertificate,
  getCertificateById,
  reissueCertificate,
  renderCertificateHtml,
  revokeCertificate,
} from "@/services/certificates/certificate-service";
import { certificateErrorResponse } from "@/app/api/certificates/_utils";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const cert = getCertificateById(id);
    if (!cert) throw new CertificateError("Certificate not found", 404);
    assertOwnOrManage(user, cert.studentId);

    const { searchParams } = new URL(request.url);
    if (searchParams.get("format") === "html" || searchParams.get("print") === "1") {
      const rendered = await renderCertificateHtml(id);
      return new NextResponse(rendered.html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const rendered = await renderCertificateHtml(id);
    return NextResponse.json({
      success: true,
      data: { certificate: cert, qrDataUrl: rendered.qrDataUrl },
      error: null,
    });
  } catch (error) {
    return certificateErrorResponse(error);
  }
}

export async function POST(request: Request, context: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.CERTIFICATES_MANAGE);
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as {
      action?: "approve" | "revoke" | "reissue";
      reason?: string;
    } | null;
    switch (body?.action) {
      case "approve":
        return NextResponse.json({
          success: true,
          data: await approveCertificate(user, id),
          error: null,
        });
      case "revoke":
        return NextResponse.json({
          success: true,
          data: await revokeCertificate({
            user,
            id,
            reason: body.reason ?? "Revoked",
          }),
          error: null,
        });
      case "reissue":
        return NextResponse.json({
          success: true,
          data: await reissueCertificate({ user, id }),
          error: null,
        });
      default:
        return NextResponse.json(
          { success: false, data: null, error: "action required" },
          { status: 400 },
        );
    }
  } catch (error) {
    return certificateErrorResponse(error);
  }
}
