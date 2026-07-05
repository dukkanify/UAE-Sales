import type { UserProfile } from "@/types";

export const mockCurrentUser: UserProfile = {
  id: "user-current",
  fullName: "أحمد المنصوري",
  email: "ahmed.almansoori@email.com",
  phone: "0501234567",
  city: "دبي",
  accountType: "seller",
  isVerified: true,
  joinedAt: "2026-01-15",
};

export { marketplaceSellers, resolveSeller } from "./sellers.mock";
export type { SellerProfile } from "./sellers.mock";
