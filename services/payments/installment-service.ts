/**
 * Installment plans, due dates, suspend/resume for ATPL packages (CR003).
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import {
  enrollStudent,
  listStudentEnrollments,
  updateEnrollmentStatus,
} from "@/services/courses/enrollment-service";
import { CourseValidationError } from "@/services/courses/validation";
import { hasUsablePassport } from "@/services/payments/kyc-document-service";
import {
  assertCheckoutModeAllowed,
  getRegionalPaymentRule,
} from "@/services/payments/regional-rules-service";
import { readPaymentsDb, writePaymentsDb } from "@/services/payments/store";
import type {
  CheckoutPaymentMode,
  InstallmentPlan,
  InstallmentScheduleItem,
  Order,
} from "@/types/payments";
import type { UserProfile } from "@/types";

export class InstallmentError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "InstallmentError";
    this.status = status;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function addDays(days: number, from = Date.now()): string {
  return new Date(from + days * 86_400_000).toISOString();
}

function productCourseIds(productId: string, fallbackCourseId: string | null): string[] {
  const product = readPaymentsDb().products.find((p) => p.id === productId);
  const fromMeta = product?.metadata?.courseIds;
  if (Array.isArray(fromMeta) && fromMeta.length) {
    return fromMeta.map(String);
  }
  if (fallbackCourseId) return [fallbackCourseId];
  if (product?.courseId) return [product.courseId];
  return [];
}

export function listInstallmentPlans(studentId?: string): InstallmentPlan[] {
  const rows = readPaymentsDb().installmentPlans;
  return (studentId ? rows.filter((p) => p.studentId === studentId) : rows).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function getInstallmentPlan(planId: string): InstallmentPlan | null {
  return readPaymentsDb().installmentPlans.find((p) => p.id === planId) ?? null;
}

export function listScheduleForPlan(planId: string): InstallmentScheduleItem[] {
  return readPaymentsDb()
    .installmentSchedule.filter((s) => s.planId === planId)
    .sort((a, b) => a.sequence - b.sequence);
}

export function buildInstallmentAmounts(total: number, count: number): number[] {
  const n = Math.max(1, count);
  const base = Math.floor(total / n);
  const amounts = Array.from({ length: n }, () => base);
  let remainder = total - base * n;
  for (let i = 0; remainder > 0; i += 1, remainder -= 1) {
    amounts[i % n]! += 1;
  }
  return amounts;
}

export async function createInstallmentPlanForOrder(input: {
  order: Order;
  user: UserProfile;
  mode: CheckoutPaymentMode;
  installmentCount?: number;
  agreementAccepted: boolean;
  passportDocumentId?: string | null;
  actorId: string;
}): Promise<InstallmentPlan> {
  const countryCode = (input.order.billingCountry || input.user.countryCode || "XX").toUpperCase();
  const rule = getRegionalPaymentRule(countryCode);
  assertCheckoutModeAllowed(rule, input.mode);

  if (input.order.totalAmount < rule.minAmount) {
    throw new InstallmentError(
      `Minimum amount for ${rule.countryName} is not met for this payment mode.`,
    );
  }

  const needsKyc = input.mode !== "full" && (rule.requiresPassport || rule.requiresAgreement);

  if (needsKyc && rule.requiresAgreement && !input.agreementAccepted) {
    throw new InstallmentError("You must accept the installment agreement to continue.");
  }

  if (needsKyc && rule.requiresPassport) {
    const passportOk =
      (input.passportDocumentId &&
        readPaymentsDb().kycDocuments.some(
          (d) =>
            d.id === input.passportDocumentId &&
            d.userId === input.user.id &&
            d.kind === "passport",
        )) ||
      hasUsablePassport(input.user.id);
    if (!passportOk) {
      throw new InstallmentError("Passport upload is required before installments or BNPL.");
    }
  }

  const settings = readPaymentsDb().settings;
  const count =
    input.mode === "full"
      ? 1
      : Math.min(
          rule.maxInstallments,
          Math.max(1, input.installmentCount ?? settings.defaultInstallmentCount),
        );

  const item = input.order.items[0];
  const courseIds = productCourseIds(item?.productId ?? "", item?.courseId ?? null);
  const amounts = buildInstallmentAmounts(input.order.totalAmount, count);
  const stamp = nowIso();
  const planId = generateId();

  const schedule: InstallmentScheduleItem[] = amounts.map((amount, index) => ({
    id: generateId(),
    planId,
    sequence: index + 1,
    amount,
    currency: input.order.currency,
    dueAt: addDays(index * 30),
    status: index === 0 ? "due" : "upcoming",
    paidAt: null,
    paymentId: null,
    reminderSentAt: [],
    lastReminderAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  }));

  const plan: InstallmentPlan = {
    id: planId,
    orderId: input.order.id,
    studentId: input.user.id,
    productId: item?.productId ?? "",
    productName: item?.productName ?? "ATPL Package",
    courseIds,
    countryCode,
    mode: input.mode,
    status:
      needsKyc && rule.requiresPassport && !hasUsablePassport(input.user.id)
        ? "pending_kyc"
        : "active",
    currency: input.order.currency,
    totalAmount: input.order.totalAmount,
    installmentCount: count,
    agreementAcceptedAt: input.agreementAccepted ? stamp : null,
    agreementVersion: input.agreementAccepted ? settings.agreementVersion : null,
    passportDocumentId: input.passportDocumentId ?? getLatestPassportId(input.user.id),
    suspendedAt: null,
    resumedAt: null,
    metadata: { regionalRuleId: rule.id },
    createdAt: stamp,
    updatedAt: stamp,
  };

  // If passport was uploaded (status uploaded), allow active for mock flow.
  if (plan.status === "pending_kyc" && hasUsablePassport(input.user.id)) {
    plan.status = "active";
  }

  writePaymentsDb((db) => {
    db.installmentPlans.unshift(plan);
    db.installmentSchedule.unshift(...schedule);
    const order = db.orders.find((o) => o.id === input.order.id);
    if (order) {
      order.metadata = {
        ...order.metadata,
        installmentPlanId: plan.id,
        paymentMode: input.mode,
      };
      order.updatedAt = stamp;
    }
  });

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.PAYMENT_COMPLETED,
    entityType: "installment_plan",
    entityId: plan.id,
    metadata: { mode: input.mode, countryCode, count },
  });

  return plan;
}

function getLatestPassportId(userId: string): string | null {
  const doc = readPaymentsDb().kycDocuments.find(
    (d) =>
      d.userId === userId &&
      d.kind === "passport" &&
      (d.status === "uploaded" || d.status === "verified"),
  );
  return doc?.id ?? null;
}

/** Mark first (or specific) installment paid after a successful payment. */
export async function markInstallmentPaid(input: {
  planId: string;
  scheduleItemId?: string;
  paymentId: string;
  actorId: string;
}): Promise<InstallmentPlan> {
  const stamp = nowIso();
  let plan = getInstallmentPlan(input.planId);
  if (!plan) throw new InstallmentError("Installment plan not found", 404);

  writePaymentsDb((db) => {
    const p = db.installmentPlans.find((x) => x.id === input.planId);
    if (!p) return;
    const items = db.installmentSchedule
      .filter((s) => s.planId === input.planId)
      .sort((a, b) => a.sequence - b.sequence);
    const target =
      (input.scheduleItemId
        ? items.find((s) => s.id === input.scheduleItemId)
        : items.find(
            (s) => s.status === "due" || s.status === "overdue" || s.status === "upcoming",
          )) ?? null;
    if (!target) return;
    target.status = "paid";
    target.paidAt = stamp;
    target.paymentId = input.paymentId;
    target.updatedAt = stamp;

    const remaining = items.filter(
      (s) => s.id !== target.id && s.status !== "paid" && s.status !== "waived",
    );
    if (remaining.length === 0) {
      p.status = "completed";
    } else if (p.status === "suspended" || p.status === "overdue") {
      p.status = "active";
      p.resumedAt = stamp;
    } else if (p.status === "pending_kyc") {
      p.status = "active";
    }
    p.updatedAt = stamp;
    plan = p;

    // Promote next upcoming to due
    const next = remaining.sort((a, b) => a.sequence - b.sequence)[0];
    if (next && next.status === "upcoming") {
      next.status = "due";
      next.updatedAt = stamp;
    }
  });

  await grantPackageAccess(plan!, input.actorId);
  if (plan?.status === "active" || plan?.status === "completed") {
    await resumePackageService({ planId: plan.id, actorId: input.actorId });
  }

  return getInstallmentPlan(input.planId)!;
}

