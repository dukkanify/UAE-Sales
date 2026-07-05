import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonCreated } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { sendChatMessageInDb } from "@/lib/repositories/chat.repository";
import { addMockChatMessage } from "@/mock/chat.mock";
import type { SendChatMessageInput } from "@/types/domain/chat";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    const user = await requireAuth();
    const { id } = await context.params;
    const body = (await request.json()) as SendChatMessageInput;

    if (!body.text?.trim() && !body.imageUrl) {
      throw new ApiHttpError(400, "VALIDATION_ERROR", "نص الرسالة مطلوب.");
    }

    const message = await withDataFallback(
      () => sendChatMessageInDb(id, user.id, body),
      () =>
        addMockChatMessage(
          id,
          body,
          user.id,
          user.fullName,
        ),
      "chat-send-message",
    );

    if (!message) {
      throw new ApiHttpError(404, "NOT_FOUND", "المحادثة غير موجودة.");
    }

    return jsonCreated(message);
  });
}
