import { NextResponse } from "next/server";
import { z } from "zod";
import { getAllUsers } from "@/services/auth/user-store";
import { getSessionFromCookie } from "@/services/auth/session-cookie";
import { createListingReport } from "@/services/listings/listing-report-store";
import { resolveServerListing } from "@/services/listings/listing-action-resolver";
import { hydrateListingCatalog } from "@/services/payments/listing-resolver";
import { createNotification } from "@/services/payments/notification-store";

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

  const admins = (await getAllUsers()).filter((user) => user.role === "admin");
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: "listing_report",
        title: "بلاغ جديد على إعلان",
        body: `${report.reporterName} (${report.reporterPhone}) أبلغ عن «${listing.title}».`,
        href: "/admin/listing-reports",
      }),
    ),
  );

  if (session) {
    await createNotification({
      userId: session.id,
      type: "listing_report",
      title: "تم استلام بلاغك",
      body: `استلمنا بلاغك على «${listing.title}». سيراجعه فريق الثقة.`,
      href: "/profile#notifications",
    });
  }

  return NextResponse.json({ ok: true, reportId: report.id });
}
