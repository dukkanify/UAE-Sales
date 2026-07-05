import { requireAuth } from "@/lib/auth/guards";
import { ApiHttpError, handleApiRoute, jsonCreated } from "@/lib/api/response";
import { enforceApiRateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody, sendChatMessageSchema } from "@/lib/api/validation";
import { withDataFallback } from "@/lib/data/fallback";
import type { SendChatMessageInput } from "@/types";
import { sendChatMessageInDb } from "@/lib/repositories/chat.repository";
import { addMockChatMessage } from "@/mock/chat.mock";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApiRoute(async () => {
    const user = await requireAuth();
    await enforceApiRateLimit(request, {
      scope: "chat-message",
      limit: 30,
      windowMs: 60_000,
      identifier: user.id,
    });

    const { id } = await context.params;
    const body = await parseJsonBody(request, sendChatMessageSchema);
    const payload: SendChatMessageInput = {
      text: body.text ?? "",
      ...(body.imageUrl ? { imageUrl: body.imageUrl } : {}),
    };

    const message = await withDataFallback(
      () => sendChatMessageInDb(id, user.id, payload),
      () =>
        addMockChatMessage(
          id,
          payload,
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
