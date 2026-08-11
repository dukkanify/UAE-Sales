import { beforeAll, describe, expect, it } from "vitest";

import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb } from "@/services/auth/store";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { readCoursesDb } from "@/services/courses/store";
import {
  ensureCustomerJourneyCourses,
  ensureCustomerJourneyProducts,
} from "@/services/journeys/customer-journey-catalog";
import {
  ensureMockExamsSeeded,
  readMockExamsDb,
  resetMockExamsDbCache,
} from "@/services/mock-exams/store";
import { quoteMockExam } from "@/services/mock-exams/pricing-service";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import { getRegionalPaymentRule } from "@/services/payments/regional-rules-service";
import { readPaymentsDb } from "@/services/payments/store";
import { ROLES } from "@/constants/roles";

describe("customer journey alignment", () => {
  beforeAll(() => {
    ensureDemoUsersSeeded();
    ensureCoursesSeeded();
    ensurePaymentsSeeded();
    ensureCustomerJourneyCourses();
    ensureCustomerJourneyProducts();
    resetMockExamsDbCache();
    ensureMockExamsSeeded();
  });

  it("seeds PPL / Basics recorded+live journeys with Captain Abdulaziz", () => {
    const courses = readCoursesDb().courses;
    for (const code of ["PPL-REC-01", "PPL-LIVE-01", "BASICS-REC-01", "BASICS-LIVE-01"]) {
      const course = courses.find((c) => c.code === code);
      expect(course, code).toBeTruthy();
      expect(course!.status).toBe("published");
      expect(course!.metadata?.objectives).toBeTruthy();
      expect(course!.metadata?.instructorDisplayName).toContain("Abdulaziz");
    }
    const pplRec = courses.find((c) => c.code === "PPL-REC-01")!;
    expect(pplRec.estimatedDurationMinutes).toBe(100 * 60);
    expect(pplRec.deliveryType).toBe("recorded");
    const pplLive = courses.find((c) => c.code === "PPL-LIVE-01")!;
    expect(pplLive.deliveryType).toBe("live");
    const instructor = readAuthDb().users.find((u) => u.email === "instructor.one@eagerpilots.com");
    expect(instructor?.role).toBe(ROLES.INSTRUCTOR);
    expect(`${instructor?.firstName} ${instructor?.lastName}`).toContain("Abdulaziz");
  });

  it("maps Tabby to Kuwait and Tamara to UAE with installment capacity", () => {
    const kw = getRegionalPaymentRule("KW");
    const ae = getRegionalPaymentRule("AE");
    expect(kw.bnplProviders).toEqual(["tabby"]);
    expect(ae.bnplProviders).toEqual(["tamara"]);
    expect(kw.maxInstallments).toBeGreaterThanOrEqual(6);
    expect(ae.maxInstallments).toBeGreaterThanOrEqual(6);
  });

  it("creates checkout products for journey SKUs", () => {
    const products = readPaymentsDb().products;
    for (const sku of ["PPL-RECORDED", "PPL-LIVE", "BASICS-RECORDED", "BASICS-LIVE"]) {
      expect(
        products.some((p) => p.metadata?.sku === sku),
        sku,
      ).toBe(true);
    }
  });

  it("offers ELP mock with rush fees under 24h and 12h", () => {
    const elp = readMockExamsDb().examTypes.find((t) => t.code === "ELP-MOCK");
    expect(elp).toBeTruthy();
    const in10h = new Date(Date.now() + 10 * 3_600_000).toISOString();
    const in18h = new Date(Date.now() + 18 * 3_600_000).toISOString();
    const q12 = quoteMockExam({ examTypeId: elp!.id, startsAt: in10h });
    const q24 = quoteMockExam({ examTypeId: elp!.id, startsAt: in18h });
    expect(q12.extraFees.some((f) => f.code === "RUSH_12H")).toBe(true);
    expect(q24.extraFees.some((f) => f.code === "RUSH_24H")).toBe(true);
  });
});
