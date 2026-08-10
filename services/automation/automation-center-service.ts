/**
 * Super Admin Automation Center (CR010)
 * Single control plane over courses, Zoom, schedule, payments, CGI, mock exams, etc.
 */

import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { ROLES } from "@/constants/roles";
import { logActivity } from "@/services/auth/activity-log";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { readAssignmentDb, updateAssignmentEngineSettings } from "@/services/assignment/store";
import {
  getAutomationMeta,
  isDomainEnabled,
  setDomainEnabled,
  touchAutomationConfigured,
} from "@/services/automation/automation-store";
import { getBookingSettings, updateBookingSettings } from "@/services/bookings/booking-service";
import { getDefaultTemplate, listTemplates } from "@/services/certificates/template-service";
import {
  getJourneySettings,
  listAtplCourses,
  updateJourneySettings,
} from "@/services/cgi/journey-service";
import { getEmailAutomationOverview } from "@/services/email/automation-service";
import { isEmailDeliveryConfigured } from "@/services/email/mailer";
import { getMockExamSettings, updateMockExamSettings } from "@/services/mock-exams/booking-service";
import { getPaymentSettings, updatePaymentSettings } from "@/services/payments/catalog-service";
import {
  getPlatformSettings,
  isFeatureEnabled,
  updatePlatformSettings,
} from "@/services/settings/settings-service";
import type {
  AutomationCenterOverview,
  AutomationConfigureInput,
  AutomationControl,
  AutomationDomainCard,
} from "@/types/automation-center";
import { AUTOMATION_DOMAINS } from "@/types/automation-center";
import type { UserProfile } from "@/types";

export class AutomationCenterError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "AutomationCenterError";
    this.status = status;
  }
}

function boolControl(key: string, label: string, value: boolean, help?: string): AutomationControl {
  return { key, label, type: "boolean", value, help };
}

function numControl(key: string, label: string, value: number, help?: string): AutomationControl {
  return { key, label, type: "number", value, help };
}

function strControl(key: string, label: string, value: string, help?: string): AutomationControl {
  return { key, label, type: "string", value, help };
}

function selectControl(
  key: string,
  label: string,
  value: string,
  options: Array<{ value: string; label: string }>,
  help?: string,
): AutomationControl {
  return { key, label, type: "select", value, options, help };
}

function asBool(v: unknown, fallback: boolean): boolean {
  if (typeof v === "boolean") return v;
  if (v === "true" || v === 1 || v === "1") return true;
  if (v === "false" || v === 0 || v === "0") return false;
  return fallback;
}

