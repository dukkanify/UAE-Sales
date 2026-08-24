import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requireAuth, requirePermission } from "@/services/auth/guards";
import { ensureCertificatesSeeded } from "@/services/certificates/seed";
import {
  createCertificate,
  listCertificates,
} from "@/services/certificates/certificate-service";
import { certificateErrorResponse } from "@/app/api/certificates/_utils";
import type { CertificateStatus } from "@/types/certificates";

export async function GET(request: Request) {
  try {
    ensureCertificatesSeeded();
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") as CertificateStatus | "all") ?? "all";
    const courseId = searchParams.get("courseId") ?? undefined;

    if (user.role === ROLES.STUDENT) {
      await requirePermission(PERMISSIONS.CERTIFICATES_OWN);
      return NextResponse.json({
        success: true,
        data: listCertificates({ studentId: user.id, status, courseId }),
        error: null,
      });
    }

    await requirePermission(PERMISSIONS.CERTIFICATES_MANAGE);
    const studentId = searchParams.get("studentId") ?? undefined;
    return NextResponse.json({
      success: true,
      data: listCertificates({ studentId, status, courseId }),
      error: null,
    });
  } catch (error) {
    return certificateErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensureCertificatesSeeded();
    const user = await requirePermission(PERMISSIONS.CERTIFICATES_MANAGE);
    const body = (await request.json().catch(() => null)) as {
      studentId?: string;
      courseId?: string;
      templateId?: string;
      autoApprove?: boolean;
      issueMode?: "automatic" | "manual";
      expiresAt?: string | null;
    } | null;
    if (!body?.studentId || !body.courseId) {
      return NextResponse.json(
        { success: false, data: null, error: "studentId and courseId required" },
        { status: 400 },
      );
    }
    const data = await createCertificate({
      user,
      studentId: body.studentId,
      courseId: body.courseId,
      templateId: body.templateId,
      autoApprove: body.autoApprove,
      issueMode: body.issueMode,
      expiresAt: body.expiresAt,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return certificateErrorResponse(error);
  }
}
