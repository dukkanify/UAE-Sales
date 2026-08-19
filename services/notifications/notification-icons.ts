import type { IconName } from "@/shared/ui/Icon";
import type { NotificationType } from "@/types/domain/notification";

export function notificationIcon(type: NotificationType): IconName {
  switch (type) {
    case "welcome":
    case "account_verified":
    case "account_approved":
      return "user";
    case "listing_received":
    case "listing_approved":
    case "listing_rejected":
    case "listing_report":
      return "grid";
    case "listing_featured":
    case "listing_featured_payment":
    case "listing_featured_expired":
      return "star";
    case "viewing_booking":
    case "viewing_booking_update":
      return "map";
    case "quote_request":
    case "quote_request_update":
      return "wrench";
    case "job_application":
    case "job_application_update":
      return "briefcase";
    case "order_paid":
    case "order_confirmed":
    case "order_preparing":
    case "order_shipped":
    case "order_out_for_delivery":
    case "order_delivered":
    case "order_cancelled":
    case "payment_failed":
      return "package";
    case "escrow_held":
    case "escrow_released":
    case "order_released":
    case "order_refunded":
    case "order_disputed":
    case "order_dispute_resolved":
    case "seller_proof":
    case "buyer_match":
      return "shield";
    case "chat_message":
      return "message";
    case "favorite_price":
    case "favorite_sold":
      return "heart";
    case "saved_search_match":
      return "search";
    case "account_pending_approval":
    case "admin_ops":
      return "bell";
    default:
      return "bell";
  }
}
