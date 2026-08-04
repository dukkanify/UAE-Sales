/**
 * Phase 2 shared contracts — additive types for future modules.
 * No runtime persistence yet; safe for v1.0.
 */

export type TenantIsolationMode = "row" | "schema" | "database";

export interface TenantRecord {
  id: string;
  slug: string;
  displayName: string;
  primaryDomain: string | null;
  customDomains: string[];
  isolationMode: TenantIsolationMode;
  brandingProfileId: string | null;
  billingCustomerId: string | null;
  status: "active" | "suspended" | "provisioning";
  createdAt: string;
  updatedAt: string;
}

export interface LearningPathNode {
  id: string;
  kind: "course" | "quiz" | "certificate" | "milestone";
  refId: string;
  required: boolean;
  sortOrder: number;
}

export interface LearningPath {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  careerTrack: string | null;
  nodes: LearningPathNode[];
  published: boolean;
}

export type ProctoringEventType =
  | "face_missing"
  | "multiple_faces"
  | "tab_blur"
  | "browser_switch"
  | "identity_mismatch"
  | "consent_accepted";

export interface ProctoringEvent {
  id: string;
  attemptId: string;
  userId: string;
  tenantId: string;
  type: ProctoringEventType;
  severity: "info" | "warn" | "critical";
  payload: Record<string, unknown>;
  createdAt: string;
}

export type CrmProvider = "hubspot" | "salesforce" | "zoho" | "dynamics" | "custom";
export type ErpProvider = "sap" | "oracle" | "business_central" | "odoo" | "custom";

export interface IntegrationConnectorConfig {
  id: string;
  tenantId: string;
  kind: "crm" | "erp";
  provider: CrmProvider | ErpProvider;
  enabled: boolean;
  /** Secrets referenced by vault key — never store raw secrets here */
  vaultSecretRef: string | null;
  settings: Record<string, string>;
}

export interface Phase2CapabilityStatus {
  id: string;
  title: string;
  flag: string;
  enabled: boolean;
  train: string;
  implemented: boolean;
  docPath: string;
  summary: string;
}