function asNum(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asStr(v: unknown, fallback: string): string {
  if (v === null || v === undefined) return fallback;
  return String(v);
}

function buildDomainCards(): AutomationDomainCard[] {
  const platform = getPlatformSettings();
  const payments = getPaymentSettings();
  const mock = getMockExamSettings();
  const bookings = getBookingSettings();
  const cgi = getJourneySettings();
  const assignment = readAssignmentDb().settings;
  const email = getEmailAutomationOverview();
  const atplCourses = listAtplCourses();
  const certDefault = getDefaultTemplate();
  const instructorCount = readAuthDb().users.filter(
    (u) => u.role === ROLES.INSTRUCTOR && u.status === "active",
  ).length;

  const cards: AutomationDomainCard[] = [
    {
      id: "courses",
      label: "Course types & catalog",
      description:
        "Master switch for courses and public catalog delivery filter (recorded / live).",
      enabled: isDomainEnabled("courses") && isFeatureEnabled("courses"),
      href: "/super-admin/courses",
      statusLabel: `Catalog filter: ${platform.courses.publicDeliveryFilter}`,
      controls: [
        boolControl("featureEnabled", "Courses module", isFeatureEnabled("courses")),
        selectControl(
          "publicDeliveryFilter",
          "Public delivery filter",
          platform.courses.publicDeliveryFilter,
          [
            { value: "all", label: "All" },
            { value: "recorded", label: "Recorded only" },
            { value: "live", label: "Live only" },
          ],
        ),
      ],
    },
    {
      id: "publishing",
      label: "Publishing",
      description:
        "Draft / publish / schedule visibility — open the publishing console for bulk ops.",
      enabled: isDomainEnabled("publishing") && isFeatureEnabled("courses"),
      href: "/super-admin/courses/publishing",
      statusLabel: "Publishing console",
      controls: [boolControl("domainEnabled", "Publishing tools", isDomainEnabled("publishing"))],
    },
    {
      id: "instructors",
      label: "Instructors",
      description: "Instructor accounts, approval policy, and bookable instructor pool size.",
      enabled: isDomainEnabled("instructors"),
      href: "/super-admin/instructors",
      statusLabel: `${instructorCount} active instructors`,
      controls: [
        boolControl(
          "instructorApprovalRequired",
          "Require instructor approval",
          platform.users.instructorApprovalRequired,
        ),
        boolControl(
          "studentApprovalRequired",
          "Require student approval",
          platform.users.studentApprovalRequired,
        ),
        boolControl(
          "emailVerificationRequired",
          "Require email verification",
          platform.users.emailVerificationRequired,
        ),
      ],
    },
    {
      id: "zoom",
      label: "Zoom",
      description: "Platform Zoom defaults used by live classes, bookings, and mock exams.",
      enabled: isDomainEnabled("zoom") && isFeatureEnabled("zoom") && platform.zoom.enabled,
      href: "/super-admin/settings",
      statusLabel: platform.zoom.credentialsConfigured
        ? "Credentials configured"
        : "Mock / outbox mode",
      controls: [
        boolControl("featureEnabled", "Zoom feature flag", isFeatureEnabled("zoom")),
        boolControl("enabled", "Zoom integration", platform.zoom.enabled),
        boolControl("defaultWaitingRoom", "Default waiting room", platform.zoom.defaultWaitingRoom),
        boolControl("defaultPasscode", "Default passcode", platform.zoom.defaultPasscode),
        selectControl(
          "defaultMeetingType",
          "Default meeting type",
          platform.zoom.defaultMeetingType,
          [
            { value: "meeting", label: "Meeting" },
            { value: "webinar", label: "Webinar" },
          ],
        ),
      ],
    },
    {
      id: "schedule",
      label: "Schedules",
      description: "Live + ATPL schedule automation, class reminder offsets, and schedule hub.",
      enabled: isDomainEnabled("schedule") && isFeatureEnabled("schedule"),
      href: "/admin/schedule",
      statusLabel: `Reminders: ${platform.notifications.classReminderOffsetsMinutes.join(", ")} min`,
      controls: [
        boolControl("featureEnabled", "Schedule module", isFeatureEnabled("schedule")),
        boolControl(
          "reminderEmails",
          "Class reminder emails",
          platform.notifications.reminderEmails,
        ),
        boolControl(
          "classReminderFifteenMinutesEnabled",
          "15-minute reminders",
          platform.notifications.classReminderFifteenMinutesEnabled,
        ),
        strControl(
          "classReminderOffsetsMinutes",
          "Reminder offsets (minutes, comma-separated)",
          platform.notifications.classReminderOffsetsMinutes.join(","),
        ),
      ],
    },
    {
      id: "payments",
      label: "Payments",
      description: "Checkout, tax, platform fee, and wallet-related payment settings.",
      enabled: isDomainEnabled("payments") && isFeatureEnabled("payments"),
      href: "/super-admin/payments",
      statusLabel: `${payments.provider} · ${payments.currency}`,
      controls: [
        boolControl("featureEnabled", "Payments module", isFeatureEnabled("payments")),
        numControl("taxRatePercent", "Tax %", payments.taxRatePercent),
        numControl("platformFeePercent", "Platform fee %", payments.platformFeePercent),
        boolControl("allowApplePay", "Apple Pay", payments.allowApplePay),
        boolControl("allowGooglePay", "Google Pay", payments.allowGooglePay),
      ],
    },
    {
      id: "installments",
      label: "Installments",
      description: "BNPL / installment plans, grace days, auto-suspend, and reminder cadence.",
      enabled: isDomainEnabled("installments") && isFeatureEnabled("installments"),
      href: "/super-admin/payments",
      statusLabel: `${payments.defaultInstallmentCount} installments · grace ${payments.installmentGraceDays}d`,
      controls: [
        boolControl("featureEnabled", "Installments module", isFeatureEnabled("installments")),
        numControl(
          "defaultInstallmentCount",
          "Default installment count",
          payments.defaultInstallmentCount,
        ),
        numControl("installmentGraceDays", "Grace days", payments.installmentGraceDays),
        boolControl(
          "autoSuspendOnOverdue",
          "Auto-suspend on overdue",
          payments.autoSuspendOnOverdue,
        ),
        strControl(
          "installmentReminderOffsetsDays",
          "Reminder offsets (days, comma-separated)",
          payments.installmentReminderOffsetsDays.join(","),
        ),
      ],
    },
    {
      id: "messaging",
      label: "Messages",
      description: "In-app messaging and communities feature gates.",
      enabled: isDomainEnabled("messaging") && isFeatureEnabled("messaging"),
      href: "/super-admin/messages",
      statusLabel: isFeatureEnabled("communities") ? "Communities on" : "Communities off",
      controls: [
        boolControl("featureEnabled", "Messaging module", isFeatureEnabled("messaging")),
        boolControl("communities", "Communities", isFeatureEnabled("communities")),
        boolControl(
          "inAppNotifications",
          "In-app notifications",
          platform.notifications.inAppNotifications,
        ),
      ],
    },
    {
      id: "email",
      label: "Email automation",
      description:
        "Lifecycle email events (registration, payment, schedule, certificates, alerts).",
      enabled: isDomainEnabled("email") && isFeatureEnabled("emailAutomation"),
      href: "/super-admin/email",
      statusLabel: `${email.stats.sent} sent · ${email.catalog.filter((c) => c.enabled !== false).length}/14 events`,
      controls: [
        boolControl(
          "featureEnabled",
          "Email automation module",
          isFeatureEnabled("emailAutomation"),
        ),
        boolControl(
          "emailNotifications",
          "Outbound email notifications",
          platform.notifications.emailNotifications,
        ),
        boolControl("systemAlerts", "System alert emails", platform.notifications.systemAlerts),
      ],
    },
    {
      id: "certificates",
      label: "Certificates",
      description: "Certificate module gate and default template used for issuance.",
      enabled: isDomainEnabled("certificates") && isFeatureEnabled("certificates"),
      href: "/super-admin/certificates",
      statusLabel: certDefault
        ? `Default template: ${certDefault.name}`
        : `${listTemplates().length} templates`,
      controls: [
        boolControl("featureEnabled", "Certificates module", isFeatureEnabled("certificates")),
      ],
    },
    {
      id: "reports",
      label: "Reports",
      description: "Analytics, certificate reports, and post-lecture performance reports.",
      enabled: isDomainEnabled("reports") && isFeatureEnabled("reports"),
      href: "/super-admin/reports",
      statusLabel: "Reports console",
      controls: [boolControl("featureEnabled", "Reports module", isFeatureEnabled("reports"))],
    },
    {
      id: "cgi",
      label: "Chief Ground Instructor",
      description: "ATPL journey package SKU and default first subject — no code changes required.",
      enabled: isDomainEnabled("cgi") && isFeatureEnabled("cgi"),
      href: "/cgi/dashboard",
      statusLabel: `SKU ${cgi.packageSku}${
        cgi.defaultFirstSubjectCourseId
          ? ` · first ${atplCourses.find((c) => c.id === cgi.defaultFirstSubjectCourseId)?.code ?? "set"}`
          : ""
      }`,
      controls: [
        boolControl("featureEnabled", "CGI module", isFeatureEnabled("cgi")),
        strControl("packageSku", "ATPL package SKU", cgi.packageSku),
        selectControl(
          "defaultFirstSubjectCourseId",
          "Default first subject",
          cgi.defaultFirstSubjectCourseId ?? "__unset__",
          [
            { value: "__unset__", label: "Unset (use package order)" },
            ...atplCourses.map((c) => ({ value: c.id, label: `${c.code} — ${c.title}` })),
          ],
        ),
      ],
    },
    {
      id: "assignment",
      label: "Instructor assignment engine",
      description:
        "Auto Zoom, look-ahead window, slot step, and queue attempts for ATPL scheduling.",
      enabled: isDomainEnabled("assignment") && isFeatureEnabled("cgi"),
      href: "/cgi/assignment",
      statusLabel: `Look-ahead ${assignment.lookAheadDays}d · step ${assignment.slotStepMinutes}m`,
      controls: [
        boolControl("autoZoom", "Auto-create Zoom", assignment.autoZoom),
        numControl("lookAheadDays", "Look-ahead days", assignment.lookAheadDays),
        numControl("slotStepMinutes", "Slot step (minutes)", assignment.slotStepMinutes),
        numControl(
          "defaultDurationMinutes",
          "Default duration (minutes)",
          assignment.defaultDurationMinutes,
        ),
        numControl("maxQueueAttempts", "Max queue attempts", assignment.maxQueueAttempts),
      ],
    },
    {
      id: "mock_exams",
      label: "Mock exams",
      description: "Invigilated mock exam booking, pricing mode, Zoom, and certificate auto-issue.",
      enabled: isDomainEnabled("mock_exams") && isFeatureEnabled("mockExams") && mock.enabled,
      href: "/super-admin/mock-exams",
      statusLabel: mock.enabled ? `${mock.pricingMode} pricing` : "Disabled",
      controls: [
        boolControl("featureEnabled", "Mock exams module", isFeatureEnabled("mockExams")),
        boolControl("enabled", "Mock exam booking", mock.enabled),
        selectControl("pricingMode", "Pricing mode", mock.pricingMode, [
          { value: "fixed", label: "Fixed" },
          { value: "dynamic", label: "Dynamic" },
        ]),
        boolControl("autoCreateZoom", "Auto Zoom", mock.autoCreateZoom),
        boolControl("autoIssueCertificate", "Auto-issue certificate", mock.autoIssueCertificate),
      ],
    },
    {
      id: "bookings",
      label: "1:1 bookings",
      description: "Guest booking, confirmation, Zoom, and advance booking window.",
      enabled: isDomainEnabled("bookings") && bookings.enabled,
      href: "/super-admin/bookings",
      statusLabel: bookings.enabled ? "Bookings open" : "Bookings closed",
      controls: [
        boolControl("enabled", "Bookings enabled", bookings.enabled),
        boolControl("allowGuestBooking", "Allow guest booking", bookings.allowGuestBooking),
        boolControl("requireConfirmation", "Require confirmation", bookings.requireConfirmation),
        boolControl("autoCreateZoom", "Auto Zoom", bookings.autoCreateZoom),
        numControl("maxAdvanceDays", "Max advance days", bookings.maxAdvanceDays),
      ],
    },
  ];

  return cards;
}

export function getAutomationCenterOverview(): AutomationCenterOverview {
  const domains = buildDomainCards();
  const platform = getPlatformSettings();
  const meta = getAutomationMeta();
  return {
    domains,
    platform: {
      maintenanceMode: platform.general.maintenanceMode,
      platformStatus: platform.general.platformStatus,
      emailNotifications: platform.notifications.emailNotifications,
      smtpConfigured: isEmailDeliveryConfigured(),
    },
    stats: {
      domainsEnabled: domains.filter((d) => d.enabled).length,
      domainsTotal: domains.length,
      lastConfiguredAt: meta.lastConfiguredAt,
    },
  };
}

export async function configureAutomationDomain(
  input: AutomationConfigureInput,
): Promise<AutomationCenterOverview> {
  if (!(AUTOMATION_DOMAINS as readonly string[]).includes(input.domain)) {
    throw new AutomationCenterError(`Unknown domain: ${input.domain}`);
  }

  const patch = input.patch;
  const actor = readAuthDb().users.find((u) => u.id === input.actorId);
  if (!actor) throw new AutomationCenterError("Actor not found", 404);
  const user = toUserProfile(actor);

  if (patch.domainEnabled !== undefined) {
    setDomainEnabled(input.domain, asBool(patch.domainEnabled, true), input.actorId);
  }

  switch (input.domain) {
    case "courses":
      await patchCourses(user, patch, input.actorId);
      break;
    case "publishing":
      if (patch.domainEnabled !== undefined) {
        /* domain toggle only */
      }
      break;
    case "instructors":
      await updatePlatformSettings({
        actorId: input.actorId,
        patch: {
          users: {
            ...getPlatformSettings().users,
            ...(patch.instructorApprovalRequired !== undefined
              ? {
                  instructorApprovalRequired: asBool(
                    patch.instructorApprovalRequired,
                    getPlatformSettings().users.instructorApprovalRequired,
                  ),
                }
              : {}),
            ...(patch.studentApprovalRequired !== undefined
              ? {
                  studentApprovalRequired: asBool(
                    patch.studentApprovalRequired,
                    getPlatformSettings().users.studentApprovalRequired,
                  ),
                }
              : {}),
            ...(patch.emailVerificationRequired !== undefined
              ? {
                  emailVerificationRequired: asBool(
                    patch.emailVerificationRequired,
                    getPlatformSettings().users.emailVerificationRequired,
                  ),
                }
              : {}),
          },
        },
      });
      break;
    case "zoom":
      await patchZoom(input.actorId, patch);
      break;
    case "schedule":
      await patchSchedule(input.actorId, patch);
      break;
    case "payments":
      await patchPayments(user, patch, input.actorId, "payments");
      break;
    case "installments":
      await patchPayments(user, patch, input.actorId, "installments");
      break;
    case "messaging":
      await patchMessaging(input.actorId, patch);
      break;
    case "email":
      await patchEmail(input.actorId, patch);
      break;
    case "certificates":
      if (patch.featureEnabled !== undefined) {
        await updatePlatformSettings({
          actorId: input.actorId,
          patch: {
            features: {
              ...getPlatformSettings().features,
              certificates: asBool(patch.featureEnabled, true),
            },
          },
        });
      }
      break;
    case "reports":
      if (patch.featureEnabled !== undefined) {
        await updatePlatformSettings({
          actorId: input.actorId,
          patch: {
            features: {
              ...getPlatformSettings().features,
              reports: asBool(patch.featureEnabled, true),
            },
          },
        });
      }
      break;
    case "cgi":
      await patchCgi(input.actorId, patch);
      break;
    case "assignment":
      patchAssignment(patch);
      break;
    case "mock_exams":
      await patchMockExams(input.actorId, patch);
      break;
    case "bookings":
      await patchBookings(user, patch);
      break;
    default:
      break;
  }

  touchAutomationConfigured(input.actorId);
  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.AUTOMATION_CENTER_CONFIGURED,
    entityType: "automation_center",
    entityId: input.domain,
    metadata: { domain: input.domain, keys: Object.keys(patch) },
  });

  return getAutomationCenterOverview();
}

