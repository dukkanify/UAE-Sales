import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { ROLES } from "@/constants/roles";
import { getMockExamCertificate, getMockExamSession } from "@/services/mock-exams/booking-service";
import { PermissionError } from "@/services/auth/permissions";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const cert = getMockExamCertificate(id);
    if (!cert) {
      return NextResponse.json(
        { success: false, data: null, error: "Certificate not found" },
        { status: 404 },
      );
    }
    if (user.role === ROLES.STUDENT && cert.studentId !== user.id) {
      throw new PermissionError("Forbidden", 403);
    }
    const session = getMockExamSession(cert.sessionId);
    return NextResponse.json({
      success: true,
      data: { certificate: cert, session },
      error: null,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      return NextResponse.json(
        { success: false, data: null, error: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { success: false, data: null, error: "Failed to load certificate" },
      { status: 500 },
    );
  }
}
