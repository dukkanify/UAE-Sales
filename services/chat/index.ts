export {
  addMessageToConversation,
  findConversationForListing,
  getChatConversationById,
  getChatConversations,
  getChatThreads,
  getUnreadChatCount,
  markConversationRead,
  openListingConversation,
  resolveOrCreateConversation,
} from "./chat.service";

export type { ChatConversation, ChatMessage } from "./chat.service";
