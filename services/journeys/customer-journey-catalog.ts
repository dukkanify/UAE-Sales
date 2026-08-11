/**
 * Customer-journey catalog enrichment (PPL / Basics / ATPL Package / ELP).
 * Ensures PDF product journeys exist as publishable courses + checkout SKUs.
 */

import { generateId } from "@/lib/security/crypto";
import { ROLES } from "@/constants/roles";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb } from "@/services/auth/store";
import { readCoursesDb, writeCoursesDb } from "@/services/courses/store";
import { majorToMinor } from "@/services/payments/money";
import { writePaymentsDb } from "@/services/payments/store";
import type { Course, CourseDeliveryType } from "@/types/courses";
import type { CatalogProduct } from "@/types/payments";

function nowIso() {
  return new Date().toISOString();
}

export type JourneySku =
  "PPL-RECORDED" | "PPL-LIVE" | "BASICS-RECORDED" | "BASICS-LIVE" | "ATPL-PACKAGE" | "ELP-MOCK";

type JourneyCourseDef = {
  code: string;
  title: string;
  short: string;
  full: string;
  deliveryType: CourseDeliveryType;
  hours: number;
  language: string;
  difficulty: Course["difficulty"];
  objectives: string[];
  tags: string[];
  sku: JourneySku;
  priceMajor: number;
  compareAtMajor?: number;
  pricingModel: CatalogProduct["pricingModel"];
  lectureCount?: number;
  programWeeks?: number;
};

const JOURNEY_COURSES: JourneyCourseDef[] = [
  {
    code: "PPL-REC-01",
    title: "Private Pilot License — Recorded",
    short: "Self-paced PPL ground school with DRM-protected recorded lessons.",
    full: "Complete Private Pilot License recorded ground school with sequenced modules, progress tracking, quizzes, and AviatorPass certification on successful completion.",
    deliveryType: "recorded",
    hours: 100,
    language: "en/ar",
    difficulty: "beginner",
    objectives: [
      "Master PPL theoretical knowledge across the full ground-school syllabus",
      "Complete module quizzes and a final assessment",
      "Earn an AviatorPass certificate upon successful completion",
    ],
    tags: ["ppl", "recorded", "journey"],
    sku: "PPL-RECORDED",
    priceMajor: 450,
    compareAtMajor: 520,
    pricingModel: "one_time",
  },
  {
    code: "PPL-LIVE-01",
    title: "Private Pilot License — Live Online",
    short: "Live Zoom PPL program by Captain Abdulaziz Alshoail — 8 weeks.",
    full: "Private Pilot License live online cohort with scheduled Zoom lectures, attendance, homework, and final assessment. Publish this lane independently from the recorded PPL course.",
    deliveryType: "live",
    hours: 100,
    language: "en/ar",
    difficulty: "beginner",
    objectives: [
      "Attend live Zoom lectures across an 8-week program",
      "Complete homework and attendance requirements",
      "Pass the final assessment to receive an AviatorPass certificate",
    ],
    tags: ["ppl", "live", "journey", "cohort"],
    sku: "PPL-LIVE",
    priceMajor: 650,
    compareAtMajor: 720,
    pricingModel: "one_time",
    lectureCount: 24,
    programWeeks: 8,
  },
  {
    code: "BASICS-REC-01",
    title: "Basics of Aviation — Recorded",
    short: "10-hour recorded introduction to aviation fundamentals.",
    full: "Basics of Aviation recorded course covering foundational flight concepts, airspace awareness, and human factors — DRM-protected self-paced learning.",
    deliveryType: "recorded",
    hours: 10,
    language: "en/ar",
    difficulty: "beginner",
    objectives: [
      "Understand core aviation terminology and flight principles",
      "Build a foundation before PPL or ATPL pathways",
      "Complete quizzes and earn an AviatorPass certificate",
    ],
    tags: ["basics", "recorded", "journey"],
    sku: "BASICS-RECORDED",
    priceMajor: 120,
    compareAtMajor: 150,
    pricingModel: "one_time",
  },
  {
    code: "BASICS-LIVE-01",
    title: "Basics of Aviation — Live Online",
    short: "Live Zoom introduction to aviation with Captain Abdulaziz Alshoail.",
    full: "Basics of Aviation live online cohort with scheduled Zoom sessions. Publish independently from the recorded Basics lane.",
    deliveryType: "live",
    hours: 10,
    language: "en/ar",
    difficulty: "beginner",
    objectives: [
      "Join live instructor-led sessions covering aviation basics",
      "Receive session materials and homework inside your account",
      "Complete the program and receive an AviatorPass certificate",
    ],
    tags: ["basics", "live", "journey", "cohort"],
    sku: "BASICS-LIVE",
    priceMajor: 180,
    compareAtMajor: 220,
    pricingModel: "one_time",
    lectureCount: 6,
    programWeeks: 2,
  },
];

