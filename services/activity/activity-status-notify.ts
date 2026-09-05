import { deliverEmailSafely } from "@/services/email/email.service";
import { createNotification } from "@/services/payments/notification-store";
import {
  jobStatusLabel,
  quoteStatusLabel,
  viewingStatusLabel,
} from "@/services/activity/activity-labels";
import type { ActivityKind } from "@/types/domain/activity";
import type { JobApplication } from "@/types/domain/job-application";
import type { QuoteRequest } from "@/types/domain/quote-request";
import type { ViewingBooking } from "@/types/domain/viewing-booking";

type StatusNotifyInput = {
  kind: ActivityKind;
  recipientId: string;
  recipientEmail?: string;
  title: string;
  body: string;
  href?: string;
  sendEmail?: boolean;
};

export async function notifyActivityEvent(input: StatusNotifyInput): Promise<void> {
  await createNotification({
    userId: input.recipientId,
    type:
      input.kind === "job_application"
        ? "job_application"
        : input.kind === "viewing_booking"
          ? "viewing_booking"
          : input.kind === "quote_request" || input.kind === "service_booking"
            ? "quote_request"
            : "order_confirmed",
    title: input.title,
    body: input.body,
    href: input.href,
  });

  if (input.sendEmail && input.recipientEmail) {
    await deliverEmailSafely({
      eventType: "activity_status",
      to: input.recipientEmail,
      subject: input.title,
      html: `<p>${input.body}</p>`,
      text: input.body,
    });
  }
}

export async function notifyJobStatusChange(
  application: JobApplication,
  previousStatus: JobApplication["status"],
): Promise<void> {
  if (application.status === previousStatus) return;
  const label = jobStatusLabel(application.status);
  const href = application.listingSlug
    ? `/listings/${application.listingSlug}`
    : "/profile#activity";

  await notifyActivityEvent({
    kind: "job_application",
    recipientId: application.applicantId,
    recipientEmail: application.applicantEmail,
    title: "تحديث طلب التوظيف",
    body: `تم تحديث حالة طلبك على «${application.listingTitle}» إلى: ${label}.`,
    href,
    sendEmail: ["shortlisted", "accepted", "rejected"].includes(application.status),
  });

  if (application.status === "submitted") return;
  await notifyActivityEvent({
    kind: "job_application",
    recipientId: application.employerId,
    title: "تم تحديث طلب توظيف",
    body: `حالة طلب ${application.applicantName} على «${application.listingTitle}»: ${label}.`,
    href,
  });
}

export async function notifyViewingStatusChange(
  booking: ViewingBooking,
  previousStatus: ViewingBooking["status"],
): Promise<void> {
  if (booking.status === previousStatus) return;
  const label = viewingStatusLabel(booking.status);
  const href = booking.listingSlug ? `/listings/${booking.listingSlug}` : "/profile#activity";

  await notifyActivityEvent({
    kind: "viewing_booking",
    recipientId: booking.buyerId,
    recipientEmail: booking.buyerEmail,
    title: "تحديث حجز المعاينة",
    body: `حالة حجز «${booking.listingTitle}» (${booking.date} ${booking.time}): ${label}.`,
    href,
    sendEmail: ["confirmed", "cancelled", "completed"].includes(booking.status),
  });
}

export async function notifyQuoteStatusChange(
  request: QuoteRequest,
  previousStatus: QuoteRequest["status"],
): Promise<void> {
  if (request.status === previousStatus) return;
  const label = quoteStatusLabel(request.status);
  const href = request.listingSlug ? `/listings/${request.listingSlug}` : "/profile#activity";

  await notifyActivityEvent({
    kind: "quote_request",
    recipientId: request.requesterId,
    recipientEmail: request.requesterEmail,
    title: "تحديث طلب الخدمة",
    body: `تم تحديث حالة طلبك على «${request.listingTitle}» إلى: ${label}.`,
    href,
    sendEmail: ["quoted", "accepted", "rejected", "completed"].includes(request.status),
  });
}
