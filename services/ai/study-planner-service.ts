/**
 * AI study planner — generates editable plans; can accept into learning planner.
 */

import { addDays, addHours, startOfDay } from "date-fns";
import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { ROLES } from "@/constants/roles";
import { logActivity } from "@/services/auth/activity-log";
import { assertAiAccess, AiError, resolvePersona } from "@/services/ai/access";
import { buildUserContext } from "@/services/ai/context-service";
import { ensureAiSeeded } from "@/services/ai/seed";
import { readAiDb, writeAiDb } from "@/services/ai/store";
import { createStudySession, createGoal } from "@/services/learning/planner-service";
import type { AiPlanHorizon, AiStudyPlan, AiStudyPlanItem } from "@/types/ai";
import type { UserProfile } from "@/types";

export function listAiStudyPlans(user: UserProfile): AiStudyPlan[] {
  ensureAiSeeded();
  assertAiAccess(user);
  return readAiDb()
    .studyPlans.filter((p) => p.studentId === user.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function generateStudyPlan(input: {
  user: UserProfile;
  horizon: AiPlanHorizon;
}): Promise<AiStudyPlan> {
  ensureAiSeeded();
  assertAiAccess(input.user);
  if (input.user.role !== ROLES.STUDENT) {
    throw new AiError("Study plans are for students", 403);
  }

  const context = buildUserContext(input.user);
  const stamp = new Date().toISOString();
  const base = startOfDay(new Date());
  const courses = context.enrolledCourses;
  const items: AiStudyPlanItem[] = [];

  const sessions =
    input.horizon === "daily"
      ? 2
      : input.horizon === "weekly"
        ? 6
        : input.horizon === "monthly"
          ? 12
          : input.horizon === "exam"
            ? 8
            : 5;

  for (let i = 0; i < sessions; i++) {
    const course = courses[i % Math.max(1, courses.length)];
    const dayOffset =
      input.horizon === "daily" ? 0 : input.horizon === "weekly" ? i : Math.floor(i * 2.2);
    const start = addHours(addDays(base, dayOffset), 9 + (i % 3) * 2);
    const end = addHours(start, 1);
    items.push({
      id: generateId(),
      title:
        input.horizon === "revision"
          ? `Revision: ${course?.title ?? "Core topics"}`
          : input.horizon === "exam"
            ? `Exam prep block ${i + 1}`
            : `Study: ${course?.title ?? "ATPL fundamentals"}`,
      courseId: course?.id ?? null,
      lessonId: null,
      scheduledStart: start.toISOString(),
      scheduledEnd: end.toISOString(),
      notes: "AI-generated — edit anytime before accepting.",
    });
  }

  const plan: AiStudyPlan = {
    id: generateId(),
    studentId: input.user.id,
    horizon: input.horizon,
    title: `${capitalize(input.horizon)} study plan`,
    summary: courses.length
      ? `Balanced ${input.horizon} plan across ${courses.map((c) => c.code || c.title).join(", ")}.`
      : `General ${input.horizon} plan — enroll in a course for tighter personalization.`,
    items,
    editable: true,
    accepted: false,
    createdAt: stamp,
    updatedAt: stamp,
  };

  writeAiDb((db) => {
    db.studyPlans.unshift(plan);
    db.usage.push({
      id: generateId(),
      userId: input.user.id,
      persona: resolvePersona(input.user),
      action: "study_plan",
      tokensIn: 40,
      tokensOut: 120,
      conversationId: null,
      createdAt: stamp,
    });
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.AI_PLAN_GENERATED,
    entityType: "ai_study_plan",
    entityId: plan.id,
  });

  return plan;
}

export async function updateStudyPlan(input: {
  user: UserProfile;
  planId: string;
  items?: AiStudyPlanItem[];
  title?: string;
}): Promise<AiStudyPlan> {
  assertAiAccess(input.user);
  const existing = readAiDb().studyPlans.find(
    (p) => p.id === input.planId && p.studentId === input.user.id,
  );
  if (!existing) throw new AiError("Plan not found", 404);
  if (!existing.editable) throw new AiError("Plan is locked", 400);

  const next: AiStudyPlan = {
    ...existing,
    title: input.title?.trim() || existing.title,
    items: input.items ?? existing.items,
    updatedAt: new Date().toISOString(),
  };
  writeAiDb((db) => {
    const idx = db.studyPlans.findIndex((p) => p.id === next.id);
    if (idx >= 0) db.studyPlans[idx] = next;
  });
  return next;
}

export async function acceptStudyPlan(input: {
  user: UserProfile;
  planId: string;
}): Promise<{ plan: AiStudyPlan; sessionsCreated: number }> {
  assertAiAccess(input.user);
  const plan = readAiDb().studyPlans.find(
    (p) => p.id === input.planId && p.studentId === input.user.id,
  );
  if (!plan) throw new AiError("Plan not found", 404);

  let sessionsCreated = 0;
  for (const item of plan.items) {
    await createStudySession({
      user: input.user,
      title: item.title,
      courseId: item.courseId,
      lessonId: item.lessonId,
      scheduledStart: item.scheduledStart,
      scheduledEnd: item.scheduledEnd,
      notes: item.notes || "Accepted from AI study plan",
    });
    sessionsCreated += 1;
  }

  if (plan.horizon === "weekly" || plan.horizon === "monthly") {
    await createGoal({
      user: input.user,
      title: `AI ${plan.horizon} goal`,
      period: plan.horizon === "monthly" ? "monthly" : "weekly",
      targetHours: plan.horizon === "monthly" ? 20 : 8,
      aiSuggested: true,
    });
  }

  const next = { ...plan, accepted: true, editable: false, updatedAt: new Date().toISOString() };
  writeAiDb((db) => {
    const idx = db.studyPlans.findIndex((p) => p.id === plan.id);
    if (idx >= 0) db.studyPlans[idx] = next;
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.AI_PLAN_ACCEPTED,
    entityType: "ai_study_plan",
    entityId: plan.id,
  });

  return { plan: next, sessionsCreated };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
