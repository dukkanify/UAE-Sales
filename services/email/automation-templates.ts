/**
 * CR009 — branded templates for every automation event.
 */

import { renderBrandedEmail } from "@/services/settings/email-templates";
import type { EmailAutomationEvent } from "@/types/email-automation";

function str(data: Record<string, unknown>, key: string, fallback = ""): string {
  const v = data[key];
  if (v === null || v === undefined) return fallback;
  return String(v);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderAutomationTemplate(
  event: EmailAutomationEvent,
  data: Record<string, unknown>,
  subjectOverride?: string,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(str(data, "recipientName", "Aviator"));
  const title = escapeHtml(str(data, "title", ""));
  const detail = escapeHtml(str(data, "detail", ""));
  const when = escapeHtml(str(data, "when", ""));
  const amount = escapeHtml(str(data, "amountLabel", ""));
  const reference = escapeHtml(str(data, "reference", ""));
  const cta = escapeHtml(str(data, "cta", "Open AviatorPass"));

  let payload: { title: string; preheader?: string; bodyHtml: string };

  switch (event) {
    case "registration":
      payload = {
        title: subjectOverride ?? "Welcome to AviatorPass",
        preheader: "Your account is ready.",
        bodyHtml: `<p>Hello ${name},</p>
          <p>Welcome aboard. Your AviatorPass account is verified and ready.</p>
          <p>${detail || "Explore courses, book sessions, and track your ATPL journey from your dashboard."}</p>
          <p>${cta} to get started.</p>`,
      };
      break;
    case "payment":
      payload = {
        title: subjectOverride ?? str(data, "title", "Payment update"),
        preheader: amount || detail,
        bodyHtml: `<p>Hello ${name},</p>
          <p><strong>${escapeHtml(str(data, "title", "Payment update"))}</strong></p>
          <p>${detail}</p>
          ${amount ? `<p>Amount: <strong>${amount}</strong></p>` : ""}
          ${reference ? `<p>Reference: ${reference}</p>` : ""}
          <p>Review billing in AviatorPass anytime.</p>`,
      };
      break;
    case "assignment":
      payload = {
        title: subjectOverride ?? "New assignment",
        preheader: title || detail,
        bodyHtml: `<p>Hello ${name},</p>
          <p>You have a new assignment${title ? `: <strong>${title}</strong>` : ""}.</p>
          <p>${detail}</p>
          ${when ? `<p>Preferred / scheduled: ${when}</p>` : ""}
          <p>${cta} to review your Assignment Engine queue.</p>`,
      };
      break;
    case "reminder":
      payload = {
        title: subjectOverride ?? str(data, "title", "Reminder"),
        preheader: title || when,
        bodyHtml: `<p>Hello ${name},</p>
          <p><strong>${escapeHtml(str(data, "title", "Reminder"))}</strong></p>
          <p>${title}</p>
          ${when ? `<p>When: ${when}</p>` : ""}
          <p>${detail || "Open AviatorPass for details."}</p>`,
      };
      break;
    case "certificate":
      payload = {
        title: subjectOverride ?? "Certificate ready",
        preheader: title,
        bodyHtml: `<p>Hello ${name},</p>
          <p>Your certificate${title ? ` for <strong>${title}</strong>` : ""} is ready.</p>
          ${reference ? `<p>Certificate / verification: ${reference}</p>` : ""}
          <p>${detail}</p>
          <p>${cta} → Certificates to download or share.</p>`,
      };
      break;
    case "homework":
      payload = {
        title: subjectOverride ?? "Homework assigned",
        preheader: title,
        bodyHtml: `<p>Hello ${name},</p>
          <p>Homework after <strong>${title || "your lecture"}</strong>:</p>
          <p>${detail}</p>
          ${when ? `<p>Related session: ${when}</p>` : ""}
          <p>Track it under Performance reports in AviatorPass.</p>`,
      };
      break;
    case "schedule":
      payload = {
        title: subjectOverride ?? "Class scheduled",
        preheader: `${title} · ${when}`,
        bodyHtml: `<p>Hello ${name},</p>
          <p>A live session has been scheduled:</p>
          <p><strong>${title}</strong></p>
          ${when ? `<p>Starts: ${when}</p>` : ""}
          <p>${detail}</p>
          <p>Join from AviatorPass → Calendar / Live Classes when it is time.</p>`,
      };
      break;
    case "reschedule":
      payload = {
        title: subjectOverride ?? "Class rescheduled",
        preheader: `${title} · ${when}`,
        bodyHtml: `<p>Hello ${name},</p>
          <p><strong>${title}</strong> has been moved.</p>
          ${when ? `<p>New time: ${when}</p>` : ""}
          <p>${detail}</p>
          <p>Your calendar and reminders have been updated.</p>`,
      };
      break;
    case "cancel":
      payload = {
        title: subjectOverride ?? "Class cancelled",
        preheader: title,
        bodyHtml: `<p>Hello ${name},</p>
          <p><strong>${title}</strong> has been cancelled.</p>
          <p>${detail}</p>
          <p>Contact support or your instructor if you need a replacement slot.</p>`,
      };
      break;
    case "invoice":
      payload = {
        title: subjectOverride ?? `Invoice ${reference || ""}`.trim(),
        preheader: amount,
        bodyHtml: `<p>Hello ${name},</p>
          <p>Your invoice${reference ? ` <strong>${reference}</strong>` : ""} is ready.</p>
          ${amount ? `<p>Total: <strong>${amount}</strong></p>` : ""}
          <p>${detail}</p>
          <p>Open Billing in AviatorPass to view or print.</p>`,
      };
      break;
    case "receipt":
      payload = {
        title: subjectOverride ?? "Payment receipt",
        preheader: amount || reference,
        bodyHtml: `<p>Hello ${name},</p>
          <p>This is your receipt for a successful payment.</p>
          ${amount ? `<p>Amount: <strong>${amount}</strong></p>` : ""}
          ${reference ? `<p>Order: ${reference}</p>` : ""}
          <p>${detail}</p>
          <p>Thank you for training with AviatorPass.</p>`,
      };
      break;
    case "admin_alert":
      payload = {
        title: subjectOverride ?? str(data, "title", "Admin alert"),
        preheader: detail,
        bodyHtml: `<p><strong>${escapeHtml(str(data, "title", "Admin alert"))}</strong></p>
          <p>${detail}</p>
          ${reference ? `<p>Ref: ${reference}</p>` : ""}
          <p>Review in the AviatorPass admin console.</p>`,
      };
      break;
    case "instructor_alert":
      payload = {
        title: subjectOverride ?? str(data, "title", "Instructor alert"),
        preheader: detail,
        bodyHtml: `<p>Hello ${name},</p>
          <p><strong>${escapeHtml(str(data, "title", "Instructor alert"))}</strong></p>
          <p>${detail}</p>
          ${when ? `<p>${when}</p>` : ""}
          <p>${cta}</p>`,
      };
      break;
    case "student_alert":
      payload = {
        title: subjectOverride ?? str(data, "title", "Account alert"),
        preheader: detail,
        bodyHtml: `<p>Hello ${name},</p>
          <p><strong>${escapeHtml(str(data, "title", "Account alert"))}</strong></p>
          <p>${detail}</p>
          <p>${cta}</p>`,
      };
      break;
    default:
      payload = {
        title: subjectOverride ?? "AviatorPass notification",
        bodyHtml: `<p>${detail || title}</p>`,
      };
  }

  return renderBrandedEmail(payload);
}
