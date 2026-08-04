/**
 * Production support & continuous improvement types (Task 017).
 */

export type SupportPriority = "critical" | "high" | "medium" | "low";

export type SupportCategory =
  | "technical"
  | "user"
  | "course"
  | "live_class"
  | "zoom"
  | "payment"
  | "general";

export type SupportChannel = "ticket" | "email" | "admin_report";

export type SupportRequestStatus =
  | "new"
  | "acknowledged"
  | "in_progress"
  | "waiting_customer"
  | "resolved"
  | "closed";

export type BugStatus =
  | "new"
  | "confirmed"
  | "in_progress"
  | "ready_for_testing"
  | "verified"
  | "closed";

export type ChangeRequestStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "deferred"
  | "in_development"
  | "completed";

export type DevelopmentStatus =
  | "not_started"
  | "planned"
  | "in_progress"
  | "blocked"
  | "done";

export type RoadmapStatus =
  | "planned"
  | "approved"
  | "in_development"
  | "completed"
  | "deferred";

export type IncidentSeverity = SupportPriority;
export type IncidentStatus = "open" | "investigating" | "mitigated" | "resolved" | "closed";

export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info";
export type AlertStatus = "open" | "acknowledged" | "resolved";

export interface SlaTier {
  responseHours: number;
  resolutionHours: number;
}

export interface SlaPolicy {
  critical: SlaTier;
  high: SlaTier;
  medium: SlaTier;
  low: SlaTier;
  updatedAt: string;
  updatedBy: string | null;
}

export interface SupportRequest {
  id: string;
  number: string;
  subject: string;
  description: string;
  category: SupportCategory;
  channel: SupportChannel;
  priority: SupportPriority;
  status: SupportRequestStatus;
  requesterEmail: string;
  requesterName: string;
  assigneeId: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  slaBreached: boolean;
  linkedTicketId: string | null;
  createdAt: string;
  updatedAt: string;
  history: Array<{ at: string; actorId: string | null; note: string }>;
}

export interface BugReport {
  id: string;
  number: string;
  title: string;
  description: string;
  priority: SupportPriority;
  status: BugStatus;
  module: string;
  reporterId: string | null;
  assigneeId: string | null;
  resolution: string | null;
  verifiedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  history: Array<{ at: string; actorId: string | null; from?: string; to?: string; note: string }>;
}

export interface ChangeRequest {
  id: string;
  number: string;
  description: string;
  businessImpact: string;
  estimatedTimeHours: number | null;
  estimatedCost: number | null;
  currency: string;
  approvalStatus: "pending" | "approved" | "rejected";
  developmentStatus: DevelopmentStatus;
  requestedBy: string | null;
  approvedBy: string | null;
  futurePhase: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReleaseNote {
  id: string;
  version: string;
  title: string;
  summary: string;
  highlights: string[];
  fixes: string[];
  breakingChanges: string[];
  deployedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceLog {
  id: string;
  enabled: boolean;
  statusMessage: string;
  estimatedReturnAt: string | null;
  contactEmail: string;
  contactPhone: string;
  actorId: string | null;
  createdAt: string;
}

export interface IncidentReport {
  id: string;
  number: string;
  title: string;
  summary: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedServices: string[];
  startedAt: string;
  resolvedAt: string | null;
  postmortem: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  priority: SupportPriority;
  targetVersion: string | null;
  changeRequestId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SystemHealthLog {
  id: string;
  status: string;
  checks: Array<{ id: string; label: string; status: string; detail: string }>;
  activeUsers: number;
  errorCount: number;
  securityAlertCount: number;
  capturedAt: string;
}

export interface OpsAlert {
  id: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
  title: string;
  detail: string;
  createdAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
}

export interface BackupVerificationReport {
  id: string;
  period: "daily" | "weekly" | "monthly" | "ad_hoc";
  backupId: string | null;
  success: boolean;
  integrityOk: boolean;
  restoreTestOk: boolean | null;
  notes: string;
  generatedAt: string;
  generatedBy: string | null;
}
