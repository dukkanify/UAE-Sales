/**
 * Mock exam dynamic pricing + extra fees (CR007).
 */

import { ensureMockExamsSeeded, readMockExamsDb } from "@/services/mock-exams/store";
import type { MockExamFeeLine, MockExamPriceQuote } from "@/types/mock-exams";

export class MockExamError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "MockExamError";
    this.status = status;
  }
}

function roundMoney(n: number) {
  return Math.max(0, Math.round(n));
}

export function quoteMockExam(input: {
  examTypeId: string;
  startsAt: string;
  selectedExtraFeeIds?: string[];
}): MockExamPriceQuote {
  ensureMockExamsSeeded();
  const db = readMockExamsDb();
  const settings = db.settings;
  const exam = db.examTypes.find((t) => t.id === input.examTypeId && t.active);
  if (!exam) throw new MockExamError("Exam type not available", 404);

  const start = new Date(input.startsAt);
  if (Number.isNaN(start.getTime())) throw new MockExamError("Invalid start time");

  let multiplier = 1;
  if (settings.pricingMode === "dynamic") {
    const hour = start.getUTCHours();
    const peak =
      settings.peakStartHour <= settings.peakEndHour
        ? hour >= settings.peakStartHour && hour < settings.peakEndHour
        : hour >= settings.peakStartHour || hour < settings.peakEndHour;
    multiplier = peak ? exam.peakMultiplier : exam.offPeakMultiplier;
  }

  const adjustedBase = roundMoney(exam.basePrice * multiplier);
  const selected = new Set(input.selectedExtraFeeIds ?? []);
  const hoursUntil = (start.getTime() - Date.now()) / 3_600_000;

  const extraFees: MockExamFeeLine[] = [];
  for (const fee of db.extraFees.filter((f) => f.active)) {
    let apply = selected.has(fee.id);
    // ELP journey: higher urgent fee for 6–12h, standard rush under 24h.
    if (fee.autoApply && fee.code === "RUSH_12H" && hoursUntil > 0 && hoursUntil <= 12) {
      apply = true;
    } else if (fee.autoApply && fee.code === "RUSH_24H" && hoursUntil > 12 && hoursUntil < 24) {
      apply = true;
    } else if (fee.autoApply && fee.code === "RUSH" && hoursUntil >= 24 && hoursUntil < 48) {
      // Legacy generic rush — only outside the ELP 12h/24h windows to avoid double fees.
      apply = true;
    }
    if (fee.autoApply && fee.code === "WEEKEND") {
      const day = start.getUTCDay();
      if (day === 0 || day === 6) apply = true;
    }
    if (apply) {
      extraFees.push({ code: fee.code, label: fee.label, amount: fee.amount });
    }
  }

  const extrasTotal = extraFees.reduce((s, f) => s + f.amount, 0);
  const subtotal = adjustedBase + extrasTotal;
  const taxAmount = roundMoney((subtotal * settings.taxRatePercent) / 100);
  const total = subtotal + taxAmount;

  return {
    examTypeId: exam.id,
    startsAt: start.toISOString(),
    currency: settings.currency,
    baseAmount: exam.basePrice,
    pricingMode: settings.pricingMode,
    multiplier,
    adjustedBase,
    extraFees,
    extrasTotal,
    subtotal,
    taxAmount,
    total,
  };
}
