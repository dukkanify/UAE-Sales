import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import {
  createTemplate,
  listTemplates,
  updateTemplate,
} from "@/services/certificates/template-service";
import { ensureCertificatesSeeded } from "@/services/certificates/seed";
import { certificateErrorResponse } from "@/app/api/certificates/_utils";

export async function GET() {
  try {
    ensureCertificatesSeeded();
    await requirePermission(PERMISSIONS.CERTIFICATES_MANAGE);
    return NextResponse.json({
      success: true,
      data: listTemplates(),
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
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }
    if (body.id) {
      const data = await updateTemplate({
        user,
        id: String(body.id),
        patch: body as never,
      });
      return NextResponse.json({ success: true, data, error: null });
    }
    const data = await createTemplate({
      user,
      name: String(body.name ?? ""),
      description: body.description ? String(body.description) : undefined,
      isDefault: Boolean(body.isDefault),
      bodyHtml: body.bodyHtml ? String(body.bodyHtml) : undefined,
      primaryColor: body.primaryColor ? String(body.primaryColor) : undefined,
      accentColor: body.accentColor ? String(body.accentColor) : undefined,
      signatureName: body.signatureName ? String(body.signatureName) : undefined,
      signatureTitle: body.signatureTitle ? String(body.signatureTitle) : undefined,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return certificateErrorResponse(error);
  }
}
