import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { markChatConversationReadInDb } from "@/lib/repositories/chat.repository";
import { markMockConversationRead } from "@/mock/chat.mock";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    const user = await requireAuth();
    const { id } = await context.params;

    const conversation = await withDataFallback(
      () => markChatConversationReadInDb(id, user.id),
      () => markMockConversationRead(id, user.id),
      "chat-mark-read",
    );

    if (!conversation) {
      throw new ApiHttpError(404, "NOT_FOUND", "المحادثة غير موجودة.");
    }

    return jsonSuccess(conversation);
  });
}