async function patchCourses(
  _user: UserProfile,
  patch: Record<string, string | number | boolean | null>,
  actorId: string,
) {
  const current = getPlatformSettings();
  await updatePlatformSettings({
    actorId,
    patch: {
      ...(patch.featureEnabled !== undefined
        ? {
            features: {
              ...current.features,
              courses: asBool(patch.featureEnabled, current.features.courses),
            },
          }
        : {}),
      ...(patch.publicDeliveryFilter !== undefined
        ? {
            courses: {
              publicDeliveryFilter: asStr(
                patch.publicDeliveryFilter,
                current.courses.publicDeliveryFilter,
              ) as "all" | "recorded" | "live",
            },
          }
        : {}),
    },
  });
  if (patch.featureEnabled !== undefined) {
    setDomainEnabled("courses", asBool(patch.featureEnabled, true), actorId);
  }
}

async function patchZoom(actorId: string, patch: Record<string, string | number | boolean | null>) {
  const current = getPlatformSettings();
  await updatePlatformSettings({
    actorId,
    patch: {
      ...(patch.featureEnabled !== undefined
        ? {
            features: {
              ...current.features,
              zoom: asBool(patch.featureEnabled, current.features.zoom),
            },
          }
        : {}),
      zoom: {
        ...current.zoom,
        ...(patch.enabled !== undefined
          ? { enabled: asBool(patch.enabled, current.zoom.enabled) }
          : {}),
        ...(patch.defaultWaitingRoom !== undefined
          ? {
              defaultWaitingRoom: asBool(patch.defaultWaitingRoom, current.zoom.defaultWaitingRoom),
            }
          : {}),
        ...(patch.defaultPasscode !== undefined
          ? { defaultPasscode: asBool(patch.defaultPasscode, current.zoom.defaultPasscode) }
          : {}),
        ...(patch.defaultMeetingType !== undefined
          ? {
              defaultMeetingType: asStr(
                patch.defaultMeetingType,
                current.zoom.defaultMeetingType,
              ) as "meeting" | "webinar",
            }
          : {}),
      },
    },
  });
}

