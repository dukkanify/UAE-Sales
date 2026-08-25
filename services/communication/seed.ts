/**
 * Seed demo conversations, communities, blog, announcements, tickets.
 */

import { generateId } from "@/lib/security/crypto";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { listCourses } from "@/services/courses/course-service";
import { ensureDefaultModerationRules } from "@/services/communication/moderation-service";
import { readCommunicationDb, writeCommunicationDb } from "@/services/communication/store";
import type {
  Announcement,
  BlogCategory,
  BlogPost,
  Community,
  CommunityPost,
  Conversation,
  Message,
  SupportTicket,
} from "@/types/communication";

export function ensureCommunicationSeeded(): void {
  ensureDemoUsersSeeded();
  ensureCoursesSeeded();
  ensureDefaultModerationRules();

  const db = readCommunicationDb();
  if (db.seeded && db.communities.length > 0) return;

  const users = readAuthDb().users;
  const student = users.find((u) => u.role === ROLES.STUDENT && u.status === "active");
  const instructor = users.find((u) => u.role === ROLES.INSTRUCTOR);
  const admin = users.find((u) => u.role === ROLES.ADMIN);
  const course = listCourses({ pageSize: 5, status: "published" }).data[0];
  if (!student || !instructor || !admin) {
    writeCommunicationDb((d) => {
      d.seeded = true;
    });
    return;
  }

  const stamp = new Date().toISOString();
  const studentP = toUserProfile(student);
  const instructorP = toUserProfile(instructor);
  const adminP = toUserProfile(admin);

  const conversation: Conversation = {
    id: generateId(),
    kind: "direct",
    title: instructorP.fullName || instructor.email,
    courseId: null,
    classId: null,
    createdById: student.id,
    participantIds: [student.id, instructor.id],
    participants: [
      {
        userId: student.id,
        role: "owner",
        joinedAt: stamp,
        lastReadAt: stamp,
        muted: false,
        archived: false,
      },
      {
        userId: instructor.id,
        role: "member",
        joinedAt: stamp,
        lastReadAt: null,
        muted: false,
        archived: false,
      },
    ],
    lastMessageAt: stamp,
    lastMessagePreview: "Could you clarify the NOTAM interpretation question?",
    deletedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };

  const messages: Message[] = [
    {
      id: generateId(),
      conversationId: conversation.id,
      senderId: student.id,
      senderName: studentP.fullName || student.email,
      body: "Could you clarify the NOTAM interpretation question from yesterday's live class?",
      attachments: [],
      deliveryStatus: "delivered",
      shareKind: "text",
      replyToId: null,
      replyPreview: null,
      reactions: [],
      pinned: false,
      moderated: false,
      moderationFlags: [],
      deletedAt: null,
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: generateId(),
      conversationId: conversation.id,
      senderId: instructor.id,
      senderName: instructorP.fullName || instructor.email,
      body: "Absolutely — focus on the Q-code and validity period first. I pinned a summary in the course community.",
      attachments: [],
      deliveryStatus: "delivered",
      shareKind: "lesson_notes",
      replyToId: null,
      replyPreview: null,
      reactions: [],
      pinned: true,
      moderated: false,
      moderationFlags: [],
      deletedAt: null,
      createdAt: new Date(Date.now() + 1000).toISOString(),
      updatedAt: new Date(Date.now() + 1000).toISOString(),
    },
  ];

  const community: Community = {
    id: generateId(),
    name: course ? `${course.title} Community` : "ATPL Study Circle",
    slug: "atpl-air-law-community",
    description: "Discuss course topics, share notes, and ask peers.",
    kind: "course",
    courseId: course?.id ?? null,
    instructorId: instructor.id,
    subject: "Air Law",
    batchLabel: "2026-A",
    memberIds: [student.id, instructor.id],
    moderatorIds: [instructor.id, admin.id],
    coverUrl: null,
    isArchived: false,
    createdById: instructor.id,
    createdAt: stamp,
    updatedAt: stamp,
  };

  const general: Community = {
    id: generateId(),
    name: "AviatorPass Lounge",
    slug: "aviatorpass-lounge",
    description: "General aviation learning community for all enrolled students.",
    kind: "general",
    courseId: null,
    instructorId: null,
    subject: null,
    batchLabel: null,
    memberIds: users
      .filter((u) => u.role === ROLES.STUDENT || u.role === ROLES.INSTRUCTOR)
      .map((u) => u.id),
    moderatorIds: [admin.id],
    coverUrl: null,
    isArchived: false,
    createdById: admin.id,
    createdAt: stamp,
    updatedAt: stamp,
  };

  const post: CommunityPost = {
    id: generateId(),
    communityId: community.id,
    authorId: instructor.id,
    authorName: instructorP.fullName || instructor.email,
    title: "NOTAM decoding checklist",
    body: "Pinned resource: decode Q-codes, validity, and geographic scope before answering exam items.",
    visibility: "announcement",
    pinned: true,
    isAnnouncement: true,
    attachments: [],
    likeCount: 3,
    commentCount: 0,
    moderated: false,
    moderationFlags: [],
    deletedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };

  const category: BlogCategory = {
    id: generateId(),
    name: "Flight Training",
    slug: "flight-training",
  };

  const blog: BlogPost = {
    id: generateId(),
    title: "How to prepare for ATPL Air Law",
    slug: "prepare-atpl-air-law",
    excerpt: "A practical study plan for mastering ICAO annexes and national regulations.",
    bodyHtml:
      "<p>Air Law rewards consistent revision. Start with Annex 1 and Annex 2, then map local AIP differences.</p><p>Use community discussions to stress-test edge cases.</p>",
    featuredImageUrl: "/images/hero-aviation.svg",
    categoryId: category.id,
    tags: ["atpl", "air-law", "study-tips"],
    status: "published",
    authorId: admin.id,
    authorName: adminP.fullName || admin.email,
    seoTitle: "ATPL Air Law Study Plan | AviatorPass",
    seoDescription: "Enterprise study guidance for ATPL Air Law candidates.",
    scheduledAt: null,
    publishedAt: stamp,
    commentCount: 0,
    relatedIds: [],
    createdAt: stamp,
    updatedAt: stamp,
  };

  const announcement: Announcement = {
    id: generateId(),
    title: "Welcome to the AviatorPass Communication Center",
    bodyHtml:
      "<p>Messaging, communities, announcements, and support tickets are now live inside the platform.</p>",
    target: "platform",
    targetId: null,
    authorId: admin.id,
    authorName: adminP.fullName || admin.email,
    scheduledAt: null,
    publishedAt: stamp,
    status: "published",
    createdAt: stamp,
    updatedAt: stamp,
  };

  const ticket: SupportTicket = {
    id: generateId(),
    ticketNumber: `SUP-${new Date().getFullYear()}-0001`,
    type: "technical",
    subject: "Cannot open live class recording",
    description: "The recording link from last week's Mass & Balance session returns an error.",
    status: "open",
    requesterId: student.id,
    requesterName: studentP.fullName || student.email,
    requesterRole: student.role,
    assigneeId: admin.id,
    assigneeName: adminP.fullName || admin.email,
    firstResponseAt: null,
    resolvedAt: null,
    closedAt: null,
    attachments: [],
    createdAt: stamp,
    updatedAt: stamp,
  };

  writeCommunicationDb((d) => {
    d.conversations = [conversation];
    d.messages = messages;
    d.communities = [community, general];
    d.posts = [post];
    d.blogCategories = [category];
    d.blogPosts = [blog];
    d.announcements = [announcement];
    d.tickets = [ticket];
    d.ticketReplies = [];
    d.seeded = true;
  });
}
