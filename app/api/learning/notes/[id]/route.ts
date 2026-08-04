import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { deleteNote, updateNote } from "@/services/learning/notes-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as {
      title?: string;
      body?: string;
    } | null;
    const data = await updateNote({
      user,
      id,
      title: body?.title,
      body: body?.body,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return learningErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const { id } = await context.params;
    await deleteNote(user, id);
    return NextResponse.json({ success: true, data: { id }, error: null });
  } catch (error) {
    return learningErrorResponse(error);
  }
}
