import { requireAuth } from "@/lib/auth/guards";
import { handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { withDataFallback } from "@/lib/data/fallback";
import { getOrCreateMockConversationByListingSlug } from "@/mock/chat.mock";
import { prisma } from "@/lib/prisma";
import {
  buildConversationId,
  getChatConversationFromDb,
} from "@/lib/repositories/chat.repository";
import { mapDbListing } from "@/lib/mappers";
import { isDatabaseConfigured } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  return handleApiRoute(async () => {
    const user = await requireAuth();
    const { slug } = await context.params;

    const conversation = await withDataFallback(
      async () => {
        const listing = await prisma.listing.findUnique({
          where: { slug },
          include: { seller: true, images: true },
        });

        if (!listing?.seller.userId) {
          return getOrCreateMockConversationByListingSlug(slug, user.id);
        }

        const conversationId = buildConversationId(
          user.id,
          listing.seller.userId,
          listing.id,
        );

        const existing = await getChatConversationFromDb(conversationId, user.id);
        if (existing) {
          return existing;
        }

        await prisma.message.create({
          data: {
            senderId: listing.seller.userId,
            receiverId: user.id,
            listingId: listing.id,
            message: "مرحباً، كيف يمكنني مساعدتك بخصوص هذا الإعلان؟",
            read: false,
          },
        });

        return (
          (await getChatConversationFromDb(conversationId, user.id)) ?? {
            id: conversationId,
            listingId: listing.id,
            listingTitle: listing.titleArabic,
            listingSlug: listing.slug,
            listingImageUrl: mapDbListing({
              ...listing,
              seller: listing.seller,
              images: listing.images,
            }).imageUrl,
            listingPrice: listing.price,
            participantId: listing.seller.userId,
            participantName: listing.seller.sellerName,
            participantRole: "seller" as const,
            lastMessage: "مرحباً، كيف يمكنني مساعدتك بخصوص هذا الإعلان؟",
            lastMessageAt: new Date().toISOString(),
            unreadCount: 1,
            messages: [],
          }
        );
      },
      () => getOrCreateMockConversationByListingSlug(slug, user.id),
      "chat-by-listing",
    );

    if (!isDatabaseConfigured()) {
      return jsonSuccess(conversation);
    }

    return jsonSuccess(conversation);
  });
}
