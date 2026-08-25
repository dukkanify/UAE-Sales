/**
 * Communication Center types — messaging, community, blog, support, announcements.
 */

export type ConversationKind =
  | "direct"
  | "support"
  | "course_group"
  | "class_group"
  | "study_group"
  | "instructor_group"
  | "admin_group";

export type MessageDeliveryStatus = "sending" | "sent" | "delivered" | "read" | "failed";

/** Training share payloads inside chat */
export type MessageShareKind =
  | "text"
  | "homework"
  | "lesson_notes"
  | "study_material"
  | "pdf_manual"
  | "flight_document"
  | "performance_report"
  | "instructor_feedback"
  | "mock_exam_file"
  | "certificate"
  | "system";

export type MessageReactionEmoji = "👍" | "❤️" | "✅" | "👀" | "🎉";

export interface MessageReaction {
  emoji: MessageReactionEmoji;
  userId: string;
  userName: string;
  createdAt: string;
}

export type CommunityKind = "course" | "subject" | "batch" | "instructor" | "general";

export type PostVisibility = "public" | "members" | "announcement";

export type BlogPostStatus = "draft" | "scheduled" | "published" | "archived";

export type TicketType = "technical" | "course" | "payment" | "general" | "account" | "bug";

export type TicketStatus =
  "open" | "in_progress" | "waiting_customer" | "escalated" | "resolved" | "closed";

export type AnnouncementTarget = "platform" | "course" | "group" | "instructor" | "student";

export type ModerationAction = "allow" | "block" | "flag" | "redact";

export type ModerationRuleKind =
  | "profanity"
  | "hate"
  | "phone"
  | "email"
  | "external_contact"
  | "spam_link"
  | "spam_repeat"
  | "suspicious";

export interface AttachmentRef {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  uploadedById: string;
  createdAt: string;
}

export interface ConversationParticipant {
  userId: string;
  role: "member" | "admin" | "owner";
  joinedAt: string;
  lastReadAt: string | null;
  muted: boolean;
  archived: boolean;
}

export interface Conversation {
  id: string;
  kind: ConversationKind;
  title: string;
  courseId: string | null;
  classId: string | null;
  createdById: string;
  participantIds: string[];
  participants: ConversationParticipant[];
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  body: string;
  attachments: AttachmentRef[];
  deliveryStatus: MessageDeliveryStatus;
  shareKind: MessageShareKind;
  replyToId: string | null;
  replyPreview: string | null;
  reactions: MessageReaction[];
  pinned: boolean;
  moderated: boolean;
  moderationFlags: string[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PresenceState {
  userId: string;
  status: "online" | "offline";
  lastSeenAt: string;
}

export interface TypingState {
  conversationId: string;
  userId: string;
  userName: string;
  expiresAt: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  kind: CommunityKind;
  courseId: string | null;
  instructorId: string | null;
  subject: string | null;
  batchLabel: string | null;
  memberIds: string[];
  moderatorIds: string[];
  coverUrl: string | null;
  isArchived: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  visibility: PostVisibility;
  pinned: boolean;
  isAnnouncement: boolean;
  attachments: AttachmentRef[];
  likeCount: number;
  commentCount: number;
  moderated: boolean;
  moderationFlags: string[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentRecord {
  id: string;
  targetType: "community_post" | "blog_post";
  targetId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  body: string;
  moderated: boolean;
  moderationFlags: string[];
  status: "visible" | "pending" | "hidden";
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  featuredImageUrl: string | null;
  categoryId: string | null;
  tags: string[];
  status: BlogPostStatus;
  authorId: string;
  authorName: string;
  seoTitle: string | null;
  seoDescription: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  commentCount: number;
  relatedIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  bodyHtml: string;
  target: AnnouncementTarget;
  targetId: string | null;
  authorId: string;
  authorName: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  status: "draft" | "scheduled" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  type: TicketType;
  subject: string;
  description: string;
  status: TicketStatus;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  assigneeId: string | null;
  assigneeName: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  attachments: AttachmentRef[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketReply {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  body: string;
  isStaff: boolean;
  /** Staff-only note — never shown to requester */
  isInternal: boolean;
  attachments: AttachmentRef[];
  createdAt: string;
}

export interface ModerationRule {
  id: string;
  kind: ModerationRuleKind;
  enabled: boolean;
  pattern: string;
  action: ModerationAction;
  description: string;
  updatedAt: string;
}

export interface ModerationLog {
  id: string;
  ruleId: string | null;
  ruleKind: ModerationRuleKind | "manual";
  action: ModerationAction;
  contentType: "message" | "post" | "comment" | "ticket" | "announcement";
  contentId: string;
  actorId: string | null;
  snippet: string;
  createdAt: string;
}

export interface SearchHit {
  type: "message" | "post" | "comment" | "announcement" | "ticket" | "user" | "community" | "blog";
  id: string;
  title: string;
  snippet: string;
  href: string;
}

export interface ModerationResult {
  allowed: boolean;
  action: ModerationAction;
  flags: string[];
  redactedBody?: string;
}
