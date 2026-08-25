/**
 * Automatic content moderation engine with configurable rules.
 */

import { generateId } from "@/lib/security/crypto";
import { DEFAULT_BLOCKED_WORDS } from "@/constants/communication";
import { readCommunicationDb, writeCommunicationDb } from "@/services/communication/store";
import type {
  ModerationAction,
  ModerationLog,
  ModerationResult,
  ModerationRule,
  ModerationRuleKind,
} from "@/types/communication";

const PHONE_RE = /(\+?\d[\d\s\-().]{7,}\d)/g;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const URL_RE = /https?:\/\/[^\s]+|www\.[^\s]+/gi;
const WHATSAPP_RE = /\b(whats\s*app|telegram|signal|call\s*me|text\s*me)\b/gi;

function nowIso() {
  return new Date().toISOString();
}

export function ensureDefaultModerationRules(): ModerationRule[] {
  const db = readCommunicationDb();
  if (db.moderationRules.length === 0) {
    const stamp = nowIso();
    const rules: ModerationRule[] = [
      {
        id: generateId(),
        kind: "profanity",
        enabled: true,
        pattern: DEFAULT_BLOCKED_WORDS.join("|"),
        action: "block",
        description: "Block common offensive language",
        updatedAt: stamp,
      },
      {
        id: generateId(),
        kind: "hate",
        enabled: true,
        pattern: "hate speech|racial slur|go die",
        action: "block",
        description: "Block hate speech patterns",
        updatedAt: stamp,
      },
      {
        id: generateId(),
        kind: "phone",
        enabled: true,
        pattern: "phone",
        action: "block",
        description: "Block phone numbers — keep communication on-platform",
        updatedAt: stamp,
      },
      {
        id: generateId(),
        kind: "email",
        enabled: true,
        pattern: "email",
        action: "block",
        description: "Block personal email addresses shared in chat",
        updatedAt: stamp,
      },
      {
        id: generateId(),
        kind: "external_contact",
        enabled: true,
        pattern: "whatsapp|telegram",
        action: "block",
        description: "Block attempts to move conversation off-platform",
        updatedAt: stamp,
      },
      {
        id: generateId(),
        kind: "spam_link",
        enabled: true,
        pattern: "http",
        action: "flag",
        description: "Flag external spam links",
        updatedAt: stamp,
      },
      {
        id: generateId(),
        kind: "spam_repeat",
        enabled: true,
        pattern: "repeat",
        action: "flag",
        description: "Flag repeated identical spam bursts",
        updatedAt: stamp,
      },
      {
        id: generateId(),
        kind: "suspicious",
        enabled: true,
        pattern: "crypto giveaway|free money|click here now",
        action: "block",
        description: "Block suspicious scam phrases",
        updatedAt: stamp,
      },
    ];

    writeCommunicationDb((d) => {
      d.moderationRules = rules;
    });
    return rules;
  }

  // Harden legacy installs that still only flag phone/email/external contact
  let changed = false;
  writeCommunicationDb((d) => {
    for (const rule of d.moderationRules) {
      if (
        (rule.kind === "phone" || rule.kind === "email" || rule.kind === "external_contact") &&
        rule.action === "flag"
      ) {
        rule.action = "block";
        rule.updatedAt = nowIso();
        changed = true;
      }
    }
  });
  void changed;
  return readCommunicationDb().moderationRules;
}

export function listModerationRules(): ModerationRule[] {
  ensureDefaultModerationRules();
  return readCommunicationDb().moderationRules;
}

export function updateModerationRule(
  id: string,
  patch: Partial<Pick<ModerationRule, "enabled" | "pattern" | "action" | "description">>,
): ModerationRule {
  let updated: ModerationRule | null = null;
  writeCommunicationDb((db) => {
    const rule = db.moderationRules.find((r) => r.id === id);
    if (!rule) return;
    Object.assign(rule, patch, { updatedAt: nowIso() });
    updated = { ...rule };
  });
  if (!updated) throw new Error("Rule not found");
  return updated;
}

export function listModerationLogs(limit = 50): ModerationLog[] {
  return [...readCommunicationDb().moderationLogs]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

function logModeration(input: Omit<ModerationLog, "id" | "createdAt">) {
  writeCommunicationDb((db) => {
    db.moderationLogs.unshift({
      id: generateId(),
      createdAt: nowIso(),
      ...input,
    });
    db.moderationLogs = db.moderationLogs.slice(0, 500);
  });
}

function severity(action: ModerationAction): number {
  if (action === "block") return 3;
  if (action === "redact") return 2;
  if (action === "flag") return 1;
  return 0;
}

export function moderateText(
  body: string,
  meta?: {
    contentType?: ModerationLog["contentType"];
    contentId?: string;
    actorId?: string | null;
    recentBodies?: string[];
  },
): ModerationResult {
  const rules = listModerationRules().filter((r) => r.enabled);
  const flags: string[] = [];
  let strongest: ModerationAction = "allow";
  let matchedRule: ModerationRule | null = null;
  let redacted = body;

  for (const rule of rules) {
    let hit = false;
    if (rule.kind === "profanity" || rule.kind === "hate" || rule.kind === "suspicious") {
      const parts = rule.pattern
        .split("|")
        .map((p) => p.trim())
        .filter(Boolean);
      for (const p of parts) {
        if (p && body.toLowerCase().includes(p.toLowerCase())) {
          hit = true;
          redacted = redacted.replace(
            new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"),
            "***",
          );
        }
      }
    } else if (rule.kind === "phone") {
      if (PHONE_RE.test(body)) hit = true;
      PHONE_RE.lastIndex = 0;
    } else if (rule.kind === "email") {
      if (EMAIL_RE.test(body)) hit = true;
      EMAIL_RE.lastIndex = 0;
    } else if (rule.kind === "external_contact") {
      if (WHATSAPP_RE.test(body)) hit = true;
      WHATSAPP_RE.lastIndex = 0;
    } else if (rule.kind === "spam_link") {
      if (URL_RE.test(body)) hit = true;
      URL_RE.lastIndex = 0;
    } else if (rule.kind === "spam_repeat") {
      const recent = meta?.recentBodies ?? [];
      const normalized = body.trim().toLowerCase();
      if (
        normalized.length > 8 &&
        recent.filter((r) => r.trim().toLowerCase() === normalized).length >= 2
      ) {
        hit = true;
      }
    }

    if (hit) {
      flags.push(rule.kind);
      if (severity(rule.action) > severity(strongest)) {
        strongest = rule.action;
        matchedRule = rule;
      }
    }
  }

  const allowed = strongest !== "block";
  if (flags.length && meta?.contentType && meta.contentId) {
    logModeration({
      ruleId: matchedRule?.id ?? null,
      ruleKind: (matchedRule?.kind ?? "manual") as ModerationRuleKind | "manual",
      action: strongest,
      contentType: meta.contentType,
      contentId: meta.contentId,
      actorId: meta.actorId ?? null,
      snippet: body.slice(0, 160),
    });
  }

  return {
    allowed,
    action: strongest,
    flags,
    redactedBody: strongest === "redact" ? redacted : undefined,
  };
}

export function recordManualModeration(input: {
  contentType: ModerationLog["contentType"];
  contentId: string;
  actorId: string;
  action: ModerationAction;
  snippet: string;
}) {
  logModeration({
    ruleId: null,
    ruleKind: "manual",
    action: input.action,
    contentType: input.contentType,
    contentId: input.contentId,
    actorId: input.actorId,
    snippet: input.snippet.slice(0, 160),
  });
}
