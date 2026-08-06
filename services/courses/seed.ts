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

const PUBLIC_CATALOG_CODES = [
  "ATPL-010",
  "ATPL-031",
  "ATPL-050",
  "ATPL-061",
  "ATPL-062",
  "ATPL-070",
  "ATPL-081",
  "PPL-GS-01",
] as const;

function catalogNeedsEnrichment(
  db: ReturnType<typeof readCoursesDb>,
  instructorIds: Set<string>,
): boolean {
  const codes = new Set(db.courses.map((c) => c.code));
  for (const code of PUBLIC_CATALOG_CODES) {
    if (!codes.has(code)) return true;
  }
  for (const course of db.courses) {
    if (!PUBLIC_CATALOG_CODES.includes(course.code as (typeof PUBLIC_CATALOG_CODES)[number])) {
      continue;
    }
    if (course.status !== "published" || !course.publishedAt) return true;
    if (!course.primaryInstructorId || !instructorIds.has(course.primaryInstructorId)) return true;
  }
  return false;
}

/** Upsert missing published demo courses on already-seeded stores. */
function ensurePublishedCatalogEnrichment(): void {
  const users = readAuthDb().users;
  const instructor =
    users.find((u) => u.role === ROLES.INSTRUCTOR) ??
    users.find((u) => u.role === ROLES.SUPER_ADMIN);
  const actor = users.find((u) => u.role === ROLES.SUPER_ADMIN)?.id ?? null;
  const ts = nowIso();
  const instructorIds = new Set(users.map((u) => u.id));
  const snapshot = readCoursesDb();
  // Read-only fast path — avoid rewrite races that can drop concurrent creates.
  if (!catalogNeedsEnrichment(snapshot, instructorIds)) return;

  writeCoursesDb((d) => {
    // Publish older seed drafts that belong in the public catalog.
    for (const course of d.courses) {
      if (!PUBLIC_CATALOG_CODES.includes(course.code as (typeof PUBLIC_CATALOG_CODES)[number])) {
        continue;
      }
      let touched = false;
      if (course.status !== "published" || !course.publishedAt) {
        course.status = "published";
        course.publishedAt = course.publishedAt ?? ts;
        touched = true;
      }
      const orphaned =
        Boolean(course.primaryInstructorId) && !instructorIds.has(course.primaryInstructorId!);
      if (instructor && (!course.primaryInstructorId || orphaned)) {
        course.primaryInstructorId = instructor.id;
        touched = true;
        if (!d.instructors.some((i) => i.courseId === course.id && i.userId === instructor.id)) {
          d.instructors.push({
            id: generateId(),
            courseId: course.id,
            userId: instructor.id,
            role: "primary",
            assignedAt: ts,
          });
        }
      }
      if (touched) course.updatedAt = ts;
    }

    const existingCodes = new Set(d.courses.map((c) => c.code));
    const theory =
      d.categories.find((c) => c.slug === "atpl-theory") ??
      d.categories.find((c) => c.name.toLowerCase().includes("theory")) ??
      d.categories[0];
    const ops =
      d.categories.find((c) => c.slug === "flight-operations") ??
      d.categories.find((c) => c.name.toLowerCase().includes("operation")) ??
      theory;

    const extras: Array<{
      title: string;
      code: (typeof PUBLIC_CATALOG_CODES)[number];
      short: string;
      full: string;
      categoryId: string | null;
      difficulty: Course["difficulty"];
    }> = [
      {
        title: "ATPL 050 — Meteorology",
        code: "ATPL-050",
        short: "Atmosphere, weather hazards, and operational meteorology.",
        full: "ATPL meteorology covering pressure systems, icing, thunderstorms, and interpreting aviation weather products.",
        categoryId: theory?.id ?? null,
        difficulty: "intermediate",
      },
      {
        title: "ATPL 061 — General Navigation",
        code: "ATPL-061",
        short: "Earth geometry, charts, and navigation techniques.",
        full: "Foundations of general navigation including magnetic variation, rhumb lines, and chart projections.",
        categoryId: theory?.id ?? null,
        difficulty: "advanced",
      },
      {
        title: "ATPL 062 — Radio Navigation",
        code: "ATPL-062",
        short: "VOR, ILS, GNSS, and radio aids for IFR operations.",
        full: "Radio navigation systems used on the ATPL syllabus — from ground-based aids to modern GNSS procedures.",
        categoryId: theory?.id ?? null,
        difficulty: "advanced",
      },
      {
        title: "ATPL 070 — Operational Procedures",
        code: "ATPL-070",
        short: "Airline SOPs, special ops, and abnormal procedures.",
        full: "Operational procedures for transport-category aircraft including special airports, RVSM, and abnormal checklists.",
        categoryId: ops?.id ?? null,
        difficulty: "advanced",
      },
      {
        title: "ATPL 081 — Principles of Flight",
        code: "ATPL-081",
        short: "Aerodynamics for high-performance jet aircraft.",
        full: "Principles of flight covering lift, drag, stability, high-speed flight, and performance implications.",
        categoryId: ops?.id ?? null,
        difficulty: "advanced",
      },
      {
        title: "PPL Ground School Essentials",
        code: "PPL-GS-01",
        short: "Private pilot ground school foundation.",
        full: "Introductory modules covering principles of flight, meteorology basics, and human performance for PPL students.",
        categoryId: ops?.id ?? null,
        difficulty: "beginner",
      },
    ];

    for (const def of extras) {
      if (existingCodes.has(def.code)) continue;
      const courseId = generateId();
      d.courses.push({
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
        enrollmentMode: "open",
        status: "published",
        scheduledPublishAt: null,
        primaryInstructorId: instructor?.id ?? null,
        tags: ["atpl", "theory"],
        metadata: { catalogEnrichment: true },
        createdById: actor,
        createdAt: ts,
        updatedAt: ts,
        deletedAt: null,
        publishedAt: ts,
        archivedAt: null,
      });
      if (instructor) {
        d.instructors.push({
          id: generateId(),
          courseId,
          userId: instructor.id,
          role: "primary",
          assignedAt: ts,
        });
      }
      const moduleId = generateId();
      d.modules.push({
        id: moduleId,
        courseId,
        title: "Module 1",
        description: `Core content for ${def.code}`,
        order: 1,
        estimatedDurationMinutes: 480,
        status: "published",
        visible: true,
        createdAt: ts,
        updatedAt: ts,
      });
      d.lessons.push({
        id: generateId(),
        courseId,
        moduleId,
        title: "Lesson 1.1",
        description: `Opening lesson for ${def.code}`,
        contentHtml: `<p>Welcome to <strong>${def.title}</strong>.</p>`,
        videoUrl: null,
        durationMinutes: 45,
        estimatedStudyMinutes: 90,
        order: 1,
        previewAvailable: true,
        status: "published",
        createdAt: ts,
        updatedAt: ts,
      });
    }

    d.seeded = true;
  });
}