async function patchSchedule(
  actorId: string,
  patch: Record<string, string | number | boolean | null>,
) {
  const current = getPlatformSettings();
  let offsets = current.notifications.classReminderOffsetsMinutes;
  if (patch.classReminderOffsetsMinutes !== undefined) {
    offsets = asStr(patch.classReminderOffsetsMinutes, "")
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (!offsets.length) offsets = current.notifications.classReminderOffsetsMinutes;
  }
  await updatePlatformSettings({
    actorId,
    patch: {
      ...(patch.featureEnabled !== undefined
        ? {
            features: {
              ...current.features,
              schedule: asBool(patch.featureEnabled, current.features.schedule),
            },
          }
        : {}),
      notifications: {
        ...current.notifications,
        ...(patch.reminderEmails !== undefined
          ? { reminderEmails: asBool(patch.reminderEmails, current.notifications.reminderEmails) }
          : {}),
        ...(patch.classReminderFifteenMinutesEnabled !== undefined
          ? {
              classReminderFifteenMinutesEnabled: asBool(
                patch.classReminderFifteenMinutesEnabled,
                current.notifications.classReminderFifteenMinutesEnabled,
              ),
            }
          : {}),
        classReminderOffsetsMinutes: offsets,
      },
    },
  });
}

async function patchPayments(
  user: UserProfile,
  patch: Record<string, string | number | boolean | null>,
  actorId: string,
  mode: "payments" | "installments",
) {
  const current = getPlatformSettings();
  if (patch.featureEnabled !== undefined) {
    await updatePlatformSettings({
      actorId,
      patch: {
        features: {
          ...current.features,
          ...(mode === "payments"
            ? { payments: asBool(patch.featureEnabled, current.features.payments) }
            : { installments: asBool(patch.featureEnabled, current.features.installments) }),
        },
      },
    });
  }

  const pay = getPaymentSettings();
  const payPatch: Partial<ReturnType<typeof getPaymentSettings>> = {};
  if (mode === "payments") {
    if (patch.taxRatePercent !== undefined)
      payPatch.taxRatePercent = asNum(patch.taxRatePercent, pay.taxRatePercent);
    if (patch.platformFeePercent !== undefined)
      payPatch.platformFeePercent = asNum(patch.platformFeePercent, pay.platformFeePercent);
    if (patch.allowApplePay !== undefined)
      payPatch.allowApplePay = asBool(patch.allowApplePay, pay.allowApplePay);
    if (patch.allowGooglePay !== undefined)
      payPatch.allowGooglePay = asBool(patch.allowGooglePay, pay.allowGooglePay);
  } else {
    if (patch.defaultInstallmentCount !== undefined)
      payPatch.defaultInstallmentCount = Math.max(
        1,
        asNum(patch.defaultInstallmentCount, pay.defaultInstallmentCount),
      );
    if (patch.installmentGraceDays !== undefined)
      payPatch.installmentGraceDays = Math.max(
        0,
        asNum(patch.installmentGraceDays, pay.installmentGraceDays),
      );
    if (patch.autoSuspendOnOverdue !== undefined)
      payPatch.autoSuspendOnOverdue = asBool(patch.autoSuspendOnOverdue, pay.autoSuspendOnOverdue);
    if (patch.installmentReminderOffsetsDays !== undefined) {
      const days = asStr(patch.installmentReminderOffsetsDays, "")
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n));
      if (days.length) payPatch.installmentReminderOffsetsDays = days;
    }
  }
  if (Object.keys(payPatch).length) updatePaymentSettings(user, payPatch);
}

