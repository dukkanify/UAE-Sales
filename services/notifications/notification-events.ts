import { findUserById } from "@/services/auth/user-store";
import {
  notify,
  notifyAdmins,
} from "@/services/notifications/notification.service";
import {
  EMAIL_SITE_URL,
  emailSiteUrl,
  escapeEmailHtml,
} from "@/services/email/sooqna-email-template";
import { getFavoritesForListing } from "@/services/favorites/favorite-store";
import { matchSavedSearchesForListing } from "@/services/saved-searches/saved-search-store";
import type { Listing } from "@/types";
import type { Order } from "@/types/domain/order";
import type { ViewingBooking } from "@/types/domain/viewing-booking";
import type { QuoteRequest } from "@/types/domain/quote-request";
import type { JobApplication } from "@/types/domain/job-application";
import { formatCurrencyLabel } from "@/shared/utils/currency";

function greet(name: string, locale: "ar" | "en" = "ar"): string {
  const safe = escapeEmailHtml(name.trim() || (locale === "en" ? "Sooqna customer" : "عميل سوقنا"));
  return locale === "en"
    ? `<p style="font-size:16px;line-height:1.8;margin:0 0 12px;">Hello ${safe},</p>`
    : `<p style="font-size:16px;line-height:1.8;margin:0 0 12px;">مرحبًا ${safe}،</p>`;
}

function p(text: string): string {
  return `<p style="font-size:16px;line-height:1.8;margin:0;">${text}</p>`;
}

function listingPath(listing: { id: string; slug: string }): string {
  return listing.id.startsWith("local-")
    ? `/listings/local/${listing.id}`
    : `/listings/${listing.slug}`;
}

function listingEditPath(listing: { slug: string }): string {
  return `/listings/${listing.slug}/edit`;
}

export async function notifyListingSubmitted(listing: Listing): Promise<void> {
  const sellerId = listing.seller.id;
  if (!sellerId) return;
  const href = listingPath(listing);
  const seller = await findUserById(sellerId);

  await notify({
    userId: sellerId,
    type: "listing_received",
    title: "تم استلام إعلانك وهو قيد المراجعة",
    titleEn: "We received your listing and it is under review",
    body: `إعلان «${listing.title}» قيد المراجعة وسيظهر بعد الموافقة.`,
    bodyEn: `“${listing.title}” is under review and will go live after approval.`,
    href,
    idempotencyKey: `LISTING_SUBMITTED:${listing.id}`,
    critical: true,
    email: {
      type: "listing_received",
      entityId: listing.id,
      subject: `تم استلام إعلانك — ${listing.title}`,
      title: "إعلانك قيد المراجعة",
      bodyHtml: `${greet(seller?.fullName || listing.seller.name)}${p(`استلمنا إعلان «${escapeEmailHtml(listing.title)}» وهو الآن قيد مراجعة فريق سوقنا.`)}`,
      bodyLines: [`استلمنا إعلان «${listing.title}» وهو قيد المراجعة.`],
      ctaHref: emailSiteUrl(href),
      ctaLabel: "متابعة الإعلان",
    },
  });

  void notifyAdmins({
    type: "admin_ops",
    title: "إعلان جديد بانتظار المراجعة",
    titleEn: "New listing awaiting review",
    body: `«${listing.title}» من ${listing.seller.name} بانتظار الاعتماد.`,
    bodyEn: `“${listing.title}” from ${listing.seller.name} is waiting for review.`,
    href: "/admin/listings",
    idempotencyKey: `ADMIN_LISTING_REVIEW:${listing.id}`,
    channels: ["in_app"],
  });
}

export async function notifyListingApproved(listing: Listing): Promise<void> {
  const sellerId = listing.seller.id;
  if (!sellerId) return;
  const href = listingPath(listing);
  const seller = await findUserById(sellerId);

  await notify({
    userId: sellerId,
    type: "listing_approved",
    title: "تمت الموافقة على إعلانك وأصبح منشورًا",
    titleEn: "Your listing was approved and is now live",
    body: `إعلان «${listing.title}» منشور الآن ويمكن للمشترين مشاهدته.`,
    bodyEn: `“${listing.title}” is now visible to buyers.`,
    href,
    idempotencyKey: `LISTING_APPROVED:${listing.id}`,
    critical: true,
    email: {
      type: "listing_approved",
      entityId: listing.id,
      subject: `تمت الموافقة على إعلانك — ${listing.title}`,
      title: "إعلانك منشور الآن",
      bodyHtml: `${greet(seller?.fullName || listing.seller.name)}${p(`تمت الموافقة على إعلان «${escapeEmailHtml(listing.title)}» وأصبح ظاهرًا للمشترين على سوقنا.`)}`,
      bodyLines: [`تمت الموافقة على إعلان «${listing.title}».`],
      ctaHref: emailSiteUrl(href),
      ctaLabel: "عرض الإعلان",
    },
  });

  void notifySavedSearchMatches(listing);
}

