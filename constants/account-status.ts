/**
 * Account status values.
 */

export const ACCOUNT_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;

export type AccountStatus = (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  pending: "Pending",
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

/** Statuses that may authenticate into the platform */
export const AUTHENTICATABLE_STATUSES: AccountStatus[] = [
  ACCOUNT_STATUS.ACTIVE,
  ACCOUNT_STATUS.PENDING,
];
