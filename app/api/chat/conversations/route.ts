import { requireAuth } from "@/lib/auth/guards";
import { handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { getChatConversationsFromDb } from "@/lib/repositories/chat.repository";
import { getMockChatConversations } from "@/mock/chat.mock";

export async function GET() {
  return handleApiRoute(async () => {
    const user = await requireAuth();
    const conversations = await withDataFallback(
      () => getChatConversationsFromDb(user.id),
      () => getMockChatConversations(user.id),
      "chat-conversations-api",
    );
    return jsonSuccess(conversations);
  });
}