export async function grantPackageAccess(plan: InstallmentPlan, actorId: string): Promise<void> {
  for (const courseId of plan.courseIds) {
    try {
      await enrollStudent({
        courseId,
        studentId: plan.studentId,
        status: "approved",
        notes: `ATPL package installment plan ${plan.id}`,
        actorId,
        bypassEnrollmentGate: true,
      });
    } catch (error) {
      if (error instanceof CourseValidationError && /already enrolled/i.test(error.message)) {
        const existing = listStudentEnrollments(plan.studentId).find(
          (e) => e.courseId === courseId && e.status === "suspended",
        );
        if (existing) {
          await updateEnrollmentStatus({
            id: existing.id,
            status: "approved",
            actorId,
          });
        }
        continue;
      }
      throw error;
    }
  }
}

export async function suspendPackageService(input: {
  planId: string;
  actorId: string;
  reason?: string;
}): Promise<InstallmentPlan> {
  const plan = getInstallmentPlan(input.planId);
  if (!plan) throw new InstallmentError("Installment plan not found", 404);
  const stamp = nowIso();

  writePaymentsDb((db) => {
    const p = db.installmentPlans.find((x) => x.id === input.planId);
    if (!p) return;
    p.status = "suspended";
    p.suspendedAt = stamp;
    p.updatedAt = stamp;
    p.metadata = { ...p.metadata, suspendReason: input.reason ?? "overdue" };
  });

  for (const courseId of plan.courseIds) {
    const enrollment = listStudentEnrollments(plan.studentId).find(
      (e) => e.courseId === courseId && e.status === "approved",
    );
    if (enrollment) {
      await updateEnrollmentStatus({
        id: enrollment.id,
        status: "suspended",
        actorId: input.actorId,
      });
    }
  }

  return getInstallmentPlan(input.planId)!;
}

