/**
 * Communication Center durable store (.data/aep-communication.json).
 * Uses json-file-store so read-only hosts (Vercel) never 500 Server Components.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type {
  Announcement,
  AttachmentRef,
  BlogCategory,
  BlogPost,
  CommentRecord,
  Community,
  CommunityPost,
  Conversation,
  Message,
  ModerationLog,
  ModerationRule,
  SupportTicket,
  TicketReply,
  TypingState,
} from "@/types/communication";

export interface CommunicationDatabase {
  conversations: Conversation[];
  messages: Message[];
  typing: TypingState[];
  communities: Community[];
  posts: CommunityPost[];
  comments: CommentRecord[];
  blogCategories: BlogCategory[];
  blogPosts: BlogPost[];
  announcements: Announcement[];
  tickets: SupportTicket[];
  ticketReplies: TicketReply[];
  attachments: AttachmentRef[];
  moderationRules: ModerationRule[];
  moderationLogs: ModerationLog[];
  seeded: boolean;
}

function dataFile() {
  return path.join(dataDir(), "aep-communication.json");
}

function emptyDb(): CommunicationDatabase {
  return {
    conversations: [],
    messages: [],
    typing: [],
    communities: [],
    posts: [],
    comments: [],
    blogCategories: [],
    blogPosts: [],
    announcements: [],
    tickets: [],
    ticketReplies: [],
    attachments: [],
    moderationRules: [],
    moderationLogs: [],
    seeded: false,
  };
}

function normalizeDb(raw: Partial<CommunicationDatabase>): CommunicationDatabase {
  return {
    ...emptyDb(),
    ...raw,
    conversations: raw.conversations ?? [],
    messages: raw.messages ?? [],
    typing: raw.typing ?? [],
    communities: raw.communities ?? [],
    posts: raw.posts ?? [],
    comments: raw.comments ?? [],
    blogCategories: raw.blogCategories ?? [],
    blogPosts: raw.blogPosts ?? [],
    announcements: raw.announcements ?? [],
    tickets: raw.tickets ?? [],
    ticketReplies: raw.ticketReplies ?? [],
    attachments: raw.attachments ?? [],
    moderationRules: raw.moderationRules ?? [],
    moderationLogs: raw.moderationLogs ?? [],
    seeded: Boolean(raw.seeded),
  };
}

export function ensureCommunicationStore(): CommunicationDatabase {
  const raw = readJsonFile<Partial<CommunicationDatabase>>(dataFile(), emptyDb);
  return normalizeDb(raw);
}

export function readCommunicationDb(): CommunicationDatabase {
  return ensureCommunicationStore();
}

export function writeCommunicationDb(
  mutator: (db: CommunicationDatabase) => void,
): CommunicationDatabase {
  const db = ensureCommunicationStore();
  mutator(db);
  writeJsonFile(dataFile(), db);
  return db;
}
