/**
 * Unit: installments & regional payment rules (CR003).
 */

import { beforeAll, describe, expect, it } from "vitest";

import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import {
  allowedCheckoutModes,
  getRegionalPaymentRule,
} from "@/services/payments/regional-rules-service";
import {
  buildInstallmentAmounts,
  createInstallmentPlanForOrder,
  listScheduleForPlan,
  markInstallmentPaid,
  processOverdueInstallments,
  suspendPackageService,
  resumePackageService,
} from "@/services/payments/installment-service";
import { createCheckoutOrder, payOrder } from "@/services/payments/checkout-service";
import { readPaymentsDb, writePaymentsDb } from "@/services/payments/store";
import { generateId } from "@/lib/security/crypto";

describe("installments & regional payments (CR003)", () => {
  beforeAll(() => {
    ensureDemoUsersSeeded();
    ensurePaymentsSeeded();
  });

  it("exposes Tamara + Tabby (تالي) for KW/SA/AE", () => {
    for (const code of ["KW", "SA", "AE", "BH"]) {
      const rule = getRegionalPaymentRule(code);
      const modes = allowedCheckoutModes(rule);
      expect(modes).toEqual(expect.arrayContaining(["full", "installments", "tamara", "tabby"]));
    }
    const qa = allowedCheckoutModes(getRegionalPaymentRule("QA"));
    expect(qa).toContain("full");
    expect(qa).toContain("installments");
    expect(qa).not.toContain("tamara");
  });

  it("splits installment amounts exactly", () => {
    const amounts = buildInstallmentAmounts(1000, 3);
    expect(amounts).toHaveLength(3);
    expect(amounts.reduce((a, b) => a + b, 0)).toBe(1000);
  });

  it("seeds ATPL Theory Package", () => {
    const atpl = readPaymentsDb().products.find((p) => p.metadata?.sku === "ATPL-PACKAGE");
    expect(atpl).toBeTruthy();
    expect(Array.isArray(atpl?.metadata.courseIds)).toBe(true);
  });

  it("creates installment plan with due dates and suspends/resumes", async () => {
    const student = readAuthDb().users.find(
      (u) => u.role === ROLES.STUDENT && u.status === "active",
    );
    expect(student).toBeTruthy();
    const user = toUserProfile(student!);
    const product = readPaymentsDb().products.find((p) => p.metadata?.sku === "ATPL-PACKAGE");
    expect(product).toBeTruthy();

    // Fake passport so KYC passes
    writePaymentsDb((db) => {
      db.kycDocuments.unshift({
        id: generateId(),
        userId: user.id,
        kind: "passport",
        status: "uploaded",
        fileName: "passport.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024,
        storagePath: "/tmp/passport.pdf",
        publicUrl: null,
        rejectionReason: null,
        verifiedAt: null,
        verifiedById: null,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    const order = await createCheckoutOrder({
      user,
      productId: product!.id,
      billingName: user.fullName || user.email,
      billingEmail: user.email,
      billingCountry: "KW",
      idempotencyKey: `cr003-${Date.now()}`,
    });

    const plan = await createInstallmentPlanForOrder({
      order,
      user,
      mode: "installments",
      installmentCount: 4,
      agreementAccepted: true,
      actorId: user.id,
    });
    expect(plan.installmentCount).toBe(4);
    const schedule = listScheduleForPlan(plan.id);
    expect(schedule).toHaveLength(4);
    expect(schedule[0]?.status).toBe("due");

    await markInstallmentPaid({
      planId: plan.id,
      scheduleItemId: schedule[0]!.id,
      paymentId: "pay-test",
      actorId: user.id,
    });

    // Force overdue on remaining
    writePaymentsDb((db) => {
      for (const item of db.installmentSchedule.filter((s) => s.planId === plan.id)) {
        if (item.status !== "paid") {
          item.dueAt = new Date(Date.now() - 10 * 86_400_000).toISOString();
          item.status = "due";
        }
      }
      const settings = db.settings;
      settings.installmentGraceDays = 0;
      settings.autoSuspendOnOverdue = true;
    });

    const overdue = await processOverdueInstallments(user.id);
    expect(overdue.markedOverdue + overdue.suspended).toBeGreaterThan(0);

    await resumePackageService({ planId: plan.id, actorId: user.id });
    const resumed = readPaymentsDb().installmentPlans.find((p) => p.id === plan.id);
    expect(resumed?.status).toBe("active");

    // Also cover suspend helper
    await suspendPackageService({ planId: plan.id, actorId: user.id, reason: "test" });
    expect(readPaymentsDb().installmentPlans.find((p) => p.id === plan.id)?.status).toBe(
      "suspended",
    );
  });

  it("pays ATPL package in full via checkout flow", async () => {
    const student = readAuthDb().users.find(
      (u) => u.role === ROLES.STUDENT && u.status === "active",
    );
    const user = toUserProfile(student!);
    const product = readPaymentsDb().products.find((p) => p.metadata?.sku === "ATPL-PACKAGE")!;
    const order = await createCheckoutOrder({
      user,
      productId: product.id,
      billingName: "Full Pay",
      billingEmail: user.email,
      billingCountry: "AE",
      idempotencyKey: `cr003-full-${Date.now()}`,
    });
    const paid = await payOrder({
      user,
      orderId: order.id,
      methodBrand: "visa",
      paymentToken: "tok_ok",
      paymentMode: "full",
      agreementAccepted: true,
    });
    expect(paid.order.status).toBe("paid");
    expect(paid.payment.status).toBe("succeeded");
  });
});