export async function notifyListingRejected(
  listing: Listing,
  reason?: string,
): Promise<void> {
  const sellerId = listing.seller.id;
  if (!sellerId) return;
  const href = listingEditPath(listing);
  const seller = await findUserById(sellerId);
  const reasonText = reason?.trim();

  await notify({
    userId: sellerId,
    type: "listing_rejected",
    title: "لم تتم الموافقة على إعلانك",
    titleEn: "Your listing was not approved",
    body: reasonText
      ? `لم ننشر «${listing.title}»: ${reasonText}`
      : `لم ننشر إعلان «${listing.title}» بوضعه الحالي. عدّله ثم أعد الإرسال.`,
    bodyEn: reasonText
      ? `We did not publish “${listing.title}”: ${reasonText}`
      : `“${listing.title}” needs edits before it can go live.`,
    href,
    idempotencyKey: `LISTING_REJECTED:${listing.id}`,
    critical: true,
    email: {
      type: "listing_rejected",
      entityId: listing.id,
      subject: `يحتاج إعلانك إلى تعديل — ${listing.title}`,
      title: "لم نتمكن من نشر الإعلان",
      bodyHtml: `${greet(seller?.fullName || listing.seller.name)}${p(`لم تتم الموافقة على إعلان «${escapeEmailHtml(listing.title)}» بوضعه الحالي. يمكنك تعديله وإعادة الإرسال.`)}${reasonText ? `<p style="font-size:16px;line-height:1.8;margin:12px 0 0;">السبب: ${escapeEmailHtml(reasonText)}</p>` : ""}`,
      bodyLines: [
        `لم تتم الموافقة على إعلان «${listing.title}».`,
        reasonText ? `السبب: ${reasonText}` : "عدّل الإعلان ثم أعد إرساله.",
      ],
      ctaHref: emailSiteUrl(href),
      ctaLabel: "تعديل الإعلان",
    },
  });
}

export async function notifyListingFeaturedPaymentRequired(
  listing: Listing,
  amountAed: number,
): Promise<void> {
  const sellerId = listing.seller.id;
  if (!sellerId) return;
  const href = "/dashboard/listings";
  await notify({
    userId: sellerId,
    type: "listing_featured_payment",
    title: "أكمل دفع تمييز إعلانك",
    titleEn: "Complete payment to feature your listing",
    body: `تمييز «${listing.title}» بانتظار الدفع (${formatCurrencyLabel(amountAed)}).`,
    bodyEn: `Featuring “${listing.title}” is waiting for payment (${formatCurrencyLabel(amountAed)}).`,
    href,
    idempotencyKey: `FEATURED_PAYMENT_REQUIRED:${listing.id}`,
    critical: true,
    email: {
      type: "featured_payment_required",
      entityId: `${listing.id}:required`,
      subject: `أكمل دفع تمييز الإعلان — ${listing.title}`,
      title: "دفع باقة التمييز",
      bodyHtml: p(`تمييز إعلان «${escapeEmailHtml(listing.title)}» بانتظار إتمام الدفع.`),
      bodyLines: [`تمييز «${listing.title}» بانتظار الدفع.`],
      ctaHref: emailSiteUrl(href),
      ctaLabel: "إتمام الدفع",
    },
  });
}

export async function notifyListingFeaturedPaid(listing: Listing): Promise<void> {
  const sellerId = listing.seller.id;
  if (!sellerId) return;
  const href = listingPath(listing);
  await notify({
    userId: sellerId,
    type: "listing_featured",
    title: "تم تمييز إعلانك",
    titleEn: "Your listing is now featured",
    body: `تم تأكيد دفع تمييز «${listing.title}» وهو ظاهر في الأقسام المميزة.`,
    bodyEn: `“${listing.title}” is now shown in featured sections.`,
    href,
    idempotencyKey: `FEATURED_ACTIVATED:${listing.id}:${listing.featuredUntil ?? "now"}`,
    critical: true,
    email: {
      type: "featured_paid",
      entityId: `${listing.id}:${listing.featuredUntil ?? "paid"}`,
      subject: `تم تمييز إعلانك — ${listing.title}`,
      title: "تم دفع باقة التمييز",
      bodyHtml: p(`تم تأكيد دفع تمييز إعلان «${escapeEmailHtml(listing.title)}». سيظهر في الأقسام المميزة حسب مدة الباقة.`),
      bodyLines: [`تم تأكيد دفع تمييز إعلان «${listing.title}».`],
      ctaHref: emailSiteUrl(href),
      ctaLabel: "عرض الإعلان",
    },
  });
}

export async function notifyListingFeaturedExpired(listing: Listing): Promise<void> {
  const sellerId = listing.seller.id;
  if (!sellerId) return;
  await notify({
    userId: sellerId,
    type: "listing_featured_expired",
    title: "انتهت فترة تمييز إعلانك",
    titleEn: "Your featured listing period ended",
    body: `انتهت مدة تمييز «${listing.title}». يمكنك تجديده من لوحة الإعلانات.`,
    bodyEn: `The featured period for “${listing.title}” has ended.`,
    href: "/dashboard/listings",
    idempotencyKey: `FEATURED_EXPIRED:${listing.id}:${listing.featuredUntil ?? "expired"}`,
    email: {
      type: "featured_expired",
      entityId: `${listing.id}:expired:${listing.featuredUntil ?? ""}`,
      subject: `انتهت فترة التمييز — ${listing.title}`,
      title: "انتهت فترة التمييز",
      bodyHtml: p(`انتهت مدة تمييز إعلان «${escapeEmailHtml(listing.title)}».`),
      bodyLines: [`انتهت مدة تمييز «${listing.title}».`],
      ctaHref: emailSiteUrl("/dashboard/listings"),
      ctaLabel: "إدارة الإعلانات",
    },
  });
}

function bookingHref(booking: ViewingBooking): string {
  return `/dashboard/bookings?id=${encodeURIComponent(booking.id)}`;
}

function bookingDetailsHtml(booking: ViewingBooking): string {
  return `<p style="font-size:16px;line-height:1.8;margin:12px 0 0;">
    العقار: <strong>${escapeEmailHtml(booking.listingTitle)}</strong><br/>
    العميل: <strong>${escapeEmailHtml(booking.buyerName)}</strong><br/>
    التاريخ: <strong>${escapeEmailHtml(booking.date)}</strong><br/>
    الوقت: <strong>${escapeEmailHtml(booking.time)}</strong><br/>
    الزوار: <strong>${booking.visitors}</strong><br/>
    التواصل: <strong dir="ltr">${escapeEmailHtml(booking.phone)}</strong> · ${escapeEmailHtml(booking.buyerEmail)}
  </p>`;
}