function primaryInstructorId(): string | null {
  ensureDemoUsersSeeded();
  const users = readAuthDb().users;
  const captain = users.find(
    (u) =>
      u.role === ROLES.INSTRUCTOR &&
      `${u.firstName} ${u.lastName}`.toLowerCase().includes("abdulaziz"),
  );
  return (
    captain?.id ??
    users.find((u) => u.role === ROLES.INSTRUCTOR)?.id ??
    users.find((u) => u.role === ROLES.SUPER_ADMIN)?.id ??
    null
  );
}

function ensureSyllabus(courseId: string, def: JourneyCourseDef, ts: string) {
  writeCoursesDb((d) => {
    if (d.modules.some((m) => m.courseId === courseId)) return;
    const modules =
      def.deliveryType === "recorded"
        ? [
            {
              title: "Foundations",
              description: "Core concepts and orientation.",
              lessons: [
                { title: "Welcome & course orientation", description: "How to study this lane." },
                { title: "Core theory block 1", description: "Primary knowledge area." },
              ],
            },
            {
              title: "Applied knowledge",
              description: "Scenario-based application.",
              lessons: [
                { title: "Applied scenarios", description: "Worked examples and practice." },
                { title: "Module review quiz prep", description: "Prepare for the module check." },
              ],
            },
            {
              title: "Final readiness",
              description: "Final assessment preparation.",
              lessons: [
                { title: "Revision masterclass", description: "Consolidate the full syllabus." },
                { title: "Final exam briefing", description: "Assessment rules and readiness." },
              ],
            },
          ]
        : [
            {
              title: "Live program",
              description: `Live Zoom program · ${def.programWeeks ?? 8} weeks · ${def.lectureCount ?? 12} lectures.`,
              lessons: [
                {
                  title: "Cohort kickoff",
                  description: "Meet your instructor and review the live schedule.",
                },
                {
                  title: "Live theory sessions",
                  description: "Attend scheduled Zoom lectures with homework follow-up.",
                },
                {
                  title: "Final assessment week",
                  description: "Complete the program assessment and certificate path.",
                },
              ],
            },
          ];

    modules.forEach((mod, modIndex) => {
      const moduleId = generateId();
      d.modules.push({
        id: moduleId,
        courseId,
        title: mod.title,
        description: mod.description,
        order: modIndex + 1,
        estimatedDurationMinutes: Math.round((def.hours * 60) / modules.length),
        status: "published",
        visible: true,
        createdAt: ts,
        updatedAt: ts,
      });
      mod.lessons.forEach((lesson, lessonIndex) => {
        d.lessons.push({
          id: generateId(),
          courseId,
          moduleId,
          title: lesson.title,
          description: lesson.description,
          contentHtml: `<p>${lesson.description}</p>`,
          videoUrl: def.deliveryType === "recorded" ? "/videos/sample-lesson.mp4" : null,
          durationMinutes: 45,
          estimatedStudyMinutes: 90,
          order: lessonIndex + 1,
          previewAvailable: modIndex === 0 && lessonIndex === 0,
          status: "published",
          createdAt: ts,
          updatedAt: ts,
        });
      });
    });
  });
}

