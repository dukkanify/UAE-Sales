export type OtpPurpose =
  | "REGISTER"
  | "LOGIN"
  | "PASSWORD_RESET"
  | "SET_PASSWORD"
  | "EMAIL_CHANGE"
  | "SENSITIVE_ACTION";

export type OtpRecord = {
  id: string;
  email: string;
  userId?: string;
  purpose: OtpPurpose;
  otpHash: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: string;
  createdAt: string;
  consumedAt?: string;
  resendAvailableAt: string;
  metadata?: Record<string, string>;
};