async function patchMessaging(
  actorId: string,
  patch: Record<string, string | number | boolean | null>,
) {
  const current = getPlatformSettings();
  await updatePlatformSettings({
    actorId,
    patch: {
      features: {
        ...current.features,
        ...(patch.featureEnabled !== undefined
          ? { messaging: asBool(patch.featureEnabled, current.features.messaging) }
          : {}),
        ...(patch.communities !== undefined
          ? { communities: asBool(patch.communities, current.features.communities) }
          : {}),
      },
      ...(patch.inAppNotifications !== undefined
        ? {
            notifications: {
              ...current.notifications,
              inAppNotifications: asBool(
                patch.inAppNotifications,
                current.notifications.inAppNotifications,
              ),
            },
          }
        : {}),
    },
  });
}

async function patchEmail(
  actorId: string,
  patch: Record<string, string | number | boolean | null>,
) {
  const current = getPlatformSettings();
  await updatePlatformSettings({
    actorId,
    patch: {
      ...(patch.featureEnabled !== undefined
        ? {
            features: {
              ...current.features,
              emailAutomation: asBool(patch.featureEnabled, current.features.emailAutomation),
            },
          }
        : {}),
      notifications: {
        ...current.notifications,
        ...(patch.emailNotifications !== undefined
          ? {
              emailNotifications: asBool(
                patch.emailNotifications,
                current.notifications.emailNotifications,
              ),
            }
          : {}),
        ...(patch.systemAlerts !== undefined
          ? { systemAlerts: asBool(patch.systemAlerts, current.notifications.systemAlerts) }
          : {}),
      },
    },
  });
}

