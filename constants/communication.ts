/**
 * Communication Center constants — labels, limits, defaults.
 */

import type {
  AnnouncementTarget,
  BlogPostStatus,
  CommunityKind,
  ConversationKind,
  TicketStatus,
  TicketType,
} from "@/types/communication";

export const CONVERSATION_KIND_LABELS: Record<ConversationKind, string> = {
  direct: "Direct message",
  course_group: "Course group",
  class_group: "Class group",
  study_group: "Study group",
  instructor_group: "Instructor group",
  admin_group: "Administrative group",
};

export const COMMUNITY_KIND_LABELS: Record<CommunityKind, string> = {
  course: "Course",
  subject: "Subject",
  batch: "Batch",
  instructor: "Instructor",
  general: "General",
};

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  technical: "Technical issue",
  course: "Course issue",
  payment: "Payment issue",
  general: "General inquiry",
  account: "Account issue",
  bug: "Bug report",
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting_customer: "Waiting for customer",
  resolved: "Resolved",
  closed: "Closed",
};

export const BLOG_STATUS_LABELS: Record<BlogPostStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

export const ANNOUNCEMENT_TARGET_LABELS: Record<AnnouncementTarget, string> = {
  platform: "Entire platform",
  course: "Specific course",
  group: "Specific group",
  instructor: "Specific instructor",
  student: "Specific student",
};

export const COMM_ATTACHMENT_MIME_ALLOW = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
]);

export const DEFAULT_BLOCKED_WORDS = [
  "idiot",
  "stupid",
  "hateyou",
  "kill yourself",
  "dumbass",
  "bastard",
];

export const COMM_PAGE_SIZE = 30;
export const TYPING_TTL_MS = 4000;
export const MESSAGE_POLL_MS = 2500;
