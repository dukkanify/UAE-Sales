import { z } from "zod";

import { REGISTRATION_COUNTRIES } from "@/constants/countries";

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "throwaway.email",
  "yopmail.com",
  "sharklasers.com",
]);

const countryCodes = REGISTRATION_COUNTRIES.map((c) => c.code) as [string, ...string[]];

export const emailSchema = z.string().trim().email("Please enter a valid email address").max(254);

function isDisposableEmail(value: string): boolean {
  const domain = value.split("@")[1]?.toLowerCase();
  return domain ? DISPOSABLE_EMAIL_DOMAINS.has(domain) : false;
}
export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "OTP must be a 6-digit code");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters")
  .max(80, "Must be at most 80 characters")
  .regex(/^[\p{L}\p{M}' -]+$/u, "Names may only include letters, spaces, apostrophes, and hyphens");

/** International phone: optional leading +, 8–15 digits after country code. */
export const internationalPhoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .refine((v) => /^\+?[1-9]\d{7,14}$/.test(v), "Enter a valid international phone number");

export const phoneSchema = internationalPhoneSchema.optional().or(z.literal(""));

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character");

export const loginSchema = z.object({
  email: emailSchema,
  rememberMe: z.boolean().optional().default(false),
});

/** Enterprise registration — student by default; instructor only when explicitly chosen / invited. */
export const registerSchema = z
  .object({
    email: emailSchema,
    firstName: nameSchema,
    lastName: nameSchema,
    phone: internationalPhoneSchema,
    countryCode: z.enum(countryCodes, { message: "Select your country" }),
    nationality: z.string().trim().min(2, "Enter your nationality").max(80),
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.boolean(),
    acceptPrivacy: z.boolean(),
    marketingConsent: z.boolean().optional().default(false),
    rememberMe: z.boolean().optional().default(false),
    /** Account intent — students by default; instructors may require admin approval. */
    role: z.enum(["student", "instructor"]).optional().default("student"),
    timezone: z.string().min(1).max(64).optional().default("UTC"),
    language: z.string().min(2).max(10).optional().default("en"),
    /** Honeypot — must remain empty (bot protection). */
    website: z.string().max(200).optional().default(""),
  })
  .refine((data) => !isDisposableEmail(data.email), {
    message: "Please use a permanent email address",
    path: ["email"],
  })
  .refine((data) => !data.website?.trim(), {
    message: "Invalid submission",
    path: ["website"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.acceptTerms === true, {
    message: "You must accept the Terms of Service",
    path: ["acceptTerms"],
  })
  .refine((data) => data.acceptPrivacy === true, {
    message: "You must accept the Privacy Policy",
    path: ["acceptPrivacy"],
  });

export const verifyOtpSchema = z.object({
  email: emailSchema,
  token: otpSchema,
  purpose: z.enum(["login", "register", "reset_password", "verify_email", "booking"]),
  deviceFingerprint: z.string().min(8).max(128).optional().nullable(),
  deviceLabel: z.string().max(120).optional().nullable(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    resetToken: z.string().min(10),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const requiredPhoneSchema = internationalPhoneSchema;

export const genderSchema = z
  .enum(["male", "female", "other", "prefer_not_to_say"])
  .or(z.literal(""));

export const completeProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: requiredPhoneSchema,
  countryCode: z.string().length(2, "Select your country"),
  nationality: z.string().trim().min(2, "Enter your nationality").max(80),
  dateOfBirth: z.string().max(32).optional().or(z.literal("")),
  gender: genderSchema.optional(),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
  emergencyContactName: z.string().trim().max(80).optional().or(z.literal("")),
  emergencyContactPhone: z.string().trim().max(20).optional().or(z.literal("")),
  timezone: z.string().min(1).max(64).default("UTC"),
  language: z.string().min(2).max(10).default("en"),
});

/** Partial updates for an existing account (student or instructor). */
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: requiredPhoneSchema.optional().or(z.literal("")),
  countryCode: z.string().length(2).optional().or(z.literal("")),
  nationality: z.string().trim().max(80).optional().or(z.literal("")),
  dateOfBirth: z.string().max(32).optional().or(z.literal("")),
  gender: genderSchema.optional(),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
  emergencyContactName: z.string().trim().max(80).optional().or(z.literal("")),
  emergencyContactPhone: z.string().trim().max(20).optional().or(z.literal("")),
  timezone: z.string().min(1).max(64).optional(),
  language: z.string().min(2).max(10).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")).or(z.null()),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
