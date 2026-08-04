import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { ensureCommunicationSeeded } from "@/services/communication/seed";
import { uploadCommunicationAttachment } from "@/services/communication/attachment-service";
import { communicationErrorResponse } from "@/app/api/communication/_utils";

export async function POST(request: Request) {
  try {
    ensureCommunicationSeeded();
    const user = await requireAuth();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, data: null, error: "file required" },
        { status: 400 },
      );
    }
    const data = await uploadCommunicationAttachment({ file, actorId: user.id });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}
