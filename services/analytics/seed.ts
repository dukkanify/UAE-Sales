/**
 * Seed default scheduled executive report for Super Admin.
 */

import { generateId } from "@/lib/security/crypto";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import { readAnalyticsDb, writeAnalyticsDb } from "@/services/analytics/store";

export function ensureAnalyticsSeeded(): void {
  ensureDemoUsersSeeded();
  const db = readAnalyticsDb();
  if (db.seeded) return;

  const sa = readAuthDb().users.find((u) => u.role === ROLES.SUPER_ADMIN);
  const stamp = new Date().toISOString();
  const next = new Date();
  next.setDate(next.getDate() + 1);

  writeAnalyticsDb((d) => {
    if (sa) {
      d.scheduledReports = [
        {
          id: generateId(),
          name: "Daily Executive Snapshot",
          scope: "executive",
          frequency: "daily",
          recipients: [sa.email],
          filters: {},
          enabled: true,
          createdById: sa.id,
          lastRunAt: null,
          nextRunAt: next.toISOString(),
          createdAt: stamp,
          updatedAt: stamp,
        },
      ];
      d.savedReports = [
        {
          id: generateId(),
          name: "Monthly Finance Overview",
          scope: "financial",
          filters: {},
          createdById: sa.id,
          pinned: true,
          createdAt: stamp,
          updatedAt: stamp,
        },
      ];
    }
    d.seeded = true;
  });
}