export async function notifyViewingBookingCreated(
  booking: ViewingBooking,
): Promise<void> {
  const href = bookingHref(booking);
  const emailHref = emailSiteUrl(href);

  await notify({
    userId: booking.buyerId,
    recipientEmail: booking.buyerEmail,
    type: "viewing_booking",
    title: "تم استلام طلب المعاينة",
    titleEn: "Your viewing request was received",
    body: `طلب معاينة «${booking.listingTitle}» بتاريخ ${booking.date} الساعة ${booking.time}.`,
    bodyEn: `Viewing request for “${booking.listingTitle}” on ${booking.date} at ${booking.time}.`,
    href,
    idempotencyKey: `BOOKING_CREATED:${booking.id}:buyer`,
    preference: "booking",
    critical: true,
    email: {
      type: "viewing_booking",
      entityId: `${booking.id}:buyer`,
      subject: `تأكيد طلب المعاينة — ${booking.listingTitle}`,
      title: "تم استلام طلب المعاينة",
      bodyHtml: `${greet(booking.buyerName)}${p(`استلمنا طلب معاينة عقار «${escapeEmailHtml(booking.listingTitle)}».`)}${bookingDetailsHtml(booking)}`,
      bodyLines: [
        `طلب معاينة «${booking.listingTitle}».`,
        `${booking.date} ${booking.time}`,
        `${booking.visitors} زائر`,
      ],
      ctaHref: emailHref,
      ctaLabel: "تفاصيل الحجز",
    },
  });

  await notify({
    userId: booking.sellerId,
    type: "viewing_booking",
    title: "حجز معاينة جديد",
    titleEn: "New viewing booking",
    body: `${booking.buyerName} طلب معاينة «${booking.listingTitle}» في ${booking.date} الساعة ${booking.time}.`,
    bodyEn: `${booking.buyerName} requested a viewing of “${booking.listingTitle}” on ${booking.date} at ${booking.time}.`,
    href,
    idempotencyKey: `BOOKING_CREATED:${booking.id}:seller`,
    preference: "booking",
    critical: true,
    email: {
      type: "viewing_booking",
      entityId: `${booking.id}:seller`,
      subject: `حجز معاينة جديد — ${booking.listingTitle}`,
      title: "حجز معاينة جديد",
      bodyHtml: `${greet(booking.sellerName)}${p(`وصلك طلب معاينة جديد.`)}${bookingDetailsHtml(booking)}`,
      bodyLines: [
        `${booking.buyerName} طلب معاينة «${booking.listingTitle}».`,
        `${booking.date} ${booking.time}`,
        booking.phone,
        booking.buyerEmail,
      ],
      ctaHref: emailHref,
      ctaLabel: "فتح الحجز",
    },
  });
}

export async function notifyViewingBookingStatusChanged(
  booking: ViewingBooking,
  actor: "seller" | "admin" | "system" = "seller",
): Promise<void> {
  const href = bookingHref(booking);
  const version = booking.statusVersion ?? 1;
  const statusCopy: Record<
    ViewingBooking["status"],
    { ar: string; en: string }
  > = {
    pending: {
      ar: "طلب المعاينة قيد الانتظار",
      en: "The viewing request is pending",
    },
    confirmed: {
      ar: "تم تأكيد موعد المعاينة",
      en: "The viewing appointment was confirmed",
    },
    rescheduled: {
      ar: `تم تغيير موعد المعاينة إلى ${booking.date} الساعة ${booking.time}`,
      en: `The viewing was rescheduled to ${booking.date} at ${booking.time}`,
    },
    cancelled: {
      ar: "تم إلغاء موعد المعاينة",
      en: "The viewing appointment was cancelled",
    },
    completed: {
      ar: "اكتملت المعاينة",
      en: "The viewing was completed",
    },
  };
  const copy = statusCopy[booking.status];

  const parties = [
    {
      userId: booking.buyerId,
      email: booking.buyerEmail,
      name: booking.buyerName,
      role: "buyer" as const,
    },
    {
      userId: booking.sellerId,
      email: undefined,
      name: booking.sellerName,
      role: "seller" as const,
    },
  ];

  for (const party of parties) {
    if (actor !== "admin" && actor !== "system" && party.role === actor) continue;
    await notify({
      userId: party.userId,
      recipientEmail: party.email,
      type: "viewing_booking_update",
      title: copy.ar,
      titleEn: copy.en,
      body: `«${booking.listingTitle}» — ${booking.date} الساعة ${booking.time}.`,
      bodyEn: `“${booking.listingTitle}” — ${booking.date} at ${booking.time}.`,
      href,
      idempotencyKey: `BOOKING_${booking.status.toUpperCase()}:${booking.id}:${version}:${party.role}`,
      preference: "booking",
      critical: true,
      email: {
        type: "viewing_booking_update",
        entityId: `${booking.id}:${booking.status}:${version}:${party.role}`,
        subject: `${copy.ar} — ${booking.listingTitle}`,
        title: copy.ar,
        bodyHtml: `${greet(party.name)}${p(escapeEmailHtml(copy.ar))}${bookingDetailsHtml(booking)}`,
        bodyLines: [copy.ar, booking.listingTitle, `${booking.date} ${booking.time}`],
        ctaHref: emailSiteUrl(href),
        ctaLabel: "تفاصيل الحجز",
      },
    });
  }

  if (booking.status === "cancelled") {
    void notifyAdmins({
      type: "admin_ops",
      title: "إلغاء حجز معاينة",
      titleEn: "Viewing booking cancelled",
      body: `أُلغي حجز «${booking.listingTitle}» (${booking.date} ${booking.time}).`,
      bodyEn: `Viewing for “${booking.listingTitle}” was cancelled.`,
      href: "/admin/viewing-bookings",
      idempotencyKey: `ADMIN_BOOKING_CANCELLED:${booking.id}:${version}`,
      channels: ["in_app"],
    });
  }
}

