import { withApiHandler } from "@/lib/api/with-handler";
import { ok } from "@/lib/api/envelope";
import { requireApiUser } from "@/lib/api/auth";

/** Calendar feed — wraps class listing for mobile calendar views. */
export const GET = withApiHandler(async (request) => {
  await requireApiUser(request);
  const { listLiveClasses } = await import("@/services/classes/class-service");
  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;
  const result = listLiveClasses({ from, to, pageSize: 100, status: "all" });
  return ok({
    events: result.data.map((c) => ({
      id: c.id,
      title: c.title,
      startAt: c.startsAt,
      endAt: c.endsAt,
      status: c.status,
      courseId: c.courseId,
    })),
  });
});
