/**
 * Communication Center durable store (.data/aep-communication.json).
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-communication.json");

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

export function ensureCommunicationStore(): CommunicationDatabase {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Partial<CommunicationDatabase>;
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
  } catch {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

export function readCommunicationDb(): CommunicationDatabase {
  return ensureCommunicationStore();
}

export function writeCommunicationDb(
  mutator: (db: CommunicationDatabase) => void,
): CommunicationDatabase {
  const db = ensureCommunicationStore();
  mutator(db);
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  return db;
}
