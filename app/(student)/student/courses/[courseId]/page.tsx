"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { learningFetch } from "@/features/learning/lib/api";

type CoursePayload = {
  learning: { lastLessonId: string | null };
  course: { modules: Array<{ lessons: Array<{ id: string }> }> };
};

export default function StudentCourseHubPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function go() {
      const result = await learningFetch<CoursePayload>(
        `/api/learning/courses/${params.courseId}`,
      );
      if (cancelled) return;
      if (!result.success || !result.data) {
        setError(result.error ?? "Course unavailable");
        return;
      }
      const lessonId =
        result.data.learning.lastLessonId ??
        result.data.course.modules[0]?.lessons[0]?.id;
      if (!lessonId) {
        setError("This course has no published lessons yet.");
        return;
      }
      router.replace(`/student/courses/${params.courseId}/lessons/${lessonId}`);
    }
    void go();
    return () => {
      cancelled = true;
    };
  }, [params.courseId, router]);

  if (error) {
    return <p className="p-6 text-sm text-destructive">{error}</p>;
  }

  return <Skeleton className="h-[50vh] w-full rounded-2xl" />;
}
