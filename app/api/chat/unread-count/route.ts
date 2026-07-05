import { requireAuth } from "@/lib/auth/guards";
import { handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { getUnreadMessagesCountFromDb } from "@/lib/repositories/chat.repository";
import { getMockUnreadMessagesCount } from "@/mock/chat.mock";

export async function GET() {
  return handleApiRoute(async () => {
    const user = await requireAuth();
    const count = await withDataFallback(
      () => getUnreadMessagesCountFromDb(user.id),
      () => getMockUnreadMessagesCount(user.id),
      "chat-unread-count-api",
    );
    return jsonSuccess({ count });
  });
}