export async function notifyQuoteRequestCreated(
  quote: QuoteRequest,
): Promise<void> {
  const href = `/dashboard/quotes?id=${encodeURIComponent(quote.id)}`;
  const isBooking = quote.kind === "service_booking";

  await notify({
    userId: quote.requesterId,
    recipientEmail: quote.requesterEmail,
    type: "quote_request",
    title: isBooking ? "تم إرسال طلب حجز الخدمة" : "تم إرسال طلب عرض السعر",
    titleEn: isBooking ? "Service booking request sent" : "Quote request sent",
    body: `تم إرسال طلبك لـ «${quote.listingTitle}».`,
    bodyEn: `Your request for “${quote.listingTitle}” was sent.`,
    href,
    idempotencyKey: `QUOTE_CREATED:${quote.id}:customer`,
    critical: true,
    email: {
      type: "quote_request",
      entityId: `${quote.id}:customer`,
      subject: `تأكيد طلب الخدمة — ${quote.listingTitle}`,
      title: "تم استلام طلبك",
      bodyHtml: `${greet(quote.requesterName)}${p(`استلمنا طلبك لـ «${escapeEmailHtml(quote.listingTitle)}». سيتواصل مزود الخدمة معك قريبًا.`)}`,
      bodyLines: [`تم إرسال طلبك لـ «${quote.listingTitle}».`],
      ctaHref: emailSiteUrl(href),
      ctaLabel: "متابعة الطلب",
    },
  });

  await notify({
    userId: quote.providerId,
    type: "quote_request",
    title: "طلب خدمة جديد",
    titleEn: "New service request",
    body: `${quote.requesterName} طلب «${quote.listingTitle}» — ${quote.preferredDate} ${quote.preferredTime}.`,
    bodyEn: `${quote.requesterName} requested “${quote.listingTitle}”.`,
    href,
    idempotencyKey: `QUOTE_CREATED:${quote.id}:provider`,
    critical: true,
    email: {
      type: "quote_request",
      entityId: `${quote.id}:provider`,
      subject: `طلب خدمة جديد — ${quote.listingTitle}`,
      title: "طلب خدمة جديد",
      bodyHtml: `${greet(quote.providerName)}${p(`${escapeEmailHtml(quote.requesterName)} أرسل طلبًا لـ «${escapeEmailHtml(quote.listingTitle)}».`)}<p style="font-size:16px;line-height:1.8;margin:12px 0 0;">التاريخ المفضل: ${escapeEmailHtml(quote.preferredDate)} ${escapeEmailHtml(quote.preferredTime)}<br/>الهاتف: <span dir="ltr">${escapeEmailHtml(quote.phone)}</span></p>`,
      bodyLines: [
        `${quote.requesterName} طلب «${quote.listingTitle}».`,
        quote.phone,
        quote.requesterEmail,
      ],
      ctaHref: emailSiteUrl(href),
      ctaLabel: "فتح الطلب",
    },
  });
}

export async function notifyQuoteRequestStatusChanged(
  quote: QuoteRequest,
): Promise<void> {
  const href = `/dashboard/quotes?id=${encodeURIComponent(quote.id)}`;
  const version = quote.statusVersion ?? 1;
  const labels: Record<QuoteRequest["status"], { ar: string; en: string }> = {
    submitted: { ar: "طلب الخدمة قيد الانتظار", en: "Service request pending" },
    quoted: { ar: "رد مزود الخدمة على طلبك", en: "The provider responded to your request" },
    accepted: { ar: "تم قبول عرض السعر", en: "The quote was accepted" },
    rejected: { ar: "تم رفض عرض السعر", en: "The quote was rejected" },
    expired: { ar: "انتهت صلاحية عرض السعر", en: "The quote expired" },
    converted: { ar: "تم تحويل العرض إلى حجز", en: "The quote was converted to a booking" },
  };
  const copy = labels[quote.status];
  const parties = [
    { userId: quote.requesterId, email: quote.requesterEmail, name: quote.requesterName, role: "customer" },
    { userId: quote.providerId, email: undefined, name: quote.providerName, role: "provider" },
  ];

  for (const party of parties) {
    await notify({
      userId: party.userId,
      recipientEmail: party.email,
      type: "quote_request_update",
      title: copy.ar,
      titleEn: copy.en,
      body: `«${quote.listingTitle}» — ${copy.ar}.`,
      bodyEn: `“${quote.listingTitle}” — ${copy.en}.`,
      href,
      idempotencyKey: `QUOTE_${quote.status.toUpperCase()}:${quote.id}:${version}:${party.role}`,
      critical: true,
      email: {
        type: "quote_request_update",
        entityId: `${quote.id}:${quote.status}:${version}:${party.role}`,
        subject: `${copy.ar} — ${quote.listingTitle}`,
        title: copy.ar,
        bodyHtml: `${greet(party.name)}${p(escapeEmailHtml(copy.ar))}${p(`الخدمة: ${escapeEmailHtml(quote.listingTitle)}`)}`,
        bodyLines: [copy.ar, quote.listingTitle],
        ctaHref: emailSiteUrl(href),
        ctaLabel: "تفاصيل الطلب",
      },
    });
  }
}

