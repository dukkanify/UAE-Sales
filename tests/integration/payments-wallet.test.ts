/**
 * Integration: payments catalog ↔ wallet ledger surfaces.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { ensurePaymentsSeeded } from "@/services/payments/seed";
import { listProducts } from "@/services/payments/catalog-service";
import { ensureWallet, listWallets } from "@/services/payments/wallet-service";
import { findUserByEmail } from "@/services/auth/store";
import { ensureSuperAdminSeeded } from "@/services/auth/seed";

describe("payments ↔ wallet", () => {
  beforeAll(() => {
    ensureSuperAdminSeeded();
    ensurePaymentsSeeded();
  });

  it("exposes catalog products", () => {
    const products = listProducts({ activeOnly: false });
    expect(Array.isArray(products)).toBe(true);
  });

  it("creates instructor wallet ledger entry point", () => {
    const instructor = findUserByEmail("instructor.one@eagerpilots.com");
    expect(instructor).toBeTruthy();
    const wallet = ensureWallet(instructor!.id);
    expect(wallet.instructorId).toBe(instructor!.id);
    expect(listWallets().some((w) => w.id === wallet.id)).toBe(true);
  });
});
