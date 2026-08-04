import { withApiHandler } from "@/lib/api/with-handler";
import { ok } from "@/lib/api/envelope";
import { requireApiUser } from "@/lib/api/auth";

/** Lessons adapter — mobile clients load course curriculum via courses/[id] domain APIs. */
export const GET = withApiHandler(async (request) => {
  await requireApiUser(request);
  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId");
  return ok({
    courseId,
    lessons: [],
    note: "Use /api/courses/[id] curriculum endpoints; v1 lessons list is a mobile-ready stub keyed by courseId",
  });
});
