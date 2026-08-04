/**
 * Platform settings — typed configuration categories.
 * Defaults reflect ATPL PASS company information.
 * Pending brand guidelines (palette/typography) can be updated here without code rewrites.
 */

export type SettingsCategory =
  | "general"
  | "branding"
  | "email"
  | "notifications"
  | "authentication"
  | "users"
  | "security"
  | "storage"
  | "localization"
  | "features"
  | "zoom";

export interface GeneralSettings {
  platformName: string;
  companyName: string;
  websiteUrl: string;
  contactEmail: string;
  contactPhone: string;
  supportEmail: string;
  defaultTimezone: string;
  defaultLanguage: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  currency: string;
  country: string;
  maintenanceMode: boolean;
  platformStatus: "online" | "maintenance" | "degraded";
  primaryLocations: string[];
  footerText: string;
  socialHandle: string;
  socialLinks: {
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
  };
}

export interface BrandingSettings {
  logoUrl: string;
  darkLogoUrl: string;
  faviconUrl: string;
  loginBackgroundUrl: string;
  loginIllustrationUrl: string;
  openGraphImageUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  typographyDisplay: string;
  typographyBody: string;
  footerInformation: string;
  /** Pending until client delivers official brand guidelines */
  brandGuidelinesPending: boolean;
  colorPalettePending: boolean;
  typographyPending: boolean;
  styleGuidePending: boolean;
}

export interface EmailSettings {
  provider: "smtp" | "sendgrid" | "mailgun" | "ses" | "resend";
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  encryption: "none" | "tls" | "ssl";
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  reminderEmails: boolean;
  marketingEmails: boolean;
  systemAlerts: boolean;
  /** Class reminder offsets (minutes before start) — Super Admin configurable */
  classReminderOffsetsMinutes: number[];
  classReminderFifteenMinutesEnabled: boolean;
}

export interface ZoomIntegrationSettings {
  /** When true and credentials present, call Zoom API; otherwise mock */
  enabled: boolean;
  accountEmail: string;
  defaultWaitingRoom: boolean;
  defaultPasscode: boolean;
  defaultMeetingType: "meeting" | "webinar";
  /** Never returned to clients — server-only mirror of env readiness */
  credentialsConfigured: boolean;
}

export interface AuthenticationSettings {
  otpExpirationMinutes: number;
  passwordPolicyEnabled: boolean;
  minimumPasswordLength: number;
  requireUppercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
  sessionTimeoutMinutes: number;
  rememberMeDays: number;
  maxLoginAttempts: number;
  accountLockDurationMinutes: number;
}

export interface UserManagementSettings {
  defaultUserRole: "student" | "instructor";
  instructorApprovalRequired: boolean;
  studentApprovalRequired: boolean;
  emailVerificationRequired: boolean;
  phoneVerificationRequired: boolean;
}

export interface SecuritySettings {
  rateLimitingEnabled: boolean;
  rateLimitRequestsPerMinute: number;
  ipBlockingEnabled: boolean;
  blockedIps: string[];
  trustedDomains: string[];
  allowedFileTypes: string[];
  maxUploadSizeMb: number;
  twoFactorAuthEnabled: boolean;
  twoFactorAuthReady: boolean;
}

export interface StorageSettings {
  provider: "local" | "supabase";
  supabaseBucket: string;
  allowedExtensions: string[];
  storageQuotaGb: number;
  automaticCleanupEnabled: boolean;
  cleanupOlderThanDays: number;
}

export interface LocalizationSettings {
  timezone: string;
  country: string;
  language: string;
  regionalFormatting: string;
  availableLanguages: string[];
  /** V1: English only */
  englishOnly: boolean;
}

export interface FeatureFlags {
  blog: boolean;
  communities: boolean;
  certificates: boolean;
  payments: boolean;
  zoom: boolean;
  advertisements: boolean;
  wallet: boolean;
  courses: boolean;
  calendar: boolean;
  ai: boolean;
  /** Phase 2 — default off until contracted delivery */
  mobileApps: boolean;
  corporatePortal: boolean;
  multiTenant: boolean;
  aiProctoring: boolean;
  learningPaths: boolean;
  crmIntegration: boolean;
  erpIntegration: boolean;
  marketingAutomation: boolean;
  enterpriseSso: boolean;
  i18n: boolean;
  whiteLabel: boolean;
  biPredictive: boolean;
}

export interface PlatformSettings {
  general: GeneralSettings;
  branding: BrandingSettings;
  email: EmailSettings;
  notifications: NotificationSettings;
  authentication: AuthenticationSettings;
  users: UserManagementSettings;
  security: SecuritySettings;
  storage: StorageSettings;
  localization: LocalizationSettings;
  features: FeatureFlags;
  zoom: ZoomIntegrationSettings;
  updatedAt: string;
  updatedBy: string | null;
}

export interface SettingChangeRecord {
  id: string;
  category: SettingsCategory | "all";
  actorId: string | null;
  before: unknown;
  after: unknown;
  createdAt: string;
}

export const SETTINGS_CATEGORIES: {
  id: SettingsCategory;
  label: string;
  description: string;
}[] = [
  { id: "general", label: "General", description: "Platform identity and contact details" },
  { id: "branding", label: "Branding", description: "Logo, colors, and visual identity" },
  { id: "email", label: "Email", description: "SMTP and outbound email providers" },
  { id: "notifications", label: "Notifications", description: "Global notification channels" },
  { id: "authentication", label: "Authentication", description: "OTP, passwords, and sessions" },
  { id: "users", label: "Users", description: "Registration and approval policies" },
  { id: "security", label: "Security", description: "Rate limits, uploads, and IP controls" },
  { id: "storage", label: "Storage", description: "File storage provider and quotas" },
  { id: "localization", label: "Localization", description: "Language, timezone, and formats" },
  { id: "features", label: "Feature flags", description: "Enable or disable platform modules" },
  { id: "zoom", label: "Zoom", description: "Live class meeting defaults (credentials via env)" },
];
