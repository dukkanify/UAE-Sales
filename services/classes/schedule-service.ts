/**
 * Scheduling engine — recurrence expansion + conflict checks.
 */

import { addDays, addMonths, addWeeks } from "date-fns";

import { generateId } from "@/lib/security/crypto";
import type { RecurrenceFrequency, RecurringRule } from "@/types/classes";
import { ClassValidationError } from "@/services/classes/validation";
import { writeClassesDb } from "@/services/classes/store";

export function createRecurringRule(input: {
  frequency: RecurrenceFrequency;
  interval?: number;
  byWeekday?: number[];
  count?: number | null;
  until?: string | null;
  timezone: string;
}): RecurringRule {
  if (input.frequency === "once") {
    throw new ClassValidationError("Use frequency other than once for recurring rules");
  }
  const rule: RecurringRule = {
    id: generateId(),
    frequency: input.frequency,
    interval: Math.max(1, input.interval ?? 1),
    byWeekday: input.byWeekday ?? [],
    count: input.count ?? null,
    until: input.until ?? null,
    timezone: input.timezone,
  };
  writeClassesDb((d) => {
    d.recurringRules.push(rule);
  });
  return rule;
}

/** Expand occurrence start times from a base start (excluding the base itself). */
export function expandOccurrences(
  startsAt: string,
  rule: RecurringRule,
  maxOccurrences = 52,
): string[] {
  const base = new Date(startsAt);
  const results: string[] = [];
  let cursor = new Date(base);
  const limit = rule.count ? Math.min(rule.count - 1, maxOccurrences) : maxOccurrences;
  const until = rule.until ? Date.parse(rule.until) : null;

  while (results.length < limit) {
    if (rule.frequency === "daily") {
      cursor = addDays(cursor, rule.interval);
    } else if (rule.frequency === "weekly") {
      cursor = addWeeks(cursor, rule.interval);
      if (rule.byWeekday.length) {
        // advance until weekday matches
        let guard = 0;
        while (!rule.byWeekday.includes(cursor.getDay()) && guard < 14) {
          cursor = addDays(cursor, 1);
          guard += 1;
        }
      }
    } else if (rule.frequency === "monthly") {
      cursor = addMonths(cursor, rule.interval);
    } else {
      break;
    }

    if (until && cursor.getTime() > until) break;
    results.push(cursor.toISOString());
  }

  return results;
}

export function computeEnd(startsAt: string, durationMinutes: number): string {
  return new Date(Date.parse(startsAt) + durationMinutes * 60_000).toISOString();
}
