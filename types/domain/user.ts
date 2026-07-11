export type AccountType =
  | "buyer"
  | "seller"
  | "business"
  | "individual"
  | "company";

export type UserRole = "user" | "business" | "admin";

export type AccountStatus = "pending" | "active" | "suspended";

export type RegistrationSource =
  | "STANDARD"
  | "GUEST_CHECKOUT"
  | "OTP"
  | "DEMO";

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
  emailVerifiedAt?: string | null;
  accountStatus?: AccountStatus;
  onboardingStatus?: OnboardingStatus;
  registrationSource?: RegistrationSource;
  isGuestConverted?: boolean;
  normalizedEmail?: string;
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
  passwordHash?: string | null;
};
