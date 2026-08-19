export type AccountType =
  | "buyer"
  | "seller"
  | "business"
  | "individual"
  | "company";

export type UserRole = "user" | "business" | "admin";

export type AdminPermission =
  | "users"
  | "listings"
  | "orders"
  | "disputes"
  | "payments"
  | "reports"
  | "settings"
  | "categories";

export type AccountStatus = "pending" | "active" | "suspended";

export type RegistrationSource =
  | "STANDARD"
  | "GUEST_CHECKOUT"
  | "OTP"
  | "DEMO";

export type OnboardingStatus = "none" | "business_pending" | "business_complete";

export type NotificationPreferenceKey =
  | "email"
  | "bookingUpdates"
  | "orderUpdates"
  | "messages"
  | "marketing"
  | "savedSearches";

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

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
  /** Bumped on password reset so older session cookies stop working. */
  sessionVersion?: number;
  passwordUpdatedAt?: string | null;
  onboardingStatus?: OnboardingStatus;
  registrationSource?: RegistrationSource;
  isGuestConverted?: boolean;
  normalizedEmail?: string;
  hasPassword?: boolean;
  employeesCount?: number;
  favoritesCount?: number;
  listingsCount?: number;
  role?: UserRole;
  /** When role is admin, empty/undefined = full access; otherwise gated permissions. */
  adminPermissions?: AdminPermission[];
  subscription?: string;
  walletBalance?: number;
  businessProfile?: BusinessProfile;
  locale?: "ar" | "en";
  notificationPreferences?: NotificationPreferences;
};

export type StoredUser = UserProfile & {
  passwordHash?: string | null;
  createdAt?: string;
};
