/**
 * Branded HTML email templates for AviatorPass.
 * Uses platform settings for logo, colors, and footer.
 */

import { getPlatformSettings } from "@/services/settings/settings-service";

export interface EmailTemplatePayload {
  title: string;
  preheader?: string;
  bodyHtml: string;
}

export function renderBrandedEmail(payload: EmailTemplatePayload): {
  subject: string;
  html: string;
  text: string;
} {
  const s = getPlatformSettings();
  const brand = s.branding;
  const general = s.general;
  const primary = brand.primaryColor;
  const accent = brand.accentColor;
  const logo = brand.logoUrl.startsWith("http")
    ? brand.logoUrl
    : `${general.websiteUrl.replace(/\/$/, "")}${brand.logoUrl}`;

  const social = [
    general.socialLinks.instagram
      ? `<a href="${general.socialLinks.instagram}" style="color:${accent};text-decoration:none;margin:0 8px;">Instagram</a>`
      : "",
    general.socialLinks.twitter
      ? `<a href="${general.socialLinks.twitter}" style="color:${accent};text-decoration:none;margin:0 8px;">X</a>`
      : "",
    general.socialLinks.linkedin
      ? `<a href="${general.socialLinks.linkedin}" style="color:${accent};text-decoration:none;margin:0 8px;">LinkedIn</a>`
      : "",
    general.socialLinks.youtube
      ? `<a href="${general.socialLinks.youtube}" style="color:${accent};text-decoration:none;margin:0 8px;">YouTube</a>`
      : "",
    general.socialHandle
      ? `<span style="color:#94a3b8;margin:0 8px;">${general.socialHandle}</span>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  const locations = general.primaryLocations.join(" · ");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${payload.title}</title>
</head>
<body style="margin:0;padding:0;background:#F3F6F9;font-family:'IBM Plex Sans',Arial,sans-serif;color:${primary};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${payload.preheader ?? ""}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F3F6F9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #D8E0E8;">
          <tr>
            <td style="background:${primary};padding:24px 32px;">
              <img src="${logo}" alt="${general.platformName}" height="40" style="display:block;height:40px;width:auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-family:'Exo 2',Arial,sans-serif;font-size:22px;color:${primary};">${payload.title}</h1>
              <div style="font-size:15px;line-height:1.6;color:#0B1A24;">${payload.bodyHtml}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#0B1A24;color:#E2E8F0;font-size:12px;line-height:1.6;">
              <strong style="color:#fff;">${general.companyName}</strong><br/>
              YOUR AVIATION JOURNEY STARTS HERE<br/>
              ${general.footerText}<br/>
              ${locations}<br/>
              <a href="mailto:${general.supportEmail}" style="color:${accent};">${general.supportEmail}</a>
              <div style="margin-top:12px;">${social}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    payload.title,
    "",
    payload.bodyHtml.replace(/<[^>]+>/g, " "),
    "",
    `${general.companyName} · ${locations}`,
    general.supportEmail,
    general.socialHandle,
  ].join("\n");

  return { subject: payload.title, html, text };
}

export function otpEmailTemplate(
  code: string,
  purpose: string,
  options?: { expiresInMinutes?: number },
) {
  const expiresInMinutes = options?.expiresInMinutes ?? 10;
  return renderBrandedEmail({
    title: "Your verification code",
    preheader: `Use your AviatorPass code within ${expiresInMinutes} minutes`,
    bodyHtml: `<p>Use this one-time code to ${purpose}:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:6px;color:#143048;margin:24px 0;">${code}</p>
      <p>This code expires in <strong>${expiresInMinutes} minutes</strong> and can only be used once.</p>
      <p style="color:#64748b;font-size:13px;">If you did not request this code, you can ignore this email. Never share your code with anyone.</p>
      <p style="color:#64748b;font-size:13px;margin-top:16px;">Need help? Contact support via the address in this email footer.</p>`,
  });
}

export function verificationSuccessEmailTemplate(input: { firstName: string; role: string }) {
  const name = input.firstName || "Aviator";
  return renderBrandedEmail({
    title: "Email verified — account ready",
    preheader: `Welcome to AviatorPass, ${name}`,
    bodyHtml: `<p>Hi ${name},</p>
      <p>Your email is verified and your <strong>${input.role}</strong> account is ready.</p>
      <p>Sign in anytime to continue your aviation training journey.</p>`,
  });
}

export function accountCreatedEmailTemplate(input: { firstName: string }) {
  const name = input.firstName || "Aviator";
  return renderBrandedEmail({
    title: "Your AviatorPass account was created",
    preheader: "Profile, security settings, and preferences are ready",
    bodyHtml: `<p>Hi ${name},</p>
      <p>Your AviatorPass profile, notification preferences, and security defaults are in place.</p>
      <p>Complete your profile to unlock the full student dashboard.</p>`,
  });
}
export function testEmailTemplate() {
  return renderBrandedEmail({
    title: "Test email from AviatorPass",
    preheader: "Your email configuration is working.",
    bodyHtml: `<p>This is a test message from the Super Admin email configuration panel.</p>
      <p>If you received this, outbound email settings are reachable from the platform.</p>`,
  });
}

export function classReminderEmailTemplate(input: {
  title: string;
  startsAt: string;
  label: string;
}) {
  const when = new Date(input.startsAt).toLocaleString();
  return renderBrandedEmail({
    title: input.label,
    preheader: `${input.title} · ${when}`,
    bodyHtml: `<p><strong>${input.label}</strong></p>
      <p>${input.title}</p>
      <p>Starts: ${when}</p>
      <p>Open AviatorPass to join your live Zoom session when it is time.</p>`,
  });
}

export function installmentReminderEmailTemplate(input: {
  productName: string;
  amountLabel: string;
  dueLabel: string;
  kind: "due_soon" | "due_today" | "overdue";
  sequence: number;
  totalCount: number;
}) {
  const title =
    input.kind === "overdue"
      ? "Installment overdue"
      : input.kind === "due_today"
        ? "Installment due today"
        : "Upcoming installment reminder";
  return renderBrandedEmail({
    title,
    preheader: `${input.productName} · ${input.amountLabel}`,
    bodyHtml: `<p><strong>${title}</strong></p>
      <p>${input.productName}</p>
      <p>Installment ${input.sequence} of ${input.totalCount}: <strong>${input.amountLabel}</strong></p>
      <p>Due date: ${input.dueLabel}</p>
      <p>Pay from your AviatorPass billing center to keep course access active.</p>`,
  });
}

/** CR006 — post-lecture student evaluation / performance report. */
export function performanceReportEmailTemplate(input: {
  studentName: string;
  classTitle: string;
  courseCode: string | null;
  instructorName: string | null;
  todaysTopic: string;
  nextTopic: string;
  homework: string;
  performanceLabel: string;
  questionBank: string;
  comments: string;
}) {
  const courseLine = input.courseCode ? ` (${input.courseCode})` : "";
  const commentsBlock = input.comments
    ? `<p><strong>Comments</strong><br/>${escapeHtml(input.comments)}</p>`
    : "";
  return renderBrandedEmail({
    title: "Performance report",
    preheader: `${input.classTitle} · ${input.performanceLabel}`,
    bodyHtml: `<p>Hello ${escapeHtml(input.studentName)},</p>
      <p>Your instructor${input.instructorName ? ` (${escapeHtml(input.instructorName)})` : ""} submitted a performance report after <strong>${escapeHtml(input.classTitle)}</strong>${escapeHtml(courseLine)}.</p>
      <p><strong>Today's Topic</strong><br/>${escapeHtml(input.todaysTopic)}</p>
      <p><strong>Next Topic</strong><br/>${escapeHtml(input.nextTopic)}</p>
      <p><strong>Homework</strong><br/>${escapeHtml(input.homework)}</p>
      <p><strong>Performance</strong><br/>${escapeHtml(input.performanceLabel)}</p>
      <p><strong>Question Bank</strong><br/>${escapeHtml(input.questionBank)}</p>
      ${commentsBlock}
      <p>Open AviatorPass → Progress / Performance reports to review this in your account.</p>`,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
