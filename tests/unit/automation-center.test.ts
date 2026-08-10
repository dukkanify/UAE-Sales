/**
 * Unit: Super Admin Automation Center (CR010).
 */

import { beforeEach, describe, expect, it } from "vitest";

import { ROLES } from "@/constants/roles";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb } from "@/services/auth/store";
import {
  configureAutomationDomain,
  getAutomationCenterOverview,
} from "@/services/automation/automation-center-service";
import { resetAutomationCenterStoreForTests } from "@/services/automation/automation-store";
import { getMockExamSettings } from "@/services/mock-exams/booking-service";
import { getPaymentSettings } from "@/services/payments/catalog-service";
import { getPlatformSettings } from "@/services/settings/settings-service";
import { getJourneySettings } from "@/services/cgi/journey-service";

describe("super admin automation center (CR010)", () => {
  beforeEach(() => {
    ensureDemoUsersSeeded();
    resetAutomationCenterStoreForTests();
  });

  it("aggregates all automation domains for Super Admin", () => {
    const overview = getAutomationCenterOverview();
    expect(overview.domains.length).toBeGreaterThanOrEqual(14);
    const ids = overview.domains.map((d) => d.id);
    expect(ids).toContain("courses");
    expect(ids).toContain("zoom");
    expect(ids).toContain("schedule");
    expect(ids).toContain("payments");
    expect(ids).toContain("installments");
    expect(ids).toContain("cgi");
    expect(ids).toContain("mock_exams");
    expect(ids).toContain("email");
    expect(overview.stats.domainsTotal).toBe(overview.domains.length);
  });

  it("patches Zoom, installments, mock exams, and CGI without code changes", async () => {
    const sa = readAuthDb().users.find((u) => u.role === ROLES.SUPER_ADMIN)!;

    await configureAutomationDomain({
      domain: "zoom",
      patch: { enabled: true, defaultWaitingRoom: false, featureEnabled: true },
      actorId: sa.id,
    });
    expect(getPlatformSettings().zoom.defaultWaitingRoom).toBe(false);

    await configureAutomationDomain({
      domain: "installments",
      patch: {
        defaultInstallmentCount: 6,
        installmentGraceDays: 5,
        autoSuspendOnOverdue: true,
        featureEnabled: true,
      },
      actorId: sa.id,
    });
    expect(getPaymentSettings().defaultInstallmentCount).toBe(6);
    expect(getPaymentSettings().installmentGraceDays).toBe(5);

    await configureAutomationDomain({
      domain: "mock_exams",
      patch: { enabled: true, autoCreateZoom: true, pricingMode: "dynamic" },
      actorId: sa.id,
    });
    expect(getMockExamSettings().pricingMode).toBe("dynamic");
    expect(getMockExamSettings().autoCreateZoom).toBe(true);

    const sku = `ATPL-PACKAGE-${Date.now().toString().slice(-4)}`;
    await configureAutomationDomain({
      domain: "cgi",
      patch: { packageSku: sku, featureEnabled: true },
      actorId: sa.id,
    });
    expect(getJourneySettings().packageSku).toBe(sku);

    const overview = getAutomationCenterOverview();
    expect(overview.stats.lastConfiguredAt).toBeTruthy();
  });
});
