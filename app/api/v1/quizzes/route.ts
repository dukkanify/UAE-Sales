import { withApiHandler } from "@/lib/api/with-handler";
import { ok } from "@/lib/api/envelope";
import { requireApiUser } from "@/lib/api/auth";
import { ROLES } from "@/constants/roles";
import {
  listPublishedQuizzesForStudent,
  listQuizzes,
} from "@/services/quizzes/quiz-service";
import { ensureQuizzesSeeded } from "@/services/quizzes/seed";

export const GET = withApiHandler(async (request) => {
  const ctx = await requireApiUser(request);
  ensureQuizzesSeeded();
  if (ctx.user.role === ROLES.STUDENT) {
    return ok(listPublishedQuizzesForStudent(ctx.user.id));
  }
  const url = new URL(request.url);
  return ok(
    listQuizzes({
      q: url.searchParams.get("q") ?? undefined,
      page: Number(url.searchParams.get("page") ?? 1),
      pageSize: Number(url.searchParams.get("pageSize") ?? 20),
    }),
  );
});
