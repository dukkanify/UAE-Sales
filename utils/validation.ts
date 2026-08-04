import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address")
  .max(254);

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "OTP must be a 6-digit code");

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be at most 100 characters");

export const loginSchema = z.object({
  email: emailSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  fullName: fullNameSchema,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  token: otpSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
