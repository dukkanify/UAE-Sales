/**
 * Unit: Advanced Email Automation (CR009).
 */

import { beforeEach, describe, expect, it } from "vitest";

import { ROLES } from "@/constants/roles";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb } from "@/services/auth/store";
import {
  configureAutomationEvent,
  dispatchEmailEvent,
  dispatchRoleAlert,
  getEmailAutomationOverview,
} from "@/services/email/automation-service";
import { resetAutomationStoreForTests } from "@/services/email/automation-store";
import { getOutboundById } from "@/services/email/outbox";
import { patchStoredSettings } from "@/services/settings/store";

describe("advanced email automation (CR009)", () => {
  beforeEach(() => {
    ensureDemoUsersSeeded();
    resetAutomationStoreForTests();
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

  it("dispatches registration / invoice / schedule templates to outbox", async () => {
    const student = readAuthDb().users.find(
      (u) => u.role === ROLES.STUDENT && u.status === "active",
    )!;

    const welcome = await dispatchEmailEvent({
      event: "registration",
      userIds: [student.id],
      data: { detail: "Welcome aboard." },
      actorId: student.id,
    });
    expect(welcome.sent).toBe(1);
    expect(getOutboundById(welcome.outboxIds[0]!)?.meta?.event).toBe("registration");

    const invoice = await dispatchEmailEvent({
      event: "invoice",
      userIds: [student.id],
      data: {
        reference: "INV-TEST-1",
        amountLabel: "AED 100.00",
        detail: "Order paid",
      },
    });
    expect(invoice.sent).toBe(1);

    const schedule = await dispatchEmailEvent({
      event: "schedule",
      userIds: [student.id],
      data: {
        title: "Met briefing",
        when: new Date().toLocaleString(),
        detail: "Zoom ready",
      },
    });
    expect(schedule.sent).toBe(1);
  });

  it("honors event disable toggles and sends admin alerts", async () => {
    const student = readAuthDb().users.find(
      (u) => u.role === ROLES.STUDENT && u.status === "active",
    )!;
    configureAutomationEvent("homework", false);
    const skipped = await dispatchEmailEvent({
      event: "homework",
      userIds: [student.id],
      data: { title: "Class", detail: "Read chapter 2" },
    });
    expect(skipped.skipped).toBe(1);
    expect(skipped.sent).toBe(0);

    const admin = await dispatchRoleAlert({
      event: "admin_alert",
      title: "Ops check",
      detail: "Automation console smoke test",
      system: true,
    });
    expect(admin.attempted).toBeGreaterThan(0);
    expect(admin.sent).toBeGreaterThan(0);

    const overview = getEmailAutomationOverview();
    expect(overview.catalog.length).toBe(14);
    expect(overview.catalog.find((c) => c.event === "homework")?.enabled).toBe(false);
    expect(overview.stats.dispatched).toBeGreaterThan(0);
  });
});
