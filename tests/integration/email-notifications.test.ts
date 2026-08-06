/**
 * Email notification pipeline — OTP + test mail land in durable outbox
 * when SMTP is not configured (local/CI/staging).
 */

import { beforeAll, describe, expect, it } from "vitest";

import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { findUserByEmail } from "@/services/auth/store";
import { requestOtp } from "@/services/auth/auth-service";
import { processDueReminders } from "@/services/classes/reminder-service";
import { writeClassesDb } from "@/services/classes/store";
import { getLatestOutboundTo, listOutboundEmails } from "@/services/email/outbox";
import { sendEmail } from "@/services/email/mailer";
import { generateId } from "@/lib/security/crypto";
import { testEmailTemplate } from "@/services/settings/email-templates";
import { patchStoredSettings } from "@/services/settings/store";
import type { LiveClass, ReminderQueueItem } from "@/types/classes";

describe("email notifications", () => {
  beforeAll(() => {
    process.env.ENABLE_DEMO_OTP = "true";
    process.env.FORCE_DEMO_OTP = "true";
    process.env.DEMO_OTP_CODE = "123456";
    process.env.NEXT_PUBLIC_APP_ENV = "development";
    ensureDemoUsersSeeded();
    // Ensure SMTP is empty so we exercise the outbox path deterministically
    patchStoredSettings(
      {
        email: {
          provider: "smtp",
          smtpHost: "",
          smtpPort: 587,
          smtpUsername: "",
          smtpPassword: "",
          encryption: "tls",
          senderName: "AviatorPass",
          senderEmail: "noreply@aviatorpass.test",
          replyToEmail: "support@aviatorpass.test",
        },
        notifications: {
          emailNotifications: true,
          inAppNotifications: true,
          reminderEmails: true,
          marketingEmails: false,
          systemAlerts: true,
          classReminderOffsetsMinutes: [1440, 120],
          classReminderFifteenMinutesEnabled: true,
        },
      },
      null,
    );
  });

  it("records OTP email in the outbox on login request", async () => {
    const email = "student.one@eagerpilots.com";
    const beforeIds = new Set(listOutboundEmails(100).map((m) => m.id));
    const req = await requestOtp({ email, purpose: "login", rememberMe: true });
    expect(req.success).toBe(true);
    expect(req.data?.emailDelivery).toBe("outbox");
    expect(req.data?.demoOtp).toBe("123456");

    const latest = getLatestOutboundTo(email);
    expect(latest).toBeTruthy();
    expect(latest!.subject).toMatch(/verification code/i);
    expect(latest!.text).toContain("123456");
    expect(beforeIds.has(latest!.id)).toBe(false);
  });

  it("sends test email into outbox with system meta", async () => {
    const template = testEmailTemplate();
    const result = await sendEmail({
      to: "ops@aviatorpass.test",
      subject: template.subject,
      html: template.html,
      text: template.text,
      meta: { kind: "test", system: true },
    });
    expect(result.success).toBe(true);
    expect(result.mode).toBe("outbox");
    expect(result.delivered).toBe(false);
    const latest = getLatestOutboundTo("ops@aviatorpass.test");
    expect(latest?.subject).toMatch(/Test email/i);
  });

  it("delivers class reminder emails through the outbox", async () => {
    const student = findUserByEmail("student.one@eagerpilots.com");
    expect(student).toBeTruthy();

    const classId = generateId();
    const reminderId = generateId();
    const startsAt = new Date(Date.now() + 30 * 60_000).toISOString();
    const scheduledFor = new Date(Date.now() - 60_000).toISOString();

    const nowIso = new Date().toISOString();
    const liveClass: LiveClass = {
      id: classId,
      title: "Email Reminder ATPL Brief",
      description: "Integration fixture",
      courseId: null,
      moduleId: null,
      lessonId: null,
      instructorId: "instructor-demo",
      assistantInstructorId: null,
      startsAt,
      endsAt: new Date(Date.now() + 90 * 60_000).toISOString(),
      durationMinutes: 60,
      timezone: "Asia/Dubai",
      maxStudents: 20,
      meetingType: "meeting",
      status: "scheduled",
      zoomMeetingId: null,
      recurringRuleId: null,
      parentClassId: null,
      cancelledAt: null,
      cancelReason: null,
      rescheduledFromId: null,
      createdById: null,
      createdAt: nowIso,
      updatedAt: nowIso,
      deletedAt: null,
    };
    const reminder: ReminderQueueItem = {
      id: reminderId,
      liveClassId: classId,
      userId: student!.id,
      kind: "2h",
      channel: "email",
      scheduledFor,
      sentAt: null,
      status: "pending",
      payload: { title: liveClass.title, startsAt },
      createdAt: nowIso,
    };

    writeClassesDb((db) => {
      db.classes.push(liveClass);
      db.reminders.push(reminder);
    });

    const sent = await processDueReminders(new Date().toISOString());
    expect(sent).toBeGreaterThanOrEqual(1);

    const latest = getLatestOutboundTo(student!.email);
    expect(latest).toBeTruthy();
    expect(latest!.meta?.kind).toBe("class_reminder");
    expect(latest!.subject).toMatch(/2 hours|Class starts/i);
  });
});
