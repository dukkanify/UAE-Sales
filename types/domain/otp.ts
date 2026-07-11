export type OtpPurpose = "REGISTER" | "LOGIN" | "PASSWORD_RESET" | "EMAIL_CHANGE";

export type OtpRecord = {
  id: string;
  email: string;
  purpose: OtpPurpose;
  codeHash: string;
  attempts: number;
  expiresAt: string;
  createdAt: string;
  consumedAt?: string;
  resendAvailableAt: string;
  metadata?: Record<string, string>;
};
