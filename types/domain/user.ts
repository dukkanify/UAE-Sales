export type AccountType =
  | "buyer"
  | "seller"
  | "business"
  | "individual"
  | "company";

export type UserRole = "user" | "business" | "admin";

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  accountType: AccountType;
  isVerified: boolean;
  joinedAt: string;
  employeesCount?: number;
  favoritesCount?: number;
  listingsCount?: number;
  role?: UserRole;
  subscription?: string;
  walletBalance?: number;
};
