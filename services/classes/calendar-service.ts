/**
 * Calendar service — permission-filtered live class events.
 */

import { ROLES } from "@/constants/roles";
import { ensureClassesSeeded } from "@/services/classes/seed";
import { computeRuntimeStatus, listLiveClasses } from "@/services/classes/class-service";
import { readClassesDb } from "@/services/classes/store";
import type { CalendarViewEvent, LiveClass } from "@/types/classes";
import type { UserProfile } from "@/types";

function toEvent(cls: LiveClass): CalendarViewEvent {
  const start = new Date(cls.startsAt);
  return {
    id: cls.id,
    liveClassId: cls.id,
    title: cls.title,
    date: cls.startsAt.slice(0, 10),
    time: start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    type: "Live",
    status: String(computeRuntimeStatus(cls)),
    startsAt: cls.startsAt,
    endsAt: cls.endsAt,
  };
}

export function getCalendarEventsForUser(
  user: UserProfile,
  range?: { from?: string; to?: string },
): CalendarViewEvent[] {
  ensureClassesSeeded();
  const db = readClassesDb();
  let classes = db.classes.filter((c) => !c.deletedAt);

  if (user.role === ROLES.STUDENT) {
    const allowed = new Set(
      db.participants
        .filter((p) => p.userId === user.id)
        .map((p) => p.liveClassId),
    );
    classes = classes.filter((c) => allowed.has(c.id) && c.status !== "draft");
  } else if (user.role === ROLES.INSTRUCTOR) {
    classes = classes.filter(
      (c) => c.instructorId === user.id || c.assistantInstructorId === user.id,
    );
  }
  // admin / super_admin: all

  if (range?.from) {
    const from = Date.parse(range.from);
    classes = classes.filter((c) => Date.parse(c.endsAt) >= from);
  }
  if (range?.to) {
    const to = Date.parse(range.to);
    classes = classes.filter((c) => Date.parse(c.startsAt) <= to);
  }

  return classes.sort((a, b) => a.startsAt.localeCompare(b.startsAt)).map(toEvent);
}

export function getAgendaForUser(user: UserProfile) {
  const events = getCalendarEventsForUser(user);
  const upcoming = listLiveClasses({
    status: "upcoming",
    pageSize: 20,
    instructorId: user.role === ROLES.INSTRUCTOR ? user.id : undefined,
  });

  // For students, filter list by participation
  let upcomingData = upcoming.data;
  if (user.role === ROLES.STUDENT) {
    const allowed = new Set(
      readClassesDb()
        .participants.filter((p) => p.userId === user.id)
        .map((p) => p.liveClassId),
    );
    upcomingData = upcomingData.filter((c) => allowed.has(c.id));
  }

  return { events, upcoming: upcomingData };
}
