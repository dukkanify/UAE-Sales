/**
 * Seed demo ATPL curriculum so course management UI is populated.
 */

import { generateId } from "@/lib/security/crypto";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import { readCoursesDb, writeCoursesDb } from "@/services/courses/store";
import type {
  Course,
  CourseCategory,
  CourseInstructorAssignment,
  CourseModule,
  Enrollment,
  Lesson,
  LessonResource,
} from "@/types/courses";

function nowIso() {
  return new Date().toISOString();
}

export function ensureCoursesSeeded(): void {
  ensureDemoUsersSeeded();
  const db = readCoursesDb();
  if (db.seeded && db.courses.length > 0) return;

  const users = readAuthDb().users;
  const instructor =
    users.find((u) => u.role === ROLES.INSTRUCTOR) ??
    users.find((u) => u.role === ROLES.SUPER_ADMIN);
  const assistant = users.filter((u) => u.role === ROLES.INSTRUCTOR)[1] ?? instructor;
  const students = users.filter((u) => u.role === ROLES.STUDENT);
  const actor = users.find((u) => u.role === ROLES.SUPER_ADMIN)?.id ?? null;
  const ts = nowIso();

  const categories: CourseCategory[] = [
    {
      id: generateId(),
      name: "ATPL Theory",
      slug: "atpl-theory",
      description: "Airline Transport Pilot Licence theoretical knowledge",
      parentId: null,
      icon: "Plane",
      order: 1,
      visible: true,
      metadata: {},
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: generateId(),
      name: "Flight Operations",
      slug: "flight-operations",
      description: "Operational procedures and performance",
      parentId: null,
      icon: "Navigation",
      order: 2,
      visible: true,
      metadata: {},
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: generateId(),
      name: "Air Law",
      slug: "air-law",
      description: "Regulatory frameworks",
      parentId: null,
      icon: "Scale",
      order: 3,
      visible: true,
      metadata: {},
      createdAt: ts,
      updatedAt: ts,
    },
  ];

  const atplTheory = categories[0]!;
  const flightOps = categories[1]!;

  // Subcategory under ATPL Theory
  const sub: CourseCategory = {
    id: generateId(),
    name: "010 Air Law",
    slug: "010-air-law",
    description: "EASA ATPL 010 subject",
    parentId: atplTheory.id,
    icon: "BookOpen",
    order: 1,
    visible: true,
    metadata: { subjectCode: "010" },
    createdAt: ts,
    updatedAt: ts,
  };
  categories.push(sub);

  const courseDefs: Array<{
    title: string;
    code: string;
    short: string;
    full: string;
    categoryId: string;
    status: Course["status"];
    difficulty: Course["difficulty"];
    enrollmentMode: Course["enrollmentMode"];
  }> = [
    {
      title: "ATPL 010 — Air Law",
      code: "ATPL-010",
      short: "International and national aviation law for ATPL candidates.",
      full: "Comprehensive coverage of ICAO annexes, EASA regulations, licensing, rules of the air, and aerodrome operations required for ATPL theoretical knowledge.",
      categoryId: sub.id,
      status: "published",
      difficulty: "advanced",
      enrollmentMode: "manual",
    },
    {
      title: "ATPL 031 — Mass & Balance",
      code: "ATPL-031",
      short: "Aircraft loading, CG, and performance implications.",
      full: "Mass & balance theory, documentation, and practical loading scenarios for multi-engine aircraft.",
      categoryId: flightOps.id,
      status: "published",
      difficulty: "intermediate",
      enrollmentMode: "open",
    },
    {
      title: "ATPL 061 — General Navigation",
      code: "ATPL-061",
      short: "Earth geometry, charts, and navigation techniques.",
      full: "Foundations of general navigation including magnetic variation, rhumb lines, and chart projections.",
      categoryId: atplTheory.id,
      status: "draft",
      difficulty: "advanced",
      enrollmentMode: "invitation",
    },
    {
      title: "PPL Ground School Essentials",
      code: "PPL-GS-01",
      short: "Private pilot ground school foundation.",
      full: "Introductory modules covering principles of flight, meteorology basics, and human performance for PPL students.",
      categoryId: flightOps.id,
      status: "private",
      difficulty: "beginner",
      enrollmentMode: "private",
    },
  ];

  const courses: Course[] = [];
  const modules: CourseModule[] = [];
  const lessons: Lesson[] = [];
  const resources: LessonResource[] = [];
  const instructors: CourseInstructorAssignment[] = [];
  const enrollments: Enrollment[] = [];

  for (const def of courseDefs) {
    const courseId = generateId();
    const course: Course = {
      id: courseId,
      title: def.title,
      shortDescription: def.short,
      fullDescription: def.full,
      code: def.code,
      categoryId: def.categoryId,
      thumbnailUrl: "/images/hero-aviation.svg",
      coverImageUrl: "/images/hero-aviation.svg",
      previewVideoUrl: null,
      difficulty: def.difficulty,
      language: "en",
      estimatedDurationMinutes: 2400,
      enrollmentMode: def.enrollmentMode,
      status: def.status,
      scheduledPublishAt: null,
      primaryInstructorId: instructor?.id ?? null,
      tags: ["atpl", "theory"],
      metadata: {},
      createdById: actor,
      createdAt: ts,
      updatedAt: ts,
      deletedAt: null,
      publishedAt: def.status === "published" ? ts : null,
      archivedAt: null,
    };
    courses.push(course);

    if (instructor) {
      instructors.push({
        id: generateId(),
        courseId,
        userId: instructor.id,
        role: "primary",
        assignedAt: ts,
      });
    }
    if (assistant && assistant.id !== instructor?.id) {
      instructors.push({
        id: generateId(),
        courseId,
        userId: assistant.id,
        role: "assistant",
        assignedAt: ts,
      });
    }

    // Two modules × two lessons for structure demo
    for (let m = 1; m <= 2; m++) {
      const moduleId = generateId();
      modules.push({
        id: moduleId,
        courseId,
        title: `Module ${m}`,
        description: `Core content block ${m} for ${def.code}`,
        order: m,
        estimatedDurationMinutes: 480,
        status: def.status === "published" ? "published" : "draft",
        visible: true,
        createdAt: ts,
        updatedAt: ts,
      });

      for (let l = 1; l <= 2; l++) {
        const lessonId = generateId();
        lessons.push({
          id: lessonId,
          courseId,
          moduleId,
          title: `Lesson ${m}.${l}`,
          description: `Lesson ${l} in module ${m}`,
          contentHtml: `<p>Learning objectives for <strong>${def.code}</strong> — Module ${m}, Lesson ${l}.</p><ul><li>Understand key concepts</li><li>Apply regulatory references</li></ul>`,
          videoUrl: null,
          durationMinutes: 45,
          estimatedStudyMinutes: 90,
          order: l,
          previewAvailable: m === 1 && l === 1,
          status: def.status === "published" ? "published" : "draft",
          createdAt: ts,
          updatedAt: ts,
        });

        resources.push({
          id: generateId(),
          lessonId,
          title: `${def.code} handout M${m}L${l}`,
          type: "pdf",
          url: "https://example.com/resources/sample.pdf",
          fileName: `${def.code}-m${m}-l${l}.pdf`,
          mimeType: "application/pdf",
          sizeBytes: 245760,
          downloadable: true,
          order: 1,
          createdAt: ts,
          updatedAt: ts,
        });
      }
    }

    // Enroll first two active students into first published course
    if (def.status === "published" && students.length) {
      for (const s of students.slice(0, 2)) {
        if (s.status === "suspended") continue;
        enrollments.push({
          id: generateId(),
          courseId,
          studentId: s.id,
          status: "approved",
          enrolledById: actor,
          enrolledAt: ts,
          approvedAt: ts,
          completedAt: null,
          droppedAt: null,
          suspendedAt: null,
          notes: "Seed enrollment",
          updatedAt: ts,
        });
      }
    }
  }

  writeCoursesDb((d) => {
    d.categories = categories;
    d.courses = courses;
    d.modules = modules;
    d.lessons = lessons;
    d.resources = resources;
    d.instructors = instructors;
    d.enrollments = enrollments;
    d.progress = [];
    d.seeded = true;
  });
}
