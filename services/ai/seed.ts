/**
 * Seed prompt templates + empty conversation cache marker.
 */

import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { ensurePromptTemplates } from "@/services/ai/prompt-service";
import { readAiDb, writeAiDb } from "@/services/ai/store";

export function ensureAiSeeded(): void {
  ensureDemoUsersSeeded();
  ensurePromptTemplates();
  const db = readAiDb();
  if (db.seeded) return;
  writeAiDb((d) => {
    d.seeded = true;
  });
}