export async function notifyJobApplicationCreated(
  application: JobApplication,
): Promise<void> {
  const href = `/dashboard/applications?id=${encodeURIComponent(application.id)}`;

  await notify({
    userId: application.applicantId,
    recipientEmail: application.applicantEmail,
    type: "job_application",
    title: "تم إرسال طلب التوظيف",
    titleEn: "Your job application was sent",
    body: `تم إرسال طلبك على وظيفة «${application.listingTitle}» بنجاح.`,
    bodyEn: `Your application for “${application.listingTitle}” was sent.`,
    href,
    idempotencyKey: `JOB_CREATED:${application.id}:applicant`,
    critical: true,
    email: {
      type: "job_application",
      entityId: `${application.id}:applicant`,
      subject: `تأكيد طلب التوظيف — ${application.listingTitle}`,
      title: "تم إرسال طلبك",
      bodyHtml: `${greet(application.applicantName)}${p(`تم إرسال طلبك على وظيفة «${escapeEmailHtml(application.listingTitle)}».`)}`,
      bodyLines: [`تم إرسال طلبك على «${application.listingTitle}».`],
      ctaHref: emailSiteUrl(href),
      ctaLabel: "متابعة الطلب",
    },
  });

  await notify({
    userId: application.employerId,
    type: "job_application",
    title: "طلب توظيف جديد",
    titleEn: "New job application",
    body: `${application.applicantName} قدّم على وظيفة «${application.listingTitle}».`,
    bodyEn: `${application.applicantName} applied for “${application.listingTitle}”.`,
    href,
    idempotencyKey: `JOB_CREATED:${application.id}:employer`,
    critical: true,
    email: {
      type: "job_application",
      entityId: `${application.id}:employer`,
      subject: `طلب توظيف جديد — ${application.listingTitle}`,
      title: "طلب توظيف جديد",
      bodyHtml: `${greet(application.employerName)}${p(`${escapeEmailHtml(application.applicantName)} قدّم على وظيفة «${escapeEmailHtml(application.listingTitle)}».`)}<p style="font-size:16px;line-height:1.8;margin:12px 0 0;">البريد: ${escapeEmailHtml(application.applicantEmail)}<br/>الهاتف: <span dir="ltr">${escapeEmailHtml(application.phone)}</span></p>`,
      bodyLines: [
        `${application.applicantName} قدّم على «${application.listingTitle}».`,
        application.applicantEmail,
        application.phone,
      ],
      ctaHref: emailSiteUrl(href),
      ctaLabel: "عرض الطلب",
    },
  });
}

export async function notifyJobApplicationStatusChanged(
  application: JobApplication,
): Promise<void> {
  const href = `/dashboard/applications?id=${encodeURIComponent(application.id)}`;
  const version = application.statusVersion ?? 1;
  const status = application.status === "reviewed" ? "viewed" : application.status;
  const labels: Record<string, { ar: string; en: string }> = {
    submitted: { ar: "طلب التوظيف قيد المراجعة", en: "Application pending review" },
    viewed: { ar: "اطّلع صاحب العمل على طلبك", en: "The employer viewed your application" },
    reviewed: { ar: "اطّلع صاحب العمل على طلبك", en: "The employer viewed your application" },
    shortlisted: { ar: "تم إدراجك في القائمة المختصرة", en: "You were shortlisted" },
    rejected: { ar: "لم يتم اختيار طلبك لهذه الوظيفة", en: "Your application was not selected" },
    accepted: { ar: "تم قبول طلب التوظيف", en: "Your application was accepted" },
  };
  const copy = labels[status] ?? labels.submitted;

  await notify({
    userId: application.applicantId,
    recipientEmail: application.applicantEmail,
    type: "job_application_update",
    title: copy.ar,
    titleEn: copy.en,
    body: `وظيفة «${application.listingTitle}» — ${copy.ar}.`,
    bodyEn: `“${application.listingTitle}” — ${copy.en}.`,
    href,
    idempotencyKey: `JOB_${status.toUpperCase()}:${application.id}:${version}`,
    critical: true,
    email: {
      type: "job_application_update",
      entityId: `${application.id}:${status}:${version}`,
      subject: `${copy.ar} — ${application.listingTitle}`,
      title: copy.ar,
      bodyHtml: `${greet(application.applicantName)}${p(escapeEmailHtml(copy.ar))}${p(`الوظيفة: ${escapeEmailHtml(application.listingTitle)}`)}`,
      bodyLines: [copy.ar, application.listingTitle],
      ctaHref: emailSiteUrl(href),
      ctaLabel: "تفاصيل الطلب",
    },
  });
}

function orderHref(order: Order): string {
  return `/orders/${order.id}`;
}