export async function resumePackageService(input: {
  planId: string;
  actorId: string;
}): Promise<InstallmentPlan> {
  const plan = getInstallmentPlan(input.planId);
  if (!plan) throw new InstallmentError("Installment plan not found", 404);
  const stamp = nowIso();

  writePaymentsDb((db) => {
    const p = db.installmentPlans.find((x) => x.id === input.planId);
    if (!p) return;
    if (p.status === "suspended" || p.status === "overdue") {
      p.status = "active";
      p.resumedAt = stamp;
      p.updatedAt = stamp;
    }
  });

  for (const courseId of plan.courseIds) {
    const enrollment = listStudentEnrollments(plan.studentId).find(
      (e) => e.courseId === courseId && e.status === "suspended",
    );
    if (enrollment) {
      await updateEnrollmentStatus({
        id: enrollment.id,
        status: "approved",
        actorId: input.actorId,
      });
    }
  }

  return getInstallmentPlan(input.planId)!;
}

/** Mark overdue schedule items and optionally suspend service. */
export async function processOverdueInstallments(actorId: string | null = "system"): Promise<{
  markedOverdue: number;
  suspended: number;
}> {
  const settings = readPaymentsDb().settings;
  const graceMs = (settings.installmentGraceDays ?? 0) * 86_400_000;
  const now = Date.now();
  let markedOverdue = 0;
  const plansToSuspend = new Set<string>();

  writePaymentsDb((db) => {
    for (const item of db.installmentSchedule) {
      if (item.status !== "due" && item.status !== "upcoming") continue;
      const due = Date.parse(item.dueAt);
      if (Number.isNaN(due)) continue;
      if (due + graceMs >= now) continue;
      item.status = "overdue";
      item.updatedAt = nowIso();
      markedOverdue += 1;
      plansToSuspend.add(item.planId);
      const plan = db.installmentPlans.find((p) => p.id === item.planId);
      if (plan && plan.status === "active") {
        plan.status = "overdue";
        plan.updatedAt = nowIso();
      }
    }
  });

  let suspended = 0;
  if (settings.autoSuspendOnOverdue) {
    for (const planId of plansToSuspend) {
      const plan = getInstallmentPlan(planId);
      if (!plan || plan.status === "completed" || plan.status === "cancelled") continue;
      if (plan.status === "suspended") continue;
      await suspendPackageService({
        planId,
        actorId: actorId ?? "system",
        reason: "installment_overdue",
      });
      suspended += 1;
    }
  }

  return { markedOverdue, suspended };
}
