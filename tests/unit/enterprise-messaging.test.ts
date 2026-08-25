/**
 * Enterprise internal messaging — peer matrix, moderation, support chat, delete window.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { MESSAGE_DELETE_WINDOW_MS } from "@/constants/communication";
import { ROLES } from "@/constants/roles";
import { clearJsonFileCache } from "@/lib/data/json-file-store";
import { assertCanMessagePeer, CommunicationError } from "@/services/communication/access";
import {
  deleteOwnMessage,
  getOrCreateSupportConversation,
  markConversationRead,
  sendMessage,
  startDirectConversation,
} from "@/services/communication/messaging-service";
import {
  ensureDefaultModerationRules,
  moderateText,
} from "@/services/communication/moderation-service";
import { writeCommunicationDb } from "@/services/communication/store";
import { readAuthDb, toUserProfile, writeAuthDb } from "@/services/auth/store";
import type { UserProfile } from "@/types";

function profile(role: UserProfile["role"], id: string): UserProfile {
  return {
    id,
    email: `${id}@example.com`,
    firstName: "Test",
    lastName: role,
    fullName: `Test ${role}`,
    phone: null,
    countryCode: null,
    nationality: null,
    dateOfBirth: null,
    gender: null,
    city: null,
    bio: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    avatarUrl: null,
    timezone: "UTC",
    language: "en",
    role,
    status: "active",
    emailVerified: true,
    profileComplete: true,
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("enterprise messaging peer matrix", () => {
  it("blocks student → student", () => {
    expect(() => assertCanMessagePeer(profile(ROLES.STUDENT, "s1"), ROLES.STUDENT)).toThrow(
      CommunicationError,
    );
  });

  it("allows student → instructor / admin / CGI", () => {
    expect(() =>
      assertCanMessagePeer(profile(ROLES.STUDENT, "s1"), ROLES.INSTRUCTOR),
    ).not.toThrow();
    expect(() => assertCanMessagePeer(profile(ROLES.STUDENT, "s1"), ROLES.ADMIN)).not.toThrow();
    expect(() =>
      assertCanMessagePeer(profile(ROLES.STUDENT, "s1"), ROLES.CHIEF_GROUND_INSTRUCTOR),
    ).not.toThrow();
  });

  it("blocks instructor → instructor", () => {
    expect(() => assertCanMessagePeer(profile(ROLES.INSTRUCTOR, "i1"), ROLES.INSTRUCTOR)).toThrow(
      CommunicationError,
    );
  });

  it("allows instructor → student / CGI / admin", () => {
    expect(() =>
      assertCanMessagePeer(profile(ROLES.INSTRUCTOR, "i1"), ROLES.STUDENT),
    ).not.toThrow();
    expect(() =>
      assertCanMessagePeer(profile(ROLES.INSTRUCTOR, "i1"), ROLES.CHIEF_GROUND_INSTRUCTOR),
    ).not.toThrow();
    expect(() => assertCanMessagePeer(profile(ROLES.INSTRUCTOR, "i1"), ROLES.ADMIN)).not.toThrow();
  });

  it("allows CGI → instructors and students", () => {
    expect(() =>
      assertCanMessagePeer(profile(ROLES.CHIEF_GROUND_INSTRUCTOR, "cgi1"), ROLES.INSTRUCTOR),
    ).not.toThrow();
    expect(() =>
      assertCanMessagePeer(profile(ROLES.CHIEF_GROUND_INSTRUCTOR, "cgi1"), ROLES.STUDENT),
    ).not.toThrow();
  });

  it("allows admin / super_admin → everyone", () => {
    expect(() => assertCanMessagePeer(profile(ROLES.ADMIN, "a1"), ROLES.STUDENT)).not.toThrow();
    expect(() =>
      assertCanMessagePeer(profile(ROLES.SUPER_ADMIN, "sa1"), ROLES.INSTRUCTOR),
    ).not.toThrow();
  });
});

describe("enterprise messaging moderation", () => {
  beforeEach(() => {
    writeCommunicationDb((db) => {
      db.moderationRules = [];
      db.moderationLogs = [];
    });
    clearJsonFileCache();
    ensureDefaultModerationRules();
  });

  afterEach(() => {
    clearJsonFileCache();
  });

  it("blocks profanity", () => {
    const result = moderateText("you are an idiot", {
      contentType: "message",
      contentId: "m1",
      actorId: "u1",
    });
    expect(result.allowed).toBe(false);
    expect(result.flags).toContain("profanity");
  });

  it("blocks phone numbers", () => {
    const result = moderateText("Call me at +971 50 123 4567", {
      contentType: "message",
      contentId: "m2",
      actorId: "u1",
    });
    expect(result.allowed).toBe(false);
    expect(result.flags).toContain("phone");
  });

  it("blocks WhatsApp / Telegram redirects", () => {
    const result = moderateText("Message me on WhatsApp instead", {
      contentType: "message",
      contentId: "m3",
      actorId: "u1",
    });
    expect(result.allowed).toBe(false);
    expect(result.flags).toContain("external_contact");
  });
});

describe("enterprise messaging flows", () => {
  let student: UserProfile;
  let instructor: UserProfile;
  let admin: UserProfile;

  beforeEach(() => {
    const auth = readAuthDb();
    const s =
      auth.users.find((u) => u.role === ROLES.STUDENT && u.status === "active") ??
      auth.users.find((u) => u.role === ROLES.STUDENT);
    const i =
      auth.users.find((u) => u.role === ROLES.INSTRUCTOR && u.status === "active") ??
      auth.users.find((u) => u.role === ROLES.INSTRUCTOR);
    const a =
      auth.users.find((u) => u.role === ROLES.ADMIN && u.status === "active") ??
      auth.users.find((u) => u.role === ROLES.ADMIN);
    if (!s || !i || !a) throw new Error("Seed users required for messaging tests");
    student = toUserProfile(s);
    instructor = toUserProfile(i);
    admin = toUserProfile(a);

    writeCommunicationDb((db) => {
      db.conversations = [];
      db.messages = [];
      db.typing = [];
      db.presence = [];
      db.moderationRules = [];
      db.moderationLogs = [];
      db.seeded = true;
    });
    clearJsonFileCache();
    ensureDefaultModerationRules();
  });

  afterEach(() => {
    writeAuthDb((db) => {
      db.notifications = db.notifications.filter(
        (n) => !String(n.type).startsWith("message.") && n.type !== "ticket.reply",
      );
    });
    clearJsonFileCache();
  });

  it("creates a persistent support conversation for a student", async () => {
    const first = await getOrCreateSupportConversation(student);
    const second = await getOrCreateSupportConversation(student);
    expect(first.kind).toBe("support");
    expect(first.id).toBe(second.id);
    expect(first.participantIds).toContain(student.id);
    expect(first.participantIds).toContain(admin.id);
  });

  it("sends instructor → student messages with delivered status and read receipts", async () => {
    const conv = await startDirectConversation({
      user: instructor,
      peerUserId: student.id,
    });
    const msg = await sendMessage({
      user: instructor,
      conversationId: conv.id,
      body: "Homework for Air Law is uploaded.",
      shareKind: "homework",
    });
    expect(msg.deliveryStatus).toBe("delivered");
    expect(msg.shareKind).toBe("homework");

    markConversationRead(student, conv.id);
    const { readCommunicationDb } = await import("@/services/communication/store");
    const updated = readCommunicationDb().messages.find((m) => m.id === msg.id);
    expect(updated?.deliveryStatus).toBe("read");
  });

  it("rejects moderated send attempts", async () => {
    const conv = await startDirectConversation({
      user: student,
      peerUserId: instructor.id,
    });
    await expect(
      sendMessage({
        user: student,
        conversationId: conv.id,
        body: "Call me +971501234567 on WhatsApp",
      }),
    ).rejects.toBeInstanceOf(CommunicationError);
  });

  it("enforces delete-own window", async () => {
    const conv = await startDirectConversation({
      user: instructor,
      peerUserId: student.id,
    });
    const msg = await sendMessage({
      user: instructor,
      conversationId: conv.id,
      body: "Temporary note",
    });

    writeCommunicationDb((db) => {
      const row = db.messages.find((m) => m.id === msg.id);
      if (row) {
        row.createdAt = new Date(Date.now() - MESSAGE_DELETE_WINDOW_MS - 1000).toISOString();
      }
    });

    expect(() => deleteOwnMessage(instructor, msg.id)).toThrow(/Delete window expired/);
  });
});
