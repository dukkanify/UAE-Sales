import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { getEnrolledCourseDetail, LearningAccessError } from "@/services/learning/access";
import {
  getAdjacentLessons,
  getCourseLearningState,
  getLessonProgress,
  touchLessonProgress,
} from "@/services/learning/progress-service";
import { listNotes } from "@/services/learning/notes-service";
import { listBookmarks } from "@/services/learning/bookmark-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";

type Ctx = { params: Promise<{ courseId: string; lessonId: string }> };

export async function GET(_request: Request, context: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const { courseId, lessonId } = await context.params;
    const detail = getEnrolledCourseDetail(user, courseId);
    const courseModule = detail.modules.find((m) => m.lessons.some((l) => l.id === lessonId));
    const lesson = courseModule?.lessons.find((l) => l.id === lessonId);
    if (!courseModule || !lesson) {
      throw new LearningAccessError("Lesson not found", 404);
    }

    await touchLessonProgress({
      user,
      courseId,
      lessonId,
      markStarted: true,
      deltaSeconds: 5,
    });

    const progress = getLessonProgress(user.id, lessonId);
    const learning = getCourseLearningState(user.id, courseId);
    const notes = listNotes(user.id, { courseId }).filter(
      (n) => !n.lessonId || n.lessonId === lessonId,
    );
    const bookmarks = listBookmarks(user.id).filter(
      (b) => b.lessonId === lessonId || b.targetId === lessonId,
    );

    return NextResponse.json({
      success: true,
      data: {
        course: {
          id: detail.id,
          title: detail.title,
          slug: detail.code,
          modules: detail.modules.map((m) => ({
            id: m.id,
            title: m.title,
            order: m.order,
            lessons: m.lessons.map((l) => ({
              id: l.id,
              title: l.title,
              order: l.order,
              estimatedStudyMinutes: l.estimatedStudyMinutes,
              durationMinutes: l.durationMinutes,
              completed: getLessonProgress(user.id, l.id)?.completed ?? false,
            })),
          })),
        },
        module: { id: courseModule.id, title: courseModule.title },
        lesson,
        progress,
        learning,
        notes,
        bookmarks,
        adjacent: getAdjacentLessons(courseId, lessonId),
      },
      error: null,
    });
  } catch (error) {
    return learningErrorResponse(error);
  }
}
