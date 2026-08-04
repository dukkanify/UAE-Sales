/**
 * AI access, rate limits, and safety gates.
 */

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { hasPermission } from "@/services/auth/permissions";
import { readAiDb, writeAiDb } from "@/services/ai/store";
import type { AiAssistantPersona } from "@/types/ai";
import type { UserProfile } from "@/types";

export class AiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "AiError";
    this.status = status;
  }
}

const RATE_LIMIT_PER_MIN = 30;

const UNSAFE_PATTERNS = [
  /\b(hack|exploit|malware|bomb|weapon)\b/i,
  /\b(ssn|credit\s*card|password\s+of\s+another)\b/i,
  /\b(show|leak|dump)\s+(all\s+)?(users?|passwords?|secrets?|api\s*keys?)\b/i,
];

export function resolvePersona(user: UserProfile): AiAssistantPersona {
  if (user.role === ROLES.STUDENT) return "student";
  if (user.role === ROLES.INSTRUCTOR) return "instructor";
  return "admin";
}

export function canUseAi(user: UserProfile): boolean {
  return (
    hasPermission(user.role, PERMISSIONS.AI_CHAT) ||
    user.role === ROLES.SUPER_ADMIN ||
    user.role === ROLES.ADMIN ||
    user.role === ROLES.INSTRUCTOR ||
    user.role === ROLES.STUDENT
  );
}

export function canUseAdminInsights(user: UserProfile): boolean {
  return (
    hasPermission(user.role, PERMISSIONS.AI_ADMIN) ||
    hasPermission(user.role, PERMISSIONS.REPORTS_VIEW) ||
    user.role === ROLES.SUPER_ADMIN
  );
}

export function canUseInstructorTools(user: UserProfile): boolean {
  return (
    user.role === ROLES.INSTRUCTOR ||
    user.role === ROLES.ADMIN ||
    user.role === ROLES.SUPER_ADMIN ||
    hasPermission(user.role, PERMISSIONS.AI_TOOLS)
  );
}

export function canViewAiLogs(user: UserProfile): boolean {
  return (
    hasPermission(user.role, PERMISSIONS.AI_LOGS) ||
    hasPermission(user.role, PERMISSIONS.AUDIT_READ) ||
    user.role === ROLES.SUPER_ADMIN
  );
}

export function assertAiAccess(user: UserProfile) {
  if (!canUseAi(user)) throw new AiError("AI assistant permission required", 403);
}

export function assertRateLimit(userId: string) {
  const now = Date.now();
  const cutoff = new Date(now - 60_000).toISOString();
  writeAiDb((db) => {
    db.rateWindow = db.rateWindow.filter((r) => r.at >= cutoff);
  });
  const recent = readAiDb().rateWindow.filter((r) => r.userId === userId).length;
  if (recent >= RATE_LIMIT_PER_MIN) {
    throw new AiError("AI rate limit exceeded. Try again shortly.", 429);
  }
  writeAiDb((db) => {
    db.rateWindow.push({ userId, at: new Date().toISOString() });
  });
}

export function safetyCheck(input: string): { ok: boolean; reason: string | null } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, reason: "Empty message" };
  if (trimmed.length > 8000) return { ok: false, reason: "Message too long" };
  for (const re of UNSAFE_PATTERNS) {
    if (re.test(trimmed)) {
      return { ok: false, reason: "Request blocked by AI safety filter" };
    }
  }
  return { ok: true, reason: null };
}

export function redactSensitive(text: string): string {
  return text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]")
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, "[card]");
}