/** Ensure journey courses exist and stay aligned with PDF specs. */
export function ensureCustomerJourneyCourses(): void {
  ensureDemoUsersSeeded();
  const instructorId = primaryInstructorId();
  const actor = readAuthDb().users.find((u) => u.role === ROLES.SUPER_ADMIN)?.id ?? instructorId;
  const ts = nowIso();

  writeCoursesDb((d) => {
    const theory =
      d.categories.find((c) => c.slug === "atpl-theory") ??
      d.categories.find((c) => c.name.toLowerCase().includes("theory")) ??
      d.categories[0];
    const ops =
      d.categories.find((c) => c.slug === "flight-operations") ??
      d.categories.find((c) => c.name.toLowerCase().includes("operation")) ??
      theory;

    for (const def of JOURNEY_COURSES) {
      const existing = d.courses.find((c) => c.code === def.code);
      if (existing) {
        existing.title = def.title;
        existing.shortDescription = def.short;
        existing.fullDescription = def.full;
        existing.deliveryType = def.deliveryType;
        existing.estimatedDurationMinutes = def.hours * 60;
        existing.language = def.language;
        existing.difficulty = def.difficulty;
        existing.primaryInstructorId = instructorId;
        existing.tags = Array.from(new Set([...existing.tags, ...def.tags]));
        existing.metadata = {
          ...existing.metadata,
          journeySku: def.sku,
          objectives: def.objectives,
          sequentialLock: def.deliveryType === "recorded",
          lectureCount: def.lectureCount ?? null,
          programWeeks: def.programWeeks ?? null,
          currencyChoice: true,
          instructorDisplayName: "Captain Abdulaziz Alshoail",
        };
        existing.updatedAt = ts;
        if (instructorId && !d.instructors.some((i) => i.courseId === existing.id)) {
          d.instructors.push({
            id: generateId(),
            courseId: existing.id,
            userId: instructorId,
            role: "primary",
            assignedAt: ts,
          });
        }
        continue;
      }

      const courseId = generateId();
      d.courses.push({
        id: courseId,
        title: def.title,
        shortDescription: def.short,
        fullDescription: def.full,
        code: def.code,
        categoryId:
          def.code.startsWith("PPL") || def.code.startsWith("BASICS")
            ? (ops?.id ?? null)
            : (theory?.id ?? null),
        thumbnailUrl: "/images/hero-aviation.svg",
        coverImageUrl: "/images/hero-aviation.svg",
        previewVideoUrl: null,
        difficulty: def.difficulty,
        language: def.language,
        estimatedDurationMinutes: def.hours * 60,
        enrollmentMode: "open",
        deliveryType: def.deliveryType,
        enrollmentOpen: true,
        hidden: false,
        status: "published",
        scheduledPublishAt: null,
        primaryInstructorId: instructorId,
        tags: def.tags,
        metadata: {
          journeySku: def.sku,
          objectives: def.objectives,
          sequentialLock: def.deliveryType === "recorded",
          lectureCount: def.lectureCount ?? null,
          programWeeks: def.programWeeks ?? null,
          currencyChoice: true,
          instructorDisplayName: "Captain Abdulaziz Alshoail",
          customerJourney: true,
        },
        createdById: actor,
        createdAt: ts,
        updatedAt: ts,
        deletedAt: null,
        publishedAt: ts,
        archivedAt: null,
      });
      if (instructorId) {
        d.instructors.push({
          id: generateId(),
          courseId,
          userId: instructorId,
          role: "primary",
          assignedAt: ts,
        });
      }
    }

    // Align legacy PPL ground school toward recorded journey hours when present.
    const legacyPpl = d.courses.find((c) => c.code === "PPL-GS-01");
    if (legacyPpl) {
      legacyPpl.estimatedDurationMinutes = 100 * 60;
      legacyPpl.language = "en/ar";
      legacyPpl.primaryInstructorId = instructorId ?? legacyPpl.primaryInstructorId;
      legacyPpl.metadata = {
        ...legacyPpl.metadata,
        objectives: [
          "Build PPL ground-school foundations",
          "Complete sequenced recorded lessons with progress tracking",
          "Prepare for the Private Pilot License theory path",
        ],
        sequentialLock: true,
        instructorDisplayName: "Captain Abdulaziz Alshoail",
      };
      legacyPpl.updatedAt = ts;
    }
  });

  for (const def of JOURNEY_COURSES) {
    const course = readCoursesDb().courses.find((c) => c.code === def.code);
    if (course) ensureSyllabus(course.id, def, ts);
  }
}

/** Ensure checkout products exist for each journey course + ATPL package naming. */
export function ensureCustomerJourneyProducts(): void {
  ensureCustomerJourneyCourses();
  // Read store directly to avoid circular import with course-service → seed.
  const courses = readCoursesDb().courses.filter((c) => !c.deletedAt && c.status === "published");
  const instructorId = primaryInstructorId();
  if (!instructorId) return;
  const ts = nowIso();

  writePaymentsDb((d) => {
    const currency = d.settings.currency;

    for (const def of JOURNEY_COURSES) {
      const course = courses.find((c) => c.code === def.code);
      if (!course) continue;
      const existing = d.products.find((p) => p.metadata?.sku === def.sku);
      if (existing) {
        existing.courseId = course.id;
        existing.name = def.title;
        existing.description = def.short;
        existing.priceAmount = majorToMinor(def.priceMajor, currency);
        existing.compareAtAmount = def.compareAtMajor
          ? majorToMinor(def.compareAtMajor, currency)
          : null;
        existing.active = true;
        existing.instructorId = instructorId;
        existing.updatedAt = ts;
        continue;
      }
      d.products.push({
        id: generateId(),
        name: def.title,
        description: def.short,
        pricingModel: def.pricingModel,
        courseId: course.id,
        instructorId,
        priceAmount: majorToMinor(def.priceMajor, currency),
        compareAtAmount: def.compareAtMajor ? majorToMinor(def.compareAtMajor, currency) : null,
        currency,
        isFree: false,
        active: true,
        metadata: {
          sku: def.sku,
          journey: true,
          supportsInstallments: def.deliveryType === "live" || def.sku.includes("PPL"),
          supportsBnpl: true,
          installmentChoices: [4, 5, 6],
        },
        createdAt: ts,
        updatedAt: ts,
      });
    }

    const atpl = d.products.find((p) => p.metadata?.sku === "ATPL-PACKAGE");
    if (atpl) {
      atpl.name = "ATPL Complete Package";
      atpl.description =
        "Full ATPL theory package (13 subjects · ~230 hours) with full payment, installments (4/5/6), Tamara (UAE), or Tabby (Kuwait).";
      atpl.metadata = {
        ...atpl.metadata,
        sku: "ATPL-PACKAGE",
        journey: true,
        subjectCount: 13,
        hours: 230,
        supportsInstallments: true,
        supportsBnpl: true,
        installmentChoices: [4, 5, 6],
        pendingInstructorAssignment: true,
      };
      atpl.updatedAt = ts;
    }
  });
}

export function getJourneyObjectives(course: Course): string[] {
  const raw = course.metadata?.objectives;
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  return [];
}

export function courseAllowsSequentialLock(course: Course): boolean {
  return course.metadata?.sequentialLock === true || course.deliveryType === "recorded";
}