export async function notifyOrderPaid(order: Order): Promise<void> {
  const href = orderHref(order);
  if (order.buyerId) {
    await notify({
      userId: order.buyerId,
      recipientEmail: order.buyerEmail,
      orderId: order.id,
      type: "order_paid",
      title: "تم الدفع بنجاح",
      titleEn: "Payment successful",
      body: `تم دفع مبلغ ${formatCurrencyLabel(order.fees.total)} لطلب «${order.listingTitle}».`,
      bodyEn: `Payment of ${formatCurrencyLabel(order.fees.total)} for “${order.listingTitle}” succeeded.`,
      href,
      idempotencyKey: `ORDER_PAID:${order.id}:buyer`,
      preference: "order",
      critical: true,
      email: {
        type: "order_paid",
        entityId: `${order.id}:buyer`,
        subject: `تم الدفع بنجاح — طلب ${order.id}`,
        title: "تم استلام الدفع",
        bodyHtml: `${greet(order.buyerName)}${p(`تم دفع طلب «${escapeEmailHtml(order.listingTitle)}» بنجاح.`)}`,
        bodyLines: [`تم دفع طلب «${order.listingTitle}».`, `رقم الطلب: ${order.id}`],
        ctaHref: emailSiteUrl(href),
        ctaLabel: "متابعة الطلب",
      },
    });
    await notify({
      userId: order.buyerId,
      recipientEmail: order.buyerEmail,
      orderId: order.id,
      type: "escrow_held",
      title: "تم حفظ المبلغ بأمان في الضمان المالي",
      titleEn: "The amount is safely held in escrow",
      body: `المبلغ محجوز في الضمان حتى تأكيد الاستلام لطلب «${order.listingTitle}».`,
      bodyEn: `Funds for “${order.listingTitle}” are held in escrow until you confirm receipt.`,
      href,
      idempotencyKey: `ESCROW_HELD:${order.id}:buyer`,
      preference: "order",
      critical: true,
      email: {
        type: "escrow_held",
        entityId: `${order.id}:escrow-buyer`,
        subject: `المبلغ في الضمان — ${order.listingTitle}`,
        title: "تم حفظ المبلغ في الضمان",
        bodyHtml: p("تم حفظ المبلغ بأمان في الضمان المالي حتى تأكيد الاستلام."),
        bodyLines: ["تم حفظ المبلغ بأمان في الضمان المالي."],
        ctaHref: emailSiteUrl(href),
        ctaLabel: "تفاصيل الطلب",
      },
    });
  }

  await notify({
    userId: order.sellerId,
    orderId: order.id,
    type: "order_paid",
    title: "طلب شراء جديد",
    titleEn: "New purchase order",
    body: `وصلك طلب جديد على «${order.listingTitle}». المبلغ محجوز في الضمان.`,
    bodyEn: `You received a new order for “${order.listingTitle}”. Funds are held in escrow.`,
    href,
    idempotencyKey: `ORDER_PAID:${order.id}:seller`,
    preference: "order",
    critical: true,
    email: {
      type: "order_seller_new",
      entityId: `${order.id}:seller`,
      subject: `طلب شراء جديد — ${order.listingTitle}`,
      title: "طلب شراء جديد",
      bodyHtml: p(`وصلك طلب جديد على إعلان «${escapeEmailHtml(order.listingTitle)}». المبلغ محجوز في الضمان.`),
      bodyLines: [`طلب جديد على «${order.listingTitle}».`, `رقم الطلب: ${order.id}`],
      ctaHref: emailSiteUrl(href),
      ctaLabel: "تفاصيل الطلب",
    },
  });
}

export async function notifyPaymentFailed(order: Order): Promise<void> {
  if (!order.buyerId) return;
  await notify({
    userId: order.buyerId,
    recipientEmail: order.buyerEmail,
    orderId: order.id,
    type: "payment_failed",
    title: "فشل الدفع",
    titleEn: "Payment failed",
    body: `تعذر إتمام دفع طلب «${order.listingTitle}». حاول مرة أخرى.`,
    bodyEn: `Payment for “${order.listingTitle}” failed. Please try again.`,
    href: orderHref(order),
    idempotencyKey: `PAYMENT_FAILED:${order.id}`,
    preference: "order",
    critical: true,
    email: {
      type: "payment_failed",
      entityId: `${order.id}:failed`,
      subject: `فشل الدفع — ${order.listingTitle}`,
      title: "فشل الدفع",
      bodyHtml: p(`تعذر إتمام دفع طلب «${escapeEmailHtml(order.listingTitle)}».`),
      bodyLines: [`فشل دفع طلب «${order.listingTitle}».`],
      ctaHref: emailSiteUrl(orderHref(order)),
      ctaLabel: "إعادة المحاولة",
    },
  });
  void notifyAdmins({
    type: "admin_ops",
    title: "مشكلة في الدفع",
    titleEn: "Payment issue",
    body: `فشل دفع الطلب ${order.id} — «${order.listingTitle}».`,
    bodyEn: `Payment failed for order ${order.id}.`,
    href: "/admin/orders",
    idempotencyKey: `ADMIN_PAYMENT_FAILED:${order.id}`,
    channels: ["in_app"],
  });
}

export async function notifyOrderStatus(input: {
  body: string;
  bodyEn?: string;
  emailType?:
    | "order_confirmed"
    | "order_preparing"
    | "order_shipped"
    | "order_out_for_delivery"
    | "order_delivered"
    | "order_cancelled"
    | "order_released"
    | "order_refunded"
    | "order_disputed"
    | "seller_proof"
    | "escrow_released";
  fallbackEmail?: string;
  idempotencyKey: string;
  order: Order;
  title: string;
  titleEn?: string;
  type: NotificationTypeFromOrder;
  userId: string;
}): Promise<void> {
  await notify({
    userId: input.userId,
    recipientEmail: input.fallbackEmail,
    orderId: input.order.id,
    type: input.type,
    title: input.title,
    titleEn: input.titleEn,
    body: input.body,
    bodyEn: input.bodyEn,
    href: orderHref(input.order),
    idempotencyKey: input.idempotencyKey,
    preference: "order",
    critical: true,
    email: {
      type: input.emailType ?? "order_confirmed",
      entityId: input.idempotencyKey,
      subject: `${input.title} — ${input.order.listingTitle}`,
      title: input.title,
      bodyHtml: p(escapeEmailHtml(input.body)),
      bodyLines: [input.body],
      ctaHref: emailSiteUrl(orderHref(input.order)),
      ctaLabel: "متابعة الطلب",
    },
  });
}

type NotificationTypeFromOrder =
  | "order_confirmed"
  | "order_preparing"
  | "order_shipped"
  | "order_out_for_delivery"
  | "order_delivered"
  | "order_cancelled"
  | "order_released"
  | "order_refunded"
  | "order_disputed"
  | "order_dispute_resolved"
  | "seller_proof"
  | "buyer_match"
  | "escrow_held"
  | "escrow_released";

