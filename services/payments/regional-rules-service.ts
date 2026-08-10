/**
 * Regional payment rules — Tamara / Tabby (تالي) by country (CR003).
 */

import { generateId } from "@/lib/security/crypto";
import { readPaymentsDb, writePaymentsDb } from "@/services/payments/store";
import type { BnplProvider, CheckoutPaymentMode, RegionalPaymentRule } from "@/types/payments";

function nowIso() {
  return new Date().toISOString();
}

/** Seed defaults based on GCC BNPL availability (Tamara / Tabby). */
export function defaultRegionalPaymentRules(currency: string): RegionalPaymentRule[] {
  const stamp = nowIso();
  const base = (
    countryCode: string,
    countryName: string,
    bnplProviders: BnplProvider[],
    opts?: Partial<RegionalPaymentRule>,
  ): RegionalPaymentRule => ({
    id: generateId(),
    countryCode,
    countryName,
    currency: opts?.currency ?? currency,
    allowFullPayment: true,
    allowInstallments: opts?.allowInstallments ?? true,
    bnplProviders,
    maxInstallments: opts?.maxInstallments ?? 4,
    minAmount: opts?.minAmount ?? 0,
    requiresPassport: opts?.requiresPassport ?? true,
    requiresAgreement: opts?.requiresAgreement ?? true,
    active: true,
    notes: opts?.notes ?? null,
    createdAt: stamp,
    updatedAt: stamp,
  });

  return [
    base("KW", "Kuwait", ["tamara", "tabby"], {
      currency: "KWD",
      notes: "Tamara + Tabby (تالي) available for ATPL package checkout.",
    }),
    base("SA", "Saudi Arabia", ["tamara", "tabby"], {
      currency: "SAR",
      notes: "Tamara (home market) + Tabby supported.",
    }),
    base("AE", "United Arab Emirates", ["tamara", "tabby"], {
      currency: "AED",
      notes: "Tamara + Tabby supported.",
    }),
    base("BH", "Bahrain", ["tamara", "tabby"], {
      currency: "BHD",
      notes: "Tamara + Tabby supported.",
    }),
    base("QA", "Qatar", [], {
      currency: "QAR",
      allowInstallments: true,
      bnplProviders: [],
      notes: "Full payment + platform installments; BNPL not enabled by default.",
    }),
    base("OM", "Oman", [], {
      currency: "OMR",
      allowInstallments: true,
      bnplProviders: [],
      requiresPassport: true,
      notes: "Full payment + platform installments.",
    }),
    base("XX", "Other / International", [], {
      allowInstallments: false,
      bnplProviders: [],
      requiresPassport: false,
      requiresAgreement: false,
      notes: "Full payment only outside configured GCC markets.",
    }),
  ];
}

export function ensureRegionalRulesSeeded(): void {
  writePaymentsDb((db) => {
    if (db.regionalRules.length > 0) return;
    db.regionalRules = defaultRegionalPaymentRules(db.settings.currency);
  });
}

export function listRegionalPaymentRules(activeOnly = false): RegionalPaymentRule[] {
  ensureRegionalRulesSeeded();
  const rows = readPaymentsDb().regionalRules;
  return (activeOnly ? rows.filter((r) => r.active) : rows).sort((a, b) =>
    a.countryName.localeCompare(b.countryName),
  );
}

export function getRegionalPaymentRule(
  countryCode: string | null | undefined,
): RegionalPaymentRule {
  ensureRegionalRulesSeeded();
  const code = (countryCode || "XX").toUpperCase();
  const rows = readPaymentsDb().regionalRules;
  return (
    rows.find((r) => r.active && r.countryCode === code) ??
    rows.find((r) => r.active && r.countryCode === "XX") ??
    defaultRegionalPaymentRules(readPaymentsDb().settings.currency).find(
      (r) => r.countryCode === "XX",
    )!
  );
}

export function allowedCheckoutModes(rule: RegionalPaymentRule): CheckoutPaymentMode[] {
  const modes: CheckoutPaymentMode[] = [];
  if (rule.allowFullPayment) modes.push("full");
  if (rule.allowInstallments) modes.push("installments");
  if (rule.bnplProviders.includes("tamara")) modes.push("tamara");
  if (rule.bnplProviders.includes("tabby")) modes.push("tabby");
  return modes;
}

export function assertCheckoutModeAllowed(
  rule: RegionalPaymentRule,
  mode: CheckoutPaymentMode,
): void {
  const allowed = allowedCheckoutModes(rule);
  if (!allowed.includes(mode)) {
    throw new Error(
      `Payment mode "${mode}" is not available in ${rule.countryName}. Available: ${allowed.join(", ")}`,
    );
  }
}

export function upsertRegionalPaymentRule(
  input: Partial<RegionalPaymentRule> & { countryCode: string; countryName: string },
): RegionalPaymentRule {
  ensureRegionalRulesSeeded();
  const stamp = nowIso();
  let saved: RegionalPaymentRule | null = null;
  writePaymentsDb((db) => {
    const idx = db.regionalRules.findIndex(
      (r) => r.countryCode.toUpperCase() === input.countryCode.toUpperCase(),
    );
    if (idx >= 0) {
      const current = db.regionalRules[idx]!;
      const next: RegionalPaymentRule = {
        ...current,
        ...input,
        countryCode: input.countryCode.toUpperCase(),
        updatedAt: stamp,
      };
      db.regionalRules[idx] = next;
      saved = next;
      return;
    }
    const created: RegionalPaymentRule = {
      id: generateId(),
      countryCode: input.countryCode.toUpperCase(),
      countryName: input.countryName,
      currency: input.currency ?? db.settings.currency,
      allowFullPayment: input.allowFullPayment ?? true,
      allowInstallments: input.allowInstallments ?? false,
      bnplProviders: input.bnplProviders ?? [],
      maxInstallments: input.maxInstallments ?? 4,
      minAmount: input.minAmount ?? 0,
      requiresPassport: input.requiresPassport ?? false,
      requiresAgreement: input.requiresAgreement ?? false,
      active: input.active ?? true,
      notes: input.notes ?? null,
      createdAt: stamp,
      updatedAt: stamp,
    };
    db.regionalRules.push(created);
    saved = created;
  });
  return saved!;
}