async function patchCgi(actorId: string, patch: Record<string, string | number | boolean | null>) {
  const current = getPlatformSettings();
  if (patch.featureEnabled !== undefined) {
    await updatePlatformSettings({
      actorId,
      patch: {
        features: {
          ...current.features,
          cgi: asBool(patch.featureEnabled, current.features.cgi),
        },
      },
    });
  }
  const journeyPatch: Partial<{ defaultFirstSubjectCourseId: string | null; packageSku: string }> =
    {};
  if (patch.packageSku !== undefined) journeyPatch.packageSku = asStr(patch.packageSku, "");
  if (patch.defaultFirstSubjectCourseId !== undefined) {
    const v = asStr(patch.defaultFirstSubjectCourseId, "");
    journeyPatch.defaultFirstSubjectCourseId = !v || v === "__unset__" ? null : v;
  }
  if (Object.keys(journeyPatch).length) {
    updateJourneySettings({ patch: journeyPatch, actorId });
  }
}

function patchAssignment(patch: Record<string, string | number | boolean | null>) {
  const current = readAssignmentDb().settings;
  updateAssignmentEngineSettings({
    ...(patch.autoZoom !== undefined ? { autoZoom: asBool(patch.autoZoom, current.autoZoom) } : {}),
    ...(patch.lookAheadDays !== undefined
      ? { lookAheadDays: Math.max(1, asNum(patch.lookAheadDays, current.lookAheadDays)) }
      : {}),
    ...(patch.slotStepMinutes !== undefined
      ? { slotStepMinutes: Math.max(5, asNum(patch.slotStepMinutes, current.slotStepMinutes)) }
      : {}),
    ...(patch.defaultDurationMinutes !== undefined
      ? {
          defaultDurationMinutes: Math.max(
            15,
            asNum(patch.defaultDurationMinutes, current.defaultDurationMinutes),
          ),
        }
      : {}),
    ...(patch.maxQueueAttempts !== undefined
      ? {
          maxQueueAttempts: Math.max(1, asNum(patch.maxQueueAttempts, current.maxQueueAttempts)),
        }
      : {}),
  });
}

