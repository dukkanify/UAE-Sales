import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import {
  createNote,
  exportNotesMarkdown,
  listNotes,
} from "@/services/learning/notes-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";

export async function GET(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const { searchParams } = new URL(request.url);
    if (searchParams.get("export") === "md") {
      const md = exportNotesMarkdown(user.id, searchParams.get("courseId") ?? undefined);
      return new NextResponse(md, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": 'attachment; filename="atpl-pass-notes.md"',
        },
      });
    }
    const data = listNotes(user.id, {
      courseId: searchParams.get("courseId") ?? undefined,
      q: searchParams.get("q") ?? undefined,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return learningErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const body = (await request.json().catch(() => null)) as {
      courseId?: string;
      lessonId?: string | null;
      title?: string;
      body?: string;
    } | null;
    if (!body?.courseId || !body.title) {
      return NextResponse.json(
        { success: false, data: null, error: "courseId and title required" },
        { status: 400 },
      );
    }
    const data = await createNote({
      user,
      courseId: body.courseId,
      lessonId: body.lessonId,
      title: body.title,
      body: body.body ?? "",
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return learningErrorResponse(error);
  }
}
