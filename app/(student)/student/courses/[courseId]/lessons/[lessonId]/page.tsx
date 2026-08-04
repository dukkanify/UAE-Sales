"use client";

import { useParams } from "next/navigation";

import { CoursePlayerView } from "@/features/learning";

export default function StudentLessonPlayerPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  return <CoursePlayerView courseId={params.courseId} lessonId={params.lessonId} />;
}
