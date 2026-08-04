/**
 * Course LMS durable store (.data/aep-courses.json).
 * Production maps to SQL tables in migration 005.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-courses.json");

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

export function ensureCoursesStore(): CoursesDatabase {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DATA_FILE)) {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as CoursesDatabase;
    return {
      categories: raw.categories ?? [],
      courses: raw.courses ?? [],
      modules: raw.modules ?? [],
      lessons: raw.lessons ?? [],
      resources: raw.resources ?? [],
      instructors: raw.instructors ?? [],
      enrollments: raw.enrollments ?? [],
      progress: raw.progress ?? [],
      seeded: Boolean(raw.seeded),
    };
  } catch {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

export function readCoursesDb(): CoursesDatabase {
  return ensureCoursesStore();
}

export function writeCoursesDb(mutator: (db: CoursesDatabase) => void): CoursesDatabase {
  const db = ensureCoursesStore();
  mutator(db);
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  return db;
}

export function replaceCoursesDb(db: CoursesDatabase): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}