export function ensureCoursesSeeded(): void {
  ensureDemoUsersSeeded();
  const db = readCoursesDb();
  if (db.seeded && db.courses.length > 0) {
    ensurePublishedCatalogEnrichment();
    return;
  }

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
      title: "ATPL 050 — Meteorology",
      code: "ATPL-050",
      short: "Atmosphere, weather hazards, and operational meteorology.",
      full: "ATPL meteorology covering pressure systems, icing, thunderstorms, and interpreting aviation weather products for dispatch and flight.",
      categoryId: atplTheory.id,
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
      status: "published",
      difficulty: "advanced",
      enrollmentMode: "open",
    },
    {
      title: "ATPL 062 — Radio Navigation",
      code: "ATPL-062",
      short: "VOR, ILS, GNSS, and radio aids for IFR operations.",
      full: "Radio navigation systems used on the ATPL syllabus — from ground-based aids to modern GNSS procedures and approach design.",
      categoryId: atplTheory.id,
      status: "published",
      difficulty: "advanced",
      enrollmentMode: "open",
    },
    {
      title: "ATPL 070 — Operational Procedures",
      code: "ATPL-070",
      short: "Airline SOPs, special ops, and abnormal procedures.",
      full: "Operational procedures for transport-category aircraft including special airports, RVSM, and abnormal/emergency checklists.",
      categoryId: flightOps.id,
      status: "published",
      difficulty: "advanced",
      enrollmentMode: "manual",
    },
    {
      title: "ATPL 081 — Principles of Flight",
      code: "ATPL-081",
      short: "Aerodynamics for high-performance jet aircraft.",
      full: "Principles of flight covering lift, drag, stability, high-speed flight, and performance implications for ATPL candidates.",
      categoryId: flightOps.id,
      status: "published",
      difficulty: "advanced",
      enrollmentMode: "open",
    },
    {
      title: "PPL Ground School Essentials",
      code: "PPL-GS-01",
      short: "Private pilot ground school foundation.",
      full: "Introductory modules covering principles of flight, meteorology basics, and human performance for PPL students.",
      categoryId: flightOps.id,
      status: "published",
      difficulty: "beginner",
      enrollmentMode: "open",
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

  ensurePublishedCatalogEnrichment();
}
