/** Fire-and-forget chat email. Failures never block the in-app conversation. */
export function notifyChatEmail(input: {
  conversationId: string;
  listingTitle: string;
  preview: string;
  recipientUserId: string;
  senderName: string;
}): void {
  if (!input.recipientUserId || !input.preview.trim()) return;

  void fetch("/api/chat/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversationId: input.conversationId,
      listingTitle: input.listingTitle,
      preview: input.preview.trim().slice(0, 180),
      recipientUserId: input.recipientUserId,
      senderName: input.senderName,
    }),
  }).catch(() => undefined);
}
