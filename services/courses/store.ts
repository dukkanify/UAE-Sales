/**
 * Course LMS durable store (.data/aep-courses.json).
 * Production maps to SQL tables in migration 005.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type {
  Course,
  CourseCategory,
  CourseInstructorAssignment,
  CourseModule,
  Enrollment,
  Lesson,
  LessonProgress,
  LessonResource,
} from "@/types/courses";

export interface CoursesDatabase {
  categories: CourseCategory[];
  courses: Course[];
  modules: CourseModule[];
  lessons: Lesson[];
  resources: LessonResource[];
  instructors: CourseInstructorAssignment[];
  enrollments: Enrollment[];
  progress: LessonProgress[];
  seeded: boolean;
}

const DATA_FILE = path.join(dataDir(), "aep-courses.json");

function emptyDb(): CoursesDatabase {
  return {
    categories: [],
    courses: [],
    modules: [],
    lessons: [],
    resources: [],
    instructors: [],
    enrollments: [],
    progress: [],
    seeded: false,
  };
}

function normalizeCourse(course: Course): Course {
  const deliveryType =
    course.deliveryType === "live" || course.deliveryType === "recorded"
      ? course.deliveryType
      : "recorded";
  const enrollmentOpen =
    typeof course.enrollmentOpen === "boolean"
      ? course.enrollmentOpen
      : course.enrollmentMode === "open";
  return {
    ...course,
    deliveryType,
    enrollmentOpen,
    hidden: Boolean(course.hidden),
  };
}

function normalize(raw: Partial<CoursesDatabase> | null | undefined): CoursesDatabase {
  return {
    categories: raw?.categories ?? [],
    courses: (raw?.courses ?? []).map((c) => normalizeCourse(c as Course)),
    modules: raw?.modules ?? [],
    lessons: raw?.lessons ?? [],
    resources: raw?.resources ?? [],
    instructors: raw?.instructors ?? [],
    enrollments: raw?.enrollments ?? [],
    progress: raw?.progress ?? [],
    seeded: Boolean(raw?.seeded),
  };
}

export function ensureCoursesStore(): CoursesDatabase {
  return normalize(readJsonFile<Partial<CoursesDatabase>>(DATA_FILE, emptyDb));
}

export function readCoursesDb(): CoursesDatabase {
  return ensureCoursesStore();
}

export function writeCoursesDb(mutator: (db: CoursesDatabase) => void): CoursesDatabase {
  const db = ensureCoursesStore();
  mutator(db);
  writeJsonFile(DATA_FILE, db);
  return db;
}

export function replaceCoursesDb(db: CoursesDatabase): void {
  writeJsonFile(DATA_FILE, db);
}
