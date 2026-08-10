/**
 * Advanced Email Automation (CR009) — typed lifecycle events.
 */

export const EMAIL_AUTOMATION_EVENTS = [
  "registration",
  "payment",
  "assignment",
  "reminder",
  "certificate",
  "homework",
  "schedule",
  "reschedule",
  "cancel",
  "invoice",
  "receipt",
  "admin_alert",
  "instructor_alert",
  "student_alert",
] as const;

export type EmailAutomationEvent = (typeof EMAIL_AUTOMATION_EVENTS)[number];

export type EmailAutomationAudience = "student" | "instructor" | "admin" | "system";

export interface EmailAutomationCatalogItem {
  event: EmailAutomationEvent;
  label: string;
  description: string;
  audience: EmailAutomationAudience;
  defaultEnabled: boolean;
  /** Runtime toggle (defaults to defaultEnabled). */
  enabled?: boolean;
}

export interface EmailAutomationDispatchInput {
  event: EmailAutomationEvent;
  /** Explicit recipient email(s). Resolved from userIds when omitted. */
  to?: string | string[];
  userIds?: string[];
  subject?: string;
  /** Template variables — string values preferred. */
  data: Record<string, string | number | boolean | null | undefined>;
  actorId?: string | null;
  /** Bypass notification kill-switch (system / admin alerts). */
  system?: boolean;
  meta?: Record<string, unknown>;
}

export interface EmailAutomationDispatchResult {
  event: EmailAutomationEvent;
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
  outboxIds: string[];
  errors: string[];
}

export interface EmailAutomationLogEntry {
  id: string;
  event: EmailAutomationEvent;
  to: string;
  subject: string;
  success: boolean;
  mode: string;
  outboxId: string | null;
  error: string | null;
  actorId: string | null;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface EmailAutomationOverview {
  catalog: EmailAutomationCatalogItem[];
  recent: EmailAutomationLogEntry[];
  outboxPreview: Array<{
    id: string;
    to: string;
    subject: string;
    mode: string;
    event: string | null;
    createdAt: string;
  }>;
  smtpConfigured: boolean;
  emailNotificationsEnabled: boolean;
  stats: {
    dispatched: number;
    sent: number;
    failed: number;
    byEvent: Record<string, number>;
  };
}
