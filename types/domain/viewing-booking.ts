export type ViewingBooking = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingSlug?: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  phone: string;
  date: string;
  time: string;
  visitors: number;
  notes?: string;
  sellerId: string;
  sellerName: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
};