export async function notifyEscrowReleased(order: Order): Promise<void> {
  const amount = formatCurrencyLabel(order.fees.productPrice);
  if (order.buyerId) {
    await notifyOrderStatus({
      order,
      userId: order.buyerId,
      fallbackEmail: order.buyerEmail,
      type: "order_confirmed",
      emailType: "order_confirmed",
      title: "تم تأكيد الاستلام",
      titleEn: "Receipt confirmed",
      body: `تم تأكيد طلب «${order.listingTitle}» وتحويل المبلغ للبائع.`,
      bodyEn: `“${order.listingTitle}” was confirmed and funds were released to the seller.`,
      idempotencyKey: `ESCROW_RELEASED:${order.id}:buyer`,
    });
  }
  await notifyOrderStatus({
    order,
    userId: order.sellerId,
    type: "escrow_released",
    emailType: "escrow_released",
    title: "تم تأكيد الاستلام وتم تحرير المبلغ إلى رصيدك",
    titleEn: "Receipt confirmed and funds were released to your balance",
    body: `تم تحويل ${amount} إلى رصيدك المتاح لطلب «${order.listingTitle}».`,
    bodyEn: `${amount} was released to your balance for “${order.listingTitle}”.`,
    idempotencyKey: `ESCROW_RELEASED:${order.id}:seller`,
  });
}

export async function notifyOrderRefunded(order: Order): Promise<void> {
  if (order.buyerId) {
    await notifyOrderStatus({
      order,
      userId: order.buyerId,
      fallbackEmail: order.buyerEmail,
      type: "order_refunded",
      emailType: "order_refunded",
      title: "تم استرداد المبلغ",
      titleEn: "Refund completed",
      body: `تم استرداد دفعتك لطلب «${order.listingTitle}».`,
      bodyEn: `Your payment for “${order.listingTitle}” was refunded.`,
      idempotencyKey: `ORDER_REFUNDED:${order.id}:buyer`,
    });
  }
  await notifyOrderStatus({
    order,
    userId: order.sellerId,
    type: "order_refunded",
    emailType: "order_refunded",
    title: "تم استرداد الطلب",
    titleEn: "The order was refunded",
    body: `تم استرداد الطلب «${order.listingTitle}».`,
    bodyEn: `Order “${order.listingTitle}” was refunded.`,
    idempotencyKey: `ORDER_REFUNDED:${order.id}:seller`,
  });
  void notifyAdmins({
    type: "admin_ops",
    title: "استرداد مبلغ",
    titleEn: "Refund issued",
    body: `استرداد للطلب ${order.id} — «${order.listingTitle}».`,
    bodyEn: `Refund issued for order ${order.id}.`,
    href: "/admin/orders",
    idempotencyKey: `ADMIN_REFUND:${order.id}`,
    channels: ["in_app"],
  });
}

export async function notifyDisputeOpened(order: Order, disputeId: string): Promise<void> {
  if (order.buyerId) {
    await notifyOrderStatus({
      order,
      userId: order.buyerId,
      fallbackEmail: order.buyerEmail,
      type: "order_disputed",
      emailType: "order_disputed",
      title: "تم فتح النزاع",
      titleEn: "A dispute was opened",
      body: `تم تسجيل نزاعك على طلب «${order.listingTitle}» وسيتم مراجعته.`,
      bodyEn: `Your dispute on “${order.listingTitle}” was recorded.`,
      idempotencyKey: `DISPUTE_OPENED:${disputeId}:buyer`,
    });
  }
  await notifyOrderStatus({
    order,
    userId: order.sellerId,
    type: "order_disputed",
    emailType: "order_disputed",
    title: "نزاع جديد على طلب",
    titleEn: "New dispute on an order",
    body: `فتح المشتري نزاعًا على طلب «${order.listingTitle}».`,
    bodyEn: `The buyer opened a dispute on “${order.listingTitle}”.`,
    idempotencyKey: `DISPUTE_OPENED:${disputeId}:seller`,
  });
  void notifyAdmins({
    type: "admin_ops",
    title: "نزاع جديد",
    titleEn: "New dispute",
    body: `نزاع على «${order.listingTitle}» (${order.id}).`,
    bodyEn: `Dispute opened on order ${order.id}.`,
    href: "/admin/disputes",
    idempotencyKey: `ADMIN_DISPUTE:${disputeId}`,
    channels: ["in_app"],
  });
}

export async function notifyChatMessage(input: {
  conversationId: string;
  listingTitle: string;
  preview: string;
  recipientUserId: string;
  senderName: string;
}): Promise<void> {
  const href = `/chat/${input.conversationId}`;
  const bucket = Math.floor(Date.now() / (5 * 60 * 1000));
  await notify({
    userId: input.recipientUserId,
    type: "chat_message",
    title: `رسالة جديدة من ${input.senderName}`,
    titleEn: `New message from ${input.senderName}`,
    body: input.preview.slice(0, 160),
    href,
    idempotencyKey: `CHAT_MESSAGE:${input.conversationId}:${bucket}`,
    preference: "messages",
    email: {
      type: "chat_message",
      entityId: input.conversationId,
      dedupeWindowMs: 30 * 60 * 1000,
      subject: `رسالة جديدة حول «${input.listingTitle}»`,
      title: "لديك رسالة جديدة",
      bodyHtml: p(`${escapeEmailHtml(input.senderName)} راسلك بخصوص «${escapeEmailHtml(input.listingTitle)}».`),
      bodyLines: [
        `${input.senderName} أرسل رسالة حول «${input.listingTitle}».`,
        input.preview.slice(0, 180),
      ],
      ctaHref: emailSiteUrl(href),
      ctaLabel: "فتح المحادثة",
    },
  });
}

