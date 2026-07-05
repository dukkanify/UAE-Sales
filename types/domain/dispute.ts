export type DisputeStatus = "open" | "under_review" | "resolved" | "closed";

export type DisputeReason =
  | "not_received"
  | "not_as_described"
  | "damaged"
  | "wrong_item"
  | "seller_unresponsive"
  | "other";

export type DisputeResolution =
  | "full_refund"
  | "partial_refund"
  | "replacement"
  | "release_to_seller";

export type Dispute = {
  id: string;
  orderId: string;
  reason: DisputeReason;
  description: string;
  preferredResolution: DisputeResolution;
  status: DisputeStatus;
  evidenceNote?: string;
  createdAt: string;
};

export type CreateDisputeInput = {
  orderId: string;
  reason: DisputeReason;
  description: string;
  preferredResolution: DisputeResolution;
  evidenceNote?: string;
};
