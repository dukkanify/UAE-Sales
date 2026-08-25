/**
 * Private session booking emails — student, instructor, and calendar details.
 */

import { sendEmail } from "@/services/email/mailer";
import { renderBrandedEmail } from "@/services/settings/email-templates";
import { findUserById } from "@/services/auth/store";
import { formatMinor } from "@/services/payments/money";
import type { AppointmentBooking } from "@/types/bookings";

function displayName(userId: string): { name: string; email: string | null } {
  const u = findUserById(userId);
  if (!u) return { name: "Instructor", email: null };
  return {
    name: [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email,
    email: u.email,
  };
}

function formatWhen(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  return `${start.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} – ${end.toLocaleTimeString(undefined, { timeStyle: "short" })} UTC`;
}

export async function sendPrivateSessionConfirmationEmails(
  booking: AppointmentBooking,
): Promise<void> {
  const studentEmail =
    booking.guestEmail ?? (booking.studentId ? findUserById(booking.studentId)?.email : null);
  const studentName =
    [booking.guestFirstName, booking.guestLastName].filter(Boolean).join(" ").trim() ||
    (booking.studentId ? displayName(booking.studentId).name : "Student");
  const instructor = displayName(booking.instructorId);
  const when = formatWhen(booking.startsAt, booking.endsAt);
  const priceLine =
    booking.paymentRequired && booking.priceAmountMinor > 0
      ? `<p>Fee: <strong>${formatMinor(booking.priceAmountMinor, booking.currency)}</strong></p>`
      : "";
  const zoomBlock = booking.zoom
    ? `<p><strong>Zoom meeting</strong><br/>
        Meeting ID: ${booking.zoom.meetingNumber}<br/>
        Join link: <a href="${booking.zoom.joinUrl}">${booking.zoom.joinUrl}</a><br/>
        Passcode: ${booking.zoom.password}</p>`
    : `<p>Your Zoom meeting link will appear in your dashboard once the session is confirmed.</p>`;

  if (studentEmail) {
    const template = renderBrandedEmail({
      title: "Private session confirmed",
      preheader: `${booking.sessionTypeName} · ${when}`,
      bodyHtml: `<p>Hello ${studentName},</p>
        <p>Your private session is confirmed:</p>
        <p><strong>${booking.title}</strong><br/>${when}</p>
        ${priceLine}
        ${zoomBlock}
        <p>This is a standalone AviatorPass premium service — separate from the ATPL Program unless included by your administrator.</p>
        <p>View upcoming sessions in your student dashboard.</p>`,
    });
    await sendEmail({
      to: studentEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      meta: { kind: "private_session_confirmed", bookingId: booking.id, role: "student" },
    });
  }

  if (instructor.email) {
    const template = renderBrandedEmail({
      title: "New private session booked",
      preheader: `${booking.sessionTypeName} with ${studentName}`,
      bodyHtml: `<p>Hello ${instructor.name},</p>
        <p>A new private session has been booked with you:</p>
        <p><strong>${booking.title}</strong><br/>
        Student: ${studentName}${studentEmail ? ` (${studentEmail})` : ""}<br/>
        ${when}</p>
        ${booking.notes ? `<p>Notes: ${booking.notes}</p>` : ""}
        ${zoomBlock}
        <p>Manage sessions from your instructor dashboard.</p>`,
    });
    await sendEmail({
      to: instructor.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      meta: { kind: "private_session_confirmed", bookingId: booking.id, role: "instructor" },
    });
  }
}
