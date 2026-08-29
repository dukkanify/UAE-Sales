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

/** Granular RBAC actions per admin module (spreadsheet matrix). */
export type AdminAction =
  | "view"
  | "add"
  | "edit"
  | "delete"
  | "approve"
  | "export";

export type AdminActionMatrix = Partial<Record<AdminPermission, AdminAction[]>>;

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
  /** Optional per-module action matrix. Missing matrix = all actions for granted modules. */
  adminActionMatrix?: AdminActionMatrix;
  subscription?: string;
  walletBalance?: number;
  businessProfile?: BusinessProfile;
  preferredLocale?: "ar" | "en";
};

export type StoredUser = UserProfile & {
  passwordHash?: string | null;
  createdAt?: string;
};
