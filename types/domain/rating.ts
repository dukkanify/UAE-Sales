export type Rating = {
  id: string;
  orderId: string;
  listingId: string;
  fromUserId: string;
  toUserId: string;
  /** Integer score from 1 to 5. */
  score: number;
  comment?: string;
  createdAt: string;
};
