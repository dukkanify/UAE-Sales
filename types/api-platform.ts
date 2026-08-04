/**
 * Mobile / integration API platform types (Task 018).
 */

export type ApiKeyStatus = "active" | "revoked" | "expired";

export type ApiKeyScope =
  | "public:read"
  | "mobile:full"
  | "webhooks:manage"
  | "import:write"
  | "export:read"
  | "admin:ops";

export interface ApiKeyRecord {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  scopes: ApiKeyScope[];
  status: ApiKeyStatus;
  ownerUserId: string | null;
  rateLimitPerMinute: number;
  allowedIps: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  userAgent: string | null;
  ipAddress: string | null;
}

export type WebhookEventType =
  | "payment.*"
  | "payment.succeeded"
  | "payment.failed"
  | "zoom.*"
  | "zoom.meeting.started"
  | "zoom.meeting.ended"
  | "user.registered"
  | "course.enrolled"
  | "certificate.issued"
  | "notification.created"
  | "support.ticket.updated"
  | "integration.test";

export interface WebhookEndpoint {
  id: string;
  url: string;
  description: string;
  secret: string;
  events: WebhookEventType[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  failureCount: number;
  lastDeliveryAt: string | null;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: "pending" | "delivered" | "failed" | "dead";
  attempts: number;
  lastError: string | null;
  responseStatus: number | null;
  createdAt: string;
  deliveredAt: string | null;
}

export type IntegrationProvider =
  | "zoom"
  | "smtp"
  | "stripe"
  | "google_calendar"
  | "microsoft_calendar"
  | "slack"
  | "microsoft_teams"
  | "crm"
  | "marketing"
  | "custom";

export interface IntegrationSetting {
  id: string;
  provider: IntegrationProvider;
  label: string;
  enabled: boolean;
  status: "ready" | "configured" | "mock" | "disabled" | "error";
  config: Record<string, unknown>;
  secretsPresent: boolean;
  notes: string;
  updatedAt: string;
}

export type JobType =
  | "email"
  | "notification"
  | "report"
  | "certificate"
  | "import"
  | "export"
  | "webhook"
  | "generic";

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface QueueJob {
  id: string;
  type: JobType;
  status: JobStatus;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  attempts: number;
  maxAttempts: number;
  lastError: string | null;
  scheduledAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export type ImportExportKind =
  | "students"
  | "instructors"
  | "courses"
  | "questions"
  | "communities";

export type ExportFormat = "csv" | "json" | "xlsx" | "pdf";

export interface ImportJob {
  id: string;
  kind: ImportExportKind;
  status: JobStatus;
  filename: string;
  rowCount: number;
  successCount: number;
  errorCount: number;
  errors: string[];
  createdBy: string | null;
  createdAt: string;
  finishedAt: string | null;
}

export interface ExportJob {
  id: string;
  kind: ImportExportKind | "reports" | "users" | "analytics";
  format: ExportFormat;
  status: JobStatus;
  downloadPath: string | null;
  createdBy: string | null;
  createdAt: string;
  finishedAt: string | null;
}

export interface ApiRequestLog {
  id: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  userId: string | null;
  apiKeyId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  error: string | null;
  createdAt: string;
}

export interface CacheMetaEntry {
  key: string;
  tags: string[];
  expiresAt: string;
  createdAt: string;
}

export interface ApiPlatformDatabase {
  apiKeys: ApiKeyRecord[];
  refreshTokens: RefreshTokenRecord[];
  webhookEndpoints: WebhookEndpoint[];
  webhookDeliveries: WebhookDelivery[];
  integrations: IntegrationSetting[];
  queueJobs: QueueJob[];
  importJobs: ImportJob[];
  exportJobs: ExportJob[];
  apiLogs: ApiRequestLog[];
  cacheMeta: CacheMetaEntry[];
  oauthClients: Array<{
    id: string;
    name: string;
    clientId: string;
    clientSecretHash: string;
    redirectUris: string[];
    createdAt: string;
  }>;
  seeded: boolean;
}
