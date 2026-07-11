export type AccountType =
  | "buyer"
  | "seller"
  | "business"
  | "individual"
  | "company";

export type UserRole = "user" | "business" | "admin";

export type AccountStatus = "pending" | "active" | "suspended";

export type OnboardingStatus = "none" | "business_pending" | "business_complete";

export type BusinessProfile = {
  businessName?: string;
  tradeLicenseNumber?: string;
  emirate?: string;
  category?: string;
  contactPhone?: string;
  logoUrl?: string;
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  accountType: AccountType;
  isVerified: boolean;
  joinedAt: string;
  emailVerifiedAt?: string;
  accountStatus?: AccountStatus;
  onboardingStatus?: OnboardingStatus;
  hasPassword?: boolean;
  employeesCount?: number;
  favoritesCount?: number;
  listingsCount?: number;
  role?: UserRole;
  subscription?: string;
  walletBalance?: number;
  businessProfile?: BusinessProfile;
};

export type StoredUser = UserProfile & {
  passwordHash?: string;
};
