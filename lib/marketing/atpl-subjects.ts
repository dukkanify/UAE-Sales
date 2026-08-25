/**
 * Public ATPL subject modules for marketing pages.
 * Reads from the live course store — ATPL theory codes only.
 */

import { listCourses } from "@/services/courses/course-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";

const ATPL_CODE_PREFIX = "ATPL-";

export type AtplSubjectModule = {
  code: string;
  title: string;
  shortDescription: string;
};

/** ATPL theory subjects configured in the platform (excludes PPL and journey SKUs). */
export function listAtplSubjectModules(): AtplSubjectModule[] {
  try {
    ensureCoursesSeeded();
    const { data } = listCourses({ pageSize: 100, status: "published" });
    return data
      .filter((c) => c.code.startsWith(ATPL_CODE_PREFIX))
      .sort((a, b) => a.code.localeCompare(b.code))
      .map((c) => ({
        code: c.code,
        title: c.title.replace(/^ATPL \d+ — /, ""),
        shortDescription:
          c.shortDescription || c.fullDescription.slice(0, 120).replace(/\s+\S*$/, "") + "…",
      }));
  } catch (error) {
    console.error("[atpl-subjects]", error);
    return FALLBACK_SUBJECTS;
  }
}

const FALLBACK_SUBJECTS: AtplSubjectModule[] = [
  {
    code: "ATPL-010",
    title: "Air Law",
    shortDescription: "ICAO framework, licensing rules, and aviation regulations.",
  },
  {
    code: "ATPL-031",
    title: "Mass & Balance",
    shortDescription: "Aircraft mass definitions, limits, and loading documentation.",
  },
  {
    code: "ATPL-050",
    title: "Meteorology",
    shortDescription: "Atmospheric science for flight planning and operations.",
  },
  {
    code: "ATPL-061",
    title: "General Navigation",
    shortDescription: "Charts, DR navigation, and flight planning fundamentals.",
  },
  {
    code: "ATPL-062",
    title: "Radio Navigation",
    shortDescription: "NDB, VOR, ILS, GNSS, and radio aid operations.",
  },
  {
    code: "ATPL-070",
    title: "Operational Procedures",
    shortDescription: "Airline operations, emergencies, and multi-crew procedures.",
  },
  {
    code: "ATPL-081",
    title: "Principles of Flight",
    shortDescription: "Aerodynamics, stability, and high-performance aircraft theory.",
  },
];
