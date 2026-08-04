import { withApiHandler } from "@/lib/api/with-handler";
import { ok } from "@/lib/api/envelope";
import { requireApiUser } from "@/lib/api/auth";

export const GET = withApiHandler(async (request) => {
  await requireApiUser(request);
  return ok({
    view: "bootstrap",
    features: ["chat", "recommendations", "study_planner"],
    note: "Full AI via /api/ai/*; mobile clients should use Bearer auth on those routes or this adapter",
  });
});
