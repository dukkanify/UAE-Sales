import { getAdminSettings } from "@/services/admin/admin-settings-store";
import { getAllUsers } from "@/services/auth/user-store";
import {
  getListingById,
  upsertListing,
} from "@/services/listings/listing-store";
import { createNotification } from "@/services/payments/notification-store";
import type { Listing, ListingStatus, UserProfile } from "@/types";

const SUBMITTABLE: ListingStatus[] = ["draft", "rejected", "expired"];

export function isListingLive(listing: Pick<Listing, "status">): boolean {
  return listing.status === "active";
}

export function canPreviewListing(
  listing: Pick<Listing, "status" | "seller">,
  user: Pick<UserProfile, "id" | "role"> | null,
): boolean {
  if (isListingLive(listing)) return true;
  if (!user) return false;
  if (user.role === "admin") return true;
  return listing.seller.id === user.id;
}

export async function resolveSellerPublishStatus(): Promise<
  Extract<ListingStatus, "active" | "pending_review">
> {
  const settings = await getAdminSettings();
  return settings.listingReviewRequired === false ? "active" : "pending_review";
}

export async function upsertSellerListing(
  listing: Listing,
  sellerId: string,
): Promise<Listing> {
  const existing = await getListingById(listing.id);
  if (existing && existing.seller.id !== sellerId) {
    throw new Error("UNAUTHORIZED");
  }

  const publishStatus = await resolveSellerPublishStatus();
  const seller = {
    ...(existing?.seller ?? listing.seller),
    id: sellerId,
    name: listing.seller?.name || existing?.seller.name || "بائع سوقنا",
  };

  let status: ListingStatus;
  let rejectionReason: string | undefined;
  let submittedAt: string | undefined;
  let reviewedAt: string | undefined;
  let reviewedBy: string | undefined;
  let shouldNotifySubmit = false;

  if (!existing) {
    status = publishStatus;
    submittedAt = new Date().toISOString();
    shouldNotifySubmit = status === "pending_review";
  } else if (
    existing.status === "draft" ||
    existing.status === "rejected" ||
    existing.status === "expired"
  ) {
    status = publishStatus;
    submittedAt = new Date().toISOString();
    shouldNotifySubmit = status === "pending_review";
  } else {
    status = existing.status;
    rejectionReason = existing.rejectionReason;
    submittedAt = existing.submittedAt;
    reviewedAt = existing.reviewedAt;
    reviewedBy = existing.reviewedBy;
  }

  const saved = await upsertListing({
    ...existing,
    ...listing,
    seller,
    status,
    rejectionReason,
    submittedAt,
    reviewedAt,
    reviewedBy,
  });

  if (shouldNotifySubmit) {
    await notifyListingSubmitted(saved);
  } else if (!existing && saved.status === "active") {
    await notifyListingApproved(saved);
  }

  return saved;
}

export async function submitListingForReview(
  id: string,
  sellerId: string,
): Promise<Listing> {
  const listing = await getListingById(id);
  if (!listing) {
    throw new Error("NOT_FOUND");
  }
  if (listing.seller.id !== sellerId) {
    throw new Error("UNAUTHORIZED");
  }
  if (listing.status === "pending_review") {
    return listing;
  }
  if (!SUBMITTABLE.includes(listing.status)) {
    throw new Error("INVALID_STATUS");
  }

  const status = await resolveSellerPublishStatus();
  const saved = await upsertListing({
    ...listing,
    status,
    submittedAt: new Date().toISOString(),
    rejectionReason: undefined,
    reviewedAt: undefined,
    reviewedBy: undefined,
  });

  if (saved.status === "pending_review") {
    await notifyListingSubmitted(saved);
  } else {
    await notifyListingApproved(saved);
  }

  return saved;
}

export async function applyAdminListingDecision(
  listing: Listing,
  input: {
    reviewerName: string;
    status: ListingStatus;
    rejectionReason?: string;
  },
): Promise<Listing> {
  if (input.status === "rejected") {
    const reason = input.rejectionReason?.trim() ?? "";
    if (reason.length < 8) {
      throw new Error("REJECT_REASON_REQUIRED");
    }
    const saved = await upsertListing({
      ...listing,
      status: "rejected",
      rejectionReason: reason,
      reviewedAt: new Date().toISOString(),
      reviewedBy: input.reviewerName,
    });
    await notifyListingRejected(saved);
    return saved;
  }

  if (input.status === "active") {
    const saved = await upsertListing({
      ...listing,
      status: "active",
      rejectionReason: undefined,
      reviewedAt: new Date().toISOString(),
      reviewedBy: input.reviewerName,
    });
    await notifyListingApproved(saved);
    return saved;
  }

  return upsertListing({
    ...listing,
    status: input.status,
  });
}

export async function notifyListingSubmitted(listing: Listing): Promise<void> {
  const href = listingHref(listing);
  if (listing.seller.id) {
    await createNotification({
      userId: listing.seller.id,
      type: "listing_submitted",
      title: "إعلانك قيد المراجعة",
      body: `استلمنا «${listing.title}». يظهر في البحث بعد اعتماد فريق سوقنا.`,
      href,
    });
  }

  const admins = (await getAllUsers()).filter(
    (user) => user.role === "admin" && user.id !== listing.seller.id,
  );
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: "listing_submitted",
        title: "إعلان جديد بانتظار المراجعة",
        body: `«${listing.title}» من ${listing.seller.name} — ${listing.city}.`,
        href: "/admin/listings",
      }),
    ),
  );
}

async function notifyListingApproved(listing: Listing): Promise<void> {
  if (!listing.seller.id) return;
  await createNotification({
    userId: listing.seller.id,
    type: "listing_approved",
    title: "تم اعتماد إعلانك",
    body: `«${listing.title}» ظاهر الآن للمشترين في سوقنا.`,
    href: listingHref(listing),
  });
}

async function notifyListingRejected(listing: Listing): Promise<void> {
  if (!listing.seller.id) return;
  const reason = listing.rejectionReason
    ? ` السبب: ${listing.rejectionReason}`
    : "";
  await createNotification({
    userId: listing.seller.id,
    type: "listing_rejected",
    title: "يحتاج إعلانك إلى تعديل",
    body: `رُفض «${listing.title}» مؤقتاً.${reason} عدّله ثم أعد الإرسال للمراجعة.`,
    href: "/dashboard/listings",
  });
}

function listingHref(listing: Listing): string {
  if (listing.id.startsWith("local-")) {
    return `/listings/local/${listing.id}`;
  }
  return `/listings/${listing.slug}`;
}
