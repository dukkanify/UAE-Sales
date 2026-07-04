export type AccountType =
  | "buyer"
  | "seller"
  | "business"
  | "individual"
  | "company";

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  accountType: AccountType;
  isVerified: boolean;
  joinedAt: string;
};
