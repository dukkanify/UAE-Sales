/**
 * Super Admin Automation Center (CR010) — control plane over all domains.
 */

export const AUTOMATION_DOMAINS = [
  "courses",
  "publishing",
  "instructors",
  "zoom",
  "schedule",
  "payments",
  "installments",
  "messaging",
  "email",
  "certificates",
  "reports",
  "cgi",
  "assignment",
  "mock_exams",
  "bookings",
] as const;

export type AutomationDomain = (typeof AUTOMATION_DOMAINS)[number];

export interface AutomationDomainCard {
  id: AutomationDomain;
  label: string;
  description: string;
  enabled: boolean;
  href: string;
  statusLabel: string;
  controls: AutomationControl[];
}

export type AutomationControlType = "boolean" | "number" | "string" | "select";

export interface AutomationControl {
  key: string;
  label: string;
  type: AutomationControlType;
  value: string | number | boolean | null;
  options?: Array<{ value: string; label: string }>;
  help?: string;
}

export interface AutomationCenterOverview {
  domains: AutomationDomainCard[];
  platform: {
    maintenanceMode: boolean;
    platformStatus: string;
    emailNotifications: boolean;
    smtpConfigured: boolean;
  };
  stats: {
    domainsEnabled: number;
    domainsTotal: number;
    lastConfiguredAt: string | null;
  };
}

export interface AutomationConfigureInput {
  domain: AutomationDomain;
  /** Flat key/value control patches for the domain */
  patch: Record<string, string | number | boolean | null>;
  actorId: string;
}
