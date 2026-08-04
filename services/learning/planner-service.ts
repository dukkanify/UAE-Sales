/**
 * Study planner & learning goals (AI-ready).
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { STUDY_GOAL_PERIODS } from "@/constants/learning";
import { logActivity } from "@/services/auth/activity-log";
import { LearningAccessError } from "@/services/learning/access";
import { recordHistory } from "@/services/learning/history-service";
import { readLearningDb, writeLearningDb } from "@/services/learning/store";
import type { StudyGoal, StudyGoalPeriod, StudySession } from "@/types/learning";
import type { UserProfile } from "@/types";
import { addDays, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";

export function listStudySessions(studentId: string): StudySession[] {
  return readLearningDb()
    .studySessions.filter((s) => s.studentId === studentId)
    .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart));
}

export async function createStudySession(input: {
  user: UserProfile;
  title: string;
  courseId?: string | null;
  lessonId?: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  notes?: string;
}): Promise<StudySession> {
  if (!input.title.trim()) throw new LearningAccessError("Session title required", 400);
  const start = Date.parse(input.scheduledStart);
  const end = Date.parse(input.scheduledEnd);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    throw new LearningAccessError("Invalid session time range", 400);
  }
  const now = new Date().toISOString();
  const session: StudySession = {
    id: generateId(),
    studentId: input.user.id,
    title: input.title.trim(),
    courseId: input.courseId ?? null,
    lessonId: input.lessonId ?? null,
    scheduledStart: new Date(start).toISOString(),
    scheduledEnd: new Date(end).toISOString(),
    completed: false,
    notes: input.notes ?? "",
    createdAt: now,
    updatedAt: now,
  };
  writeLearningDb((d) => {
    d.studySessions.push(session);
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.STUDY_SESSION_CREATED,
    entityType: "study_session",
    entityId: session.id,
  });
  return session;
}

export async function updateStudySession(input: {
  user: UserProfile;
  id: string;
  patch: Partial<Pick<StudySession, "title" | "completed" | "notes" | "scheduledStart" | "scheduledEnd">>;
}): Promise<StudySession> {
  const existing = readLearningDb().studySessions.find(
    (s) => s.id === input.id && s.studentId === input.user.id,
  );
  if (!existing) throw new LearningAccessError("Session not found", 404);
  const next: StudySession = {
    ...existing,
    ...input.patch,
    updatedAt: new Date().toISOString(),
  };
  writeLearningDb((d) => {
    const idx = d.studySessions.findIndex((s) => s.id === input.id);
    if (idx >= 0) d.studySessions[idx] = next;
  });
  if (input.patch.completed && !existing.completed) {
    await recordHistory({
      studentId: input.user.id,
      type: "study_session",
      title: `Completed study: ${next.title}`,
      courseId: next.courseId,
    });
  }
  return next;
}

export function listGoals(studentId: string): StudyGoal[] {
  return readLearningDb()
    .goals.filter((g) => g.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createGoal(input: {
  user: UserProfile;
  title: string;
  period: StudyGoalPeriod;
  targetHours: number;
  aiSuggested?: boolean;
}): Promise<StudyGoal> {
  if (!STUDY_GOAL_PERIODS.includes(input.period)) {
    throw new LearningAccessError("Invalid goal period", 400);
  }
  const now = new Date();
  const startsAt =
    input.period === "weekly"
      ? startOfWeek(now).toISOString()
      : startOfMonth(now).toISOString();
  const endsAt =
    input.period === "weekly"
      ? endOfWeek(now).toISOString()
      : endOfMonth(now).toISOString();

  const goal: StudyGoal = {
    id: generateId(),
    studentId: input.user.id,
    title: input.title.trim() || `${input.period} learning goal`,
    period: input.period,
    targetHours: Math.max(1, input.targetHours),
    completedHours: 0,
    status: "active",
    startsAt,
    endsAt,
    aiSuggested: Boolean(input.aiSuggested),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  writeLearningDb((d) => {
    d.goals.unshift(goal);
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.GOAL_CREATED,
    entityType: "study_goal",
    entityId: goal.id,
  });
  return goal;
}

export async function updateGoal(input: {
  user: UserProfile;
  id: string;
  patch: Partial<Pick<StudyGoal, "title" | "targetHours" | "completedHours" | "status">>;
}): Promise<StudyGoal> {
  const existing = readLearningDb().goals.find(
    (g) => g.id === input.id && g.studentId === input.user.id,
  );
  if (!existing) throw new LearningAccessError("Goal not found", 404);
  const next: StudyGoal = {
    ...existing,
    ...input.patch,
    updatedAt: new Date().toISOString(),
  };
  if (next.completedHours >= next.targetHours && next.status === "active") {
    next.status = "completed";
  }
  writeLearningDb((d) => {
    const idx = d.goals.findIndex((g) => g.id === input.id);
    if (idx >= 0) d.goals[idx] = next;
  });
  if (next.status === "completed" && existing.status !== "completed") {
    await recordHistory({
      studentId: input.user.id,
      type: "goal_completed",
      title: `Goal completed: ${next.title}`,
    });
  }
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.GOAL_UPDATED,
    entityType: "study_goal",
    entityId: next.id,
  });
  return next;
}

/** Sync goal completed hours from progress time in period window */
export function syncGoalHoursFromProgress(studentId: string): void {
  const goals = listGoals(studentId).filter((g) => g.status === "active");
  if (!goals.length) return;
  const progress = readLearningDb().progress.filter((p) => p.studentId === studentId);
  writeLearningDb((d) => {
    for (const goal of goals) {
      const start = Date.parse(goal.startsAt);
      const end = Date.parse(goal.endsAt);
      const seconds = progress
        .filter((p) => {
          const t = Date.parse(p.updatedAt);
          return t >= start && t <= end;
        })
        .reduce((s, p) => s + p.timeSpentSeconds, 0);
      const hours = Math.round((seconds / 3600) * 10) / 10;
      const idx = d.goals.findIndex((g) => g.id === goal.id);
      if (idx >= 0) {
        const current = d.goals[idx]!;
        d.goals[idx] = {
          ...current,
          completedHours: hours,
          status: hours >= current.targetHours ? "completed" : current.status,
          updatedAt: new Date().toISOString(),
        };
      }
    }
  });
}

export function suggestAiGoalPlaceholder(studentId: string): StudyGoal | null {
  // Future AI recommendations hook — returns a suggested draft shape without persisting
  void studentId;
  const now = new Date();
  return {
    id: "ai-suggestion",
    studentId,
    title: "Suggested: 5 hours of ATPL study this week",
    period: "weekly",
    targetHours: 5,
    completedHours: 0,
    status: "active",
    startsAt: startOfWeek(now).toISOString(),
    endsAt: endOfWeek(addDays(now, 0)).toISOString(),
    aiSuggested: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}