export async function notifyWelcome(input: {
  email: string;
  name: string;
  userId: string;
}): Promise<{ emailStatus: string }> {
  const name = input.name.trim() || "عميل سوقنا";
  return notify({
    userId: input.userId,
    recipientEmail: input.email,
    type: "welcome",
    title: "أهلاً بك في سوقنا",
    titleEn: "Welcome to Sooqna",
    body: `مرحباً ${name}، حسابك في سوقنا نشط الآن. ابدأ بنشر إعلان أو تصفّح العروض.`,
    bodyEn: `Hi ${name}, your Sooqna account is ready. Post a listing or start browsing.`,
    href: "/search",
    idempotencyKey: `WELCOME:${input.userId}`,
    critical: true,
    email: {
      type: "welcome",
      entityId: input.userId,
      subject: `مرحبًا بك في سوقنا — حسابك جاهز`,
      title: "أهلاً بك في سوقنا",
      bodyHtml: `${greet(name)}${p("حسابك في سوقنا نشط الآن. ابدأ بنشر إعلان أو تصفّح العروض.")}`,
      bodyLines: ["حسابك في سوقنا نشط الآن."],
      ctaHref: EMAIL_SITE_URL,
      ctaLabel: "تصفّح سوقنا",
    },
  });
}

export async function notifyFavoritePriceChanged(input: {
  listingId: string;
  slug: string;
  title: string;
  oldPrice: number;
  newPrice: number;
}): Promise<void> {
  const favorites = await getFavoritesForListing(input.listingId);
  for (const favorite of favorites) {
    await notify({
      userId: favorite.userId,
      type: "favorite_price",
      title: "تغير سعر إعلان في المفضلة",
      titleEn: "A favorite listing changed price",
      body: `«${input.title}» أصبح ${formatCurrencyLabel(input.newPrice)} بدل ${formatCurrencyLabel(input.oldPrice)}.`,
      bodyEn: `“${input.title}” is now ${formatCurrencyLabel(input.newPrice)}.`,
      href: `/listings/${input.slug}`,
      idempotencyKey: `FAVORITE_PRICE:${input.listingId}:${input.newPrice}:${favorite.userId}`,
      preference: "savedSearches",
      email: {
        type: "favorite_price",
        entityId: `${input.listingId}:${input.newPrice}:${favorite.userId}`,
        subject: `تغير السعر — ${input.title}`,
        title: "تغير سعر إعلان محفوظ",
        bodyHtml: p(`تغير سعر «${escapeEmailHtml(input.title)}».`),
        bodyLines: [`تغير سعر «${input.title}».`],
        ctaHref: emailSiteUrl(`/listings/${input.slug}`),
        ctaLabel: "عرض الإعلان",
      },
    });
  }
}

export async function notifyFavoriteSold(input: {
  listingId: string;
  slug: string;
  title: string;
}): Promise<void> {
  const favorites = await getFavoritesForListing(input.listingId);
  for (const favorite of favorites) {
    await notify({
      userId: favorite.userId,
      type: "favorite_sold",
      title: "إعلان في المفضلة لم يعد متاحًا",
      titleEn: "A favorite listing is no longer available",
      body: `«${input.title}» لم يعد متاحًا للشراء.`,
      bodyEn: `“${input.title}” is no longer available.`,
      href: `/listings/${input.slug}`,
      idempotencyKey: `FAVORITE_SOLD:${input.listingId}:${favorite.userId}`,
      preference: "savedSearches",
      email: {
        type: "favorite_sold",
        entityId: `${input.listingId}:sold:${favorite.userId}`,
        subject: `لم يعد متاحًا — ${input.title}`,
        title: "إعلان المفضلة لم يعد متاحًا",
        bodyHtml: p(`«${escapeEmailHtml(input.title)}» لم يعد متاحًا.`),
        bodyLines: [`«${input.title}» لم يعد متاحًا.`],
        ctaHref: emailSiteUrl("/search"),
        ctaLabel: "تصفّح إعلانات مشابهة",
      },
    });
  }
}

async function notifySavedSearchMatches(listing: Listing): Promise<void> {
  try {
    const matches = await matchSavedSearchesForListing(listing);
    for (const match of matches) {
      await notify({
        userId: match.userId,
        type: "saved_search_match",
        title: "نتائج جديدة لبحثك المحفوظ",
        titleEn: "New listings match your saved search",
        body: `إعلان جديد يطابق «${match.label}»: ${listing.title}.`,
        bodyEn: `A new listing matches “${match.label}”: ${listing.title}.`,
        href: listingPath(listing),
        idempotencyKey: `SAVED_SEARCH:${match.id}:${listing.id}`,
        preference: "savedSearches",
        email: {
          type: "saved_search_match",
          entityId: `${match.id}:${listing.id}`,
          subject: `نتائج جديدة — ${match.label}`,
          title: "نتائج جديدة لبحثك المحفوظ",
          bodyHtml: p(`ظهر إعلان جديد يطابق بحثك المحفوظ «${escapeEmailHtml(match.label)}».`),
          bodyLines: [`نتائج جديدة لـ «${match.label}».`, listing.title],
          ctaHref: emailSiteUrl(listingPath(listing)),
          ctaLabel: "عرض الإعلان",
        },
      });
    }
  } catch (error) {
    console.error("[Sooqna Notify] saved search match failed", error);
  }
}

export async function notifyListingReported(input: {
  listingTitle: string;
  reportId: string;
  reporterName: string;
  reporterPhone: string;
}): Promise<void> {
  await notifyAdmins({
    type: "listing_report",
    title: "بلاغ جديد على إعلان",
    titleEn: "New listing report",
    body: `${input.reporterName} (${input.reporterPhone}) أبلغ عن «${input.listingTitle}».`,
    bodyEn: `${input.reporterName} reported “${input.listingTitle}”.`,
    href: "/admin/listing-reports",
    idempotencyKey: `ADMIN_LISTING_REPORT:${input.reportId}`,
    channels: ["in_app"],
  });
}