async function patchMockExams(
  actorId: string,
  patch: Record<string, string | number | boolean | null>,
) {
  const current = getPlatformSettings();
  if (patch.featureEnabled !== undefined) {
    await updatePlatformSettings({
      actorId,
      patch: {
        features: {
          ...current.features,
          mockExams: asBool(patch.featureEnabled, current.features.mockExams),
        },
      },
    });
  }
  const mock = getMockExamSettings();
  updateMockExamSettings({
    ...(patch.enabled !== undefined ? { enabled: asBool(patch.enabled, mock.enabled) } : {}),
    ...(patch.pricingMode !== undefined
      ? { pricingMode: asStr(patch.pricingMode, mock.pricingMode) as "fixed" | "dynamic" }
      : {}),
    ...(patch.autoCreateZoom !== undefined
      ? { autoCreateZoom: asBool(patch.autoCreateZoom, mock.autoCreateZoom) }
      : {}),
    ...(patch.autoIssueCertificate !== undefined
      ? {
          autoIssueCertificate: asBool(patch.autoIssueCertificate, mock.autoIssueCertificate),
        }
      : {}),
  });
}

async function patchBookings(
  user: UserProfile,
  patch: Record<string, string | number | boolean | null>,
) {
  const bookings = getBookingSettings();
  await updateBookingSettings({
    user,
    patch: {
      ...(patch.enabled !== undefined ? { enabled: asBool(patch.enabled, bookings.enabled) } : {}),
      ...(patch.allowGuestBooking !== undefined
        ? { allowGuestBooking: asBool(patch.allowGuestBooking, bookings.allowGuestBooking) }
        : {}),
      ...(patch.requireConfirmation !== undefined
        ? {
            requireConfirmation: asBool(patch.requireConfirmation, bookings.requireConfirmation),
          }
        : {}),
      ...(patch.autoCreateZoom !== undefined
        ? { autoCreateZoom: asBool(patch.autoCreateZoom, bookings.autoCreateZoom) }
        : {}),
      ...(patch.maxAdvanceDays !== undefined
        ? { maxAdvanceDays: Math.max(1, asNum(patch.maxAdvanceDays, bookings.maxAdvanceDays)) }
        : {}),
    },
  });
}

export async function setPlatformMaintenance(input: { maintenanceMode: boolean; actorId: string }) {
  const current = getPlatformSettings();
  await updatePlatformSettings({
    actorId: input.actorId,
    patch: {
      general: {
        ...current.general,
        maintenanceMode: input.maintenanceMode,
        platformStatus: input.maintenanceMode ? "maintenance" : "online",
      },
    },
  });
  touchAutomationConfigured(input.actorId);
  return getAutomationCenterOverview();
}
