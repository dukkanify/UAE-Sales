import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromCookie } from "@/services/auth/session-cookie";
import { notify } from "@/services/notifications/notification.service";
import { notifyListingReported } from "@/services/notifications/notification-events";
import {
  createListingReport,
  listingReportReceipt,
} from "@/services/listings/listing-report-store";
import { resolveServerListing } from "@/services/listings/listing-action-resolver";
import { hydrateListingCatalog } from "@/services/payments/listing-resolver";

const schema = z.object({
  listingId: z.string().min(1),
  reason: z.enum(["misleading", "fraud", "duplicate", "prohibited", "other"]),
  details: z.string().max(800).optional(),
  reporterName: z.string().min(2).max(80),
  reporterEmail: z.string().email(),
  reporterPhone: z.string().min(8).max(20),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "أكمل بيانات البلاغ ورقم للتواصل." },
      { status: 400 },
    );
  }

  await hydrateListingCatalog();
  const listing = resolveServerListing(parsed.data.listingId);
  if (!listing) {
    return NextResponse.json({ error: "LISTING_NOT_FOUND" }, { status: 404 });
  }

  const session = await getSessionFromCookie();
  const report = await createListingReport({
    listingId: listing.id,
    listingTitle: listing.title,
    listingSlug: listing.slug,
    sellerId: listing.seller.id,
    sellerName: listing.seller.name,
    reason: parsed.data.reason,
    details: parsed.data.details?.trim() ?? "",
    reporterName: parsed.data.reporterName.trim(),
    reporterEmail: parsed.data.reporterEmail.trim().toLowerCase(),
    reporterPhone: parsed.data.reporterPhone.trim(),
    reporterUserId: session?.id,
    guest: !session,
  });

  void notifyListingReported({
    listingTitle: listing.title,
    reportId: report.id,
    reporterName: report.reporterName,
    reporterPhone: report.reporterPhone,
  });

  if (session) {
    void notify({
      userId: session.id,
      type: "listing_report",
      title: "تم استلام بلاغك",
      titleEn: "We received your report",
      body: `استلمنا بلاغك على «${listing.title}». سيراجعه فريق الثقة.`,
      bodyEn: `We received your report on “${listing.title}”.`,
      href: "/notifications",
      idempotencyKey: `LISTING_REPORT_RECEIPT:${report.id}`,
      channels: ["in_app"],
    });
  }

  return NextResponse.json({
    ok: true,
    reportId: report.id,
    report: listingReportReceipt(report),
    adminPath: "/admin/listing-reports",
  });
}
