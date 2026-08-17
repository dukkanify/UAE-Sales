import { NextResponse } from "next/server";
import { z } from "zod";
import { sendQuoteRequestEmails } from "@/services/email/email.service";
import { findStoredEmail, listingPublicUrl } from "@/services/listings/listing-action-mail";
import { createNotification } from "@/services/payments/notification-store";
import {
  assertNotOwnListing,
  resolveServerListing,
  validateAttachmentName,
  validatePreferredDate,
} from "@/services/listings/listing-action-resolver";
import {
  createQuoteRequest,
  findRecentQuoteRequest,
  getQuoteRequestsForUser,
} from "@/services/quote-requests/quote-request-store";

const schema = z.object({
  kind: z.enum(["quote", "service_booking"]).default("quote"),
  listingId: z.string().min(1),
  listingTitle: z.string().min(1),
  listingSlug: z.string().optional(),
  requesterId: z.string().min(1),
  requesterName: z.string().min(2),
  requesterEmail: z.string().email(),
  phone: z.string().min(8),
  serviceRequired: z.string().min(2),
  description: z.string().min(10),
  emirate: z.string().min(1),
  area: z.string().min(1),
  preferredDate: z.string().min(1),
  preferredTime: z.string().min(1),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  attachmentName: z.string().optional(),
  providerId: z.string().min(1),
  providerName: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  if (!validatePreferredDate(parsed.data.preferredDate)) {
    return NextResponse.json({ error: "INVALID_DATE" }, { status: 400 });
  }

  if (!validateAttachmentName(parsed.data.attachmentName)) {
    return NextResponse.json({ error: "INVALID_ATTACHMENT_TYPE" }, { status: 400 });
  }

  const listing = resolveServerListing(parsed.data.listingId);
  if (listing && listing.categoryId !== "services") {
    return NextResponse.json({ error: "INVALID_LISTING_TYPE" }, { status: 400 });
  }

  const ownError = assertNotOwnListing(
    listing,
    parsed.data.requesterId,
    parsed.data.providerId,
  );
  if (ownError) {
    return NextResponse.json({ error: ownError }, { status: 403 });
  }

  const payload = { ...parsed.data };

  if (listing) {
    payload.providerId = listing.seller.id;
    payload.providerName = listing.seller.name;
    payload.listingTitle = listing.title;
    payload.listingSlug = listing.slug;
  }

  const existing = await findRecentQuoteRequest(
    payload.requesterId,
    payload.listingId,
  );
  if (existing) {
    return NextResponse.json({ error: "DUPLICATE_REQUEST" }, { status: 409 });
  }

  const quoteRequest = await createQuoteRequest(payload);

  const title =
    payload.kind === "service_booking"
      ? "تم إرسال طلب حجز الخدمة"
      : "تم إرسال طلب عرض السعر";

  const listingHref = listing
    ? listing.id.startsWith("local-")
      ? `/listings/local/${listing.id}`
      : `/listings/${listing.slug}`
    : payload.listingSlug
      ? `/listings/${payload.listingSlug}`
      : "/search";

  await Promise.all([
    createNotification({
      userId: payload.requesterId,
      type: "quote_request",
      title,
      body: `تم إرسال طلبك لـ «${payload.listingTitle}». سيتواصل مزود الخدمة معك قريباً.`,
      href: listingHref,
    }),
    createNotification({
      userId: payload.providerId,
      type: "quote_request",
      title: "طلب خدمة جديد",
      body: `${payload.requesterName} طلب عرض سعر لـ «${payload.listingTitle}».`,
      href: listingHref,
    }),
  ]);

  const providerEmail = await findStoredEmail(payload.providerId);
  const emailed = await sendQuoteRequestEmails({
    buyer: { email: payload.requesterEmail, name: payload.requesterName },
    seller: providerEmail
      ? { email: providerEmail, name: payload.providerName }
      : undefined,
    listingTitle: payload.listingTitle,
    listingUrl: listingPublicUrl({
      listingId: payload.listingId,
      listingSlug: payload.listingSlug,
    }),
    kind: payload.kind,
    preferredDate: payload.preferredDate,
    preferredTime: payload.preferredTime,
  });

  return NextResponse.json({ quoteRequest, emailed: emailed.buyerEmailed });
}

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "USER_ID_REQUIRED" }, { status: 400 });
  }
  const quoteRequests = await getQuoteRequestsForUser(userId);
  return NextResponse.json({ quoteRequests });
}
