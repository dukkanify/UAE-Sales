import type { UserProfile } from "@/types";
import { demoAccounts } from "./demo-accounts.mock";

export const mockCurrentUser: UserProfile = demoAccounts[0].profile;

export { marketplaceSellers, resolveSeller } from "./sellers.mock";
export type { SellerProfile } from "./sellers.mock";
