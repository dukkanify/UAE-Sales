import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { getEnrolledCourseDetail } from "@/services/learning/access";
import { getAdjacentLessons, getCourseLearningState, listProgressForStudent } from "@/services/learning/progress-service";
import { listNotes } from "@/services/learning/notes-service";
import { listBookmarks, listFavorites } from "@/services/learning/bookmark-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";

type Ctx = { params: Promise<{ courseId: string }> };

export async function GET(_request: Request, context: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const { courseId } = await context.params;
    const detail = getEnrolledCourseDetail(user, courseId);
    const learning = getCourseLearningState(user.id, courseId);
    const progress = listProgressForStudent(user.id).filter((p) => p.courseId === courseId);
    const notes = listNotes(user.id, { courseId });
    const bookmarks = listBookmarks(user.id).filter((b) => b.courseId === courseId);
    const favorites = listFavorites(user.id).filter(
      (f) => f.courseId === courseId || f.targetId === courseId,
    );

    const resumeLessonId = learning.lastLessonId;
    const adjacent = resumeLessonId
      ? getAdjacentLessons(courseId, resumeLessonId)
      : { prev: null, next: null };

    return NextResponse.json({
      success: true,
      data: {
        course: detail,
        learning,
        progress,
        notes,
        bookmarks,
        favorites,
        adjacent,
      },
      error: null,
    });
  } catch (error) {
    return learningErrorResponse(error);
  }
}
