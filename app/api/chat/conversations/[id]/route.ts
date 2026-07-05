import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { getChatConversationFromDb } from "@/lib/repositories/chat.repository";
import { getMockChatConversationById } from "@/mock/chat.mock";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    const user = await requireAuth();
    const { id } = await context.params;

    const conversation = await withDataFallback(
      () => getChatConversationFromDb(id, user.id),
      () => getMockChatConversationById(id, user.id),
      "chat-conversation-api",
    );

    if (!conversation) {
      throw new ApiHttpError(404, "NOT_FOUND", "المحادثة غير موجودة.");
    }

    return jsonSuccess(conversation);
  });
}
