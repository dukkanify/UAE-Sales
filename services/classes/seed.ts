/**
 * Seed demo live classes linked to LMS courses + Zoom mock meetings.
 */

import { generateId } from "@/lib/security/crypto";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { readCoursesDb } from "@/services/courses/store";
import { readClassesDb, writeClassesDb } from "@/services/classes/store";
import type { LiveClass, MeetingParticipant, ZoomMeetingRecord } from "@/types/classes";
import { addHours, addDays } from "date-fns";

export function ensureClassesSeeded(): void {
  ensureDemoUsersSeeded();
  ensureCoursesSeeded();
  const db = readClassesDb();
  if (db.seeded && db.classes.length > 0) return;

  const users = readAuthDb().users;
  const instructor = users.find((u) => u.role === ROLES.INSTRUCTOR)!;
  const assistant = users.filter((u) => u.role === ROLES.INSTRUCTOR)[1] ?? instructor;
  const actor = users.find((u) => u.role === ROLES.SUPER_ADMIN)?.id ?? null;
  const students = users.filter((u) => u.role === ROLES.STUDENT && u.status === "active");
  const course = readCoursesDb().courses.find((c) => c.code === "ATPL-010" && !c.deletedAt);
  const courseModule = course
    ? readCoursesDb().modules.find((m) => m.courseId === course.id)
    : null;
  const lesson = courseModule
    ? readCoursesDb().lessons.find((l) => l.moduleId === courseModule.id)
    : null;

  const now = new Date();
  const ts = now.toISOString();

  const defs: Array<{
    title: string;
    offsetHours: number;
    duration: number;
    status: LiveClass["status"];
  }> = [
    {
      title: "ATPL 010 Live — Air Law Briefing",
      offsetHours: 2,
      duration: 90,
      status: "scheduled",
    },
    {
      title: "ATPL 010 Live — Regulations Workshop",
      offsetHours: 26,
      duration: 60,
      status: "scheduled",
    },
    {
      title: "Mass & Balance Tutorial",
      offsetHours: -3,
      duration: 60,
      status: "completed",
    },
    {
      title: "Navigation Chart Clinic",
      offsetHours: 72,
      duration: 120,
      status: "scheduled",
    },
  ];

  const classes: LiveClass[] = [];
  const zoomMeetings: ZoomMeetingRecord[] = [];
  const participants: MeetingParticipant[] = [];

  for (const def of defs) {
    const starts = addHours(now, def.offsetHours);
    const ends = addHours(starts, def.duration / 60);
    const classId = generateId();
    const zoomId = generateId();
    const zoomMeetingId = String(Math.floor(100_000_000 + Math.random() * 899_999_999));

    classes.push({
      id: classId,
      title: def.title,
      description: `Live session for ${course?.code ?? "ATPL"} curriculum.`,
      courseId: course?.id ?? null,
      moduleId: courseModule?.id ?? null,
      lessonId: lesson?.id ?? null,
      instructorId: instructor.id,
      assistantInstructorId: assistant.id,
      startsAt: starts.toISOString(),
      endsAt: ends.toISOString(),
      durationMinutes: def.duration,
      timezone: "Asia/Kuwait",
      maxStudents: 30,
      meetingType: "meeting",
      status: def.status,
      zoomMeetingId: zoomId,
      recurringRuleId: null,
      parentClassId: null,
      cancelledAt: null,
      cancelReason: null,
      rescheduledFromId: null,
      createdById: actor,
      createdAt: ts,
      updatedAt: ts,
      deletedAt: null,
    });

    zoomMeetings.push({
      id: zoomId,
      liveClassId: classId,
      zoomMeetingId,
      zoomUuid: generateId(),
      joinUrl: `http://localhost:3000/join/${classId}?mid=${zoomMeetingId}`,
      startUrl: `http://localhost:3000/join/${classId}?host=1&mid=${zoomMeetingId}`,
      password: "AtplLive1",
      hostEmail: "ME@ABDULAZIZALSHOAIL.COM",
      waitingRoom: true,
      passcodeEnabled: true,
      coHostEmails: [],
      providerMode: "mock",
      raw: { seeded: true },
      createdAt: ts,
      updatedAt: ts,
    });

    participants.push({
      id: generateId(),
      liveClassId: classId,
      userId: instructor.id,
      role: "host",
      invitedAt: ts,
      joinedAt: null,
    });
    participants.push({
      id: generateId(),
      liveClassId: classId,
      userId: assistant.id,
      role: "cohost",
      invitedAt: ts,
      joinedAt: null,
    });
    for (const s of students.slice(0, 2)) {
      participants.push({
        id: generateId(),
        liveClassId: classId,
        userId: s.id,
        role: "participant",
        invitedAt: ts,
        joinedAt: null,
      });
    }
  }

  // One cancelled example next week
  const cancelledId = generateId();
  const cancelledStart = addDays(now, 5);
  classes.push({
    id: cancelledId,
    title: "Cancelled Ops Brief",
    description: "Example cancelled session",
    courseId: course?.id ?? null,
    moduleId: null,
    lessonId: null,
    instructorId: instructor.id,
    assistantInstructorId: null,
    startsAt: cancelledStart.toISOString(),
    endsAt: addHours(cancelledStart, 1).toISOString(),
    durationMinutes: 60,
    timezone: "Asia/Kuwait",
    maxStudents: 20,
    meetingType: "meeting",
    status: "cancelled",
    zoomMeetingId: null,
    recurringRuleId: null,
    parentClassId: null,
    cancelledAt: ts,
    cancelReason: "Instructor unavailable",
    rescheduledFromId: null,
    createdById: actor,
    createdAt: ts,
    updatedAt: ts,
    deletedAt: null,
  });

  writeClassesDb((d) => {
    d.classes = classes;
    d.zoomMeetings = zoomMeetings;
    d.participants = participants;
    d.attendance = [];
    d.recordings = [];
    d.reminders = [];
    d.recurringRules = [];
    d.seeded = true;
  });
}
