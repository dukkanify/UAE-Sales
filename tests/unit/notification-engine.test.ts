/**
 * Enterprise notification engine — emit, preferences, grouping, dedupe.
 */

import { afterEach, describe, expect, it } from "vitest";

import { clearJsonFileCache } from "@/lib/data/json-file-store";
import {
  emitNotification,
  getNotificationPreferences,
  groupNotifications,
  listNotifications,
  markAllNotificationsRead,
  updateNotificationPreferences,
} from "@/services/notifications/notification-service";
import { writeAuthDb } from "@/services/auth/store";

describe("enterprise notification engine", () => {
  afterEach(() => {
    writeAuthDb((db) => {
      db.notifications = [];
      db.notificationPreferences = [];
    });
    clearJsonFileCache();
  });

  it("emits in-app notification with catalog priority and category", async () => {
    const n = await emitNotification({
      userId: "u_student_1",
      type: "payment.succeeded",
      title: "Payment successful",
      body: "KWD 25.000 received",
      email: false,
    });
    expect(n).not.toBeNull();
    expect(n!.priority).toBe("high");
    expect(n!.category).toBe("payment");
    expect(n!.status).toBe("unread");
  });

  it("dedupes identical notifications within the window", async () => {
    const a = await emitNotification({
      userId: "u_student_1",
      type: "message.new",
      title: "New message",
      body: "Hello",
      dedupeKey: "msg:thread:1",
      email: false,
    });
    const b = await emitNotification({
      userId: "u_student_1",
      type: "message.new",
      title: "New message",
      body: "Hello again",
      dedupeKey: "msg:thread:1",
      email: false,
    });
    expect(a!.id).toBe(b!.id);
    const listed = listNotifications("u_student_1");
    expect(listed.total).toBe(1);
  });

  it("groups similar unread notifications for display", async () => {
    await emitNotification({
      userId: "u_student_1",
      type: "assignment.published",
      title: "Assignment A",
      body: "A",
      email: false,
    });
    await emitNotification({
      userId: "u_student_1",
      type: "assignment.published",
      title: "Assignment B",
      body: "B",
      email: false,
    });
    const listed = listNotifications("u_student_1", { grouped: true, pageSize: 50 });
    expect(listed.groups?.some((g) => g.kind === "group" && g.count >= 2)).toBe(true);
    const grouped = groupNotifications(listed.data);
    expect(grouped.some((g) => g.title.includes("2"))).toBe(true);
  });

  it("respects category preferences", async () => {
    updateNotificationPreferences("u_student_1", { paymentEnabled: false, inAppEnabled: true });
    const blocked = await emitNotification({
      userId: "u_student_1",
      type: "payment.succeeded",
      email: false,
    });
    expect(blocked).toBeNull();

    updateNotificationPreferences("u_student_1", { paymentEnabled: true });
    const allowed = await emitNotification({
      userId: "u_student_1",
      type: "payment.succeeded",
      email: false,
    });
    expect(allowed).not.toBeNull();
  });

  it("supports search filter and mark all read", async () => {
    await emitNotification({
      userId: "u_student_1",
      type: "course.access_granted",
      title: "Met course access",
      body: "You can study Meteorology",
      email: false,
    });
    await emitNotification({
      userId: "u_student_1",
      type: "system.maintenance",
      title: "Maintenance window",
      body: "Tonight",
      email: false,
    });
    const search = listNotifications("u_student_1", { q: "meteorology" });
    expect(search.total).toBe(1);
    expect(search.unreadCount).toBe(2);
    const count = markAllNotificationsRead("u_student_1");
    expect(count).toBe(2);
    expect(listNotifications("u_student_1").unreadCount).toBe(0);
  });

  it("returns default preferences for new users", () => {
    const prefs = getNotificationPreferences("brand_new_user");
    expect(prefs.inAppEnabled).toBe(true);
    expect(prefs.securityEnabled).toBe(true);
    expect(prefs.pushEnabled).toBe(false);
  });
});
