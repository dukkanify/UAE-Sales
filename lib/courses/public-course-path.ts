/**
 * Stable public identifiers for marketing course URLs.
 * Prefer course codes over random UUIDs so CDN-cached catalogs
 * still resolve after ephemeral .data reseeds on serverless.
 */

export function stableCourseId(code: string): string {
  const slug = code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug ? `course-${slug}` : "";
}

/** Path segment for /courses/[ref] — code when present, else id. */
export function publicCourseRef(course: { id: string; code?: string | null }): string {
  const code = course.code?.trim();
  if (code) return code;
  return course.id;
}

export function publicCourseHref(course: { id: string; code?: string | null }): string {
  return `/courses/${encodeURIComponent(publicCourseRef(course))}`;
}
