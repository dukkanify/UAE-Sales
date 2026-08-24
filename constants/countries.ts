/**
 * Country / nationality options for registration and profiles (ISO 3166-1 alpha-2).
 */

import type { Country } from "@/types";

export const COUNTRIES: Country[] = [
  { code: "KW", name: "Kuwait", dialCode: "+965", active: true },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", active: true },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", active: true },
  { code: "QA", name: "Qatar", dialCode: "+974", active: true },
  { code: "BH", name: "Bahrain", dialCode: "+973", active: true },
  { code: "OM", name: "Oman", dialCode: "+968", active: true },
  { code: "EG", name: "Egypt", dialCode: "+20", active: true },
  { code: "JO", name: "Jordan", dialCode: "+962", active: true },
  { code: "LB", name: "Lebanon", dialCode: "+961", active: true },
  { code: "IQ", name: "Iraq", dialCode: "+964", active: true },
  { code: "SY", name: "Syria", dialCode: "+963", active: true },
  { code: "PS", name: "Palestine", dialCode: "+970", active: true },
  { code: "TR", name: "Turkey", dialCode: "+90", active: true },
  { code: "IN", name: "India", dialCode: "+91", active: true },
  { code: "PK", name: "Pakistan", dialCode: "+92", active: true },
  { code: "BD", name: "Bangladesh", dialCode: "+880", active: true },
  { code: "PH", name: "Philippines", dialCode: "+63", active: true },
  { code: "GB", name: "United Kingdom", dialCode: "+44", active: true },
  { code: "US", name: "United States", dialCode: "+1", active: true },
  { code: "CA", name: "Canada", dialCode: "+1", active: true },
  { code: "AU", name: "Australia", dialCode: "+61", active: true },
  { code: "DE", name: "Germany", dialCode: "+49", active: true },
  { code: "FR", name: "France", dialCode: "+33", active: true },
  { code: "IT", name: "Italy", dialCode: "+39", active: true },
  { code: "ES", name: "Spain", dialCode: "+34", active: true },
  { code: "NL", name: "Netherlands", dialCode: "+31", active: true },
  { code: "ZA", name: "South Africa", dialCode: "+27", active: true },
  { code: "NG", name: "Nigeria", dialCode: "+234", active: true },
  { code: "KE", name: "Kenya", dialCode: "+254", active: true },
  { code: "MA", name: "Morocco", dialCode: "+212", active: true },
  { code: "TN", name: "Tunisia", dialCode: "+216", active: true },
];

export function listCountries(): Country[] {
  return COUNTRIES.filter((c) => c.active);
}

/** Registration-focused list (includes Other for edge cases). Literal codes for Zod enums. */
export const REGISTRATION_COUNTRIES = [
  { code: "KW", name: "Kuwait" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" },
  { code: "BH", name: "Bahrain" },
  { code: "OM", name: "Oman" },
  { code: "EG", name: "Egypt" },
  { code: "JO", name: "Jordan" },
  { code: "LB", name: "Lebanon" },
  { code: "IQ", name: "Iraq" },
  { code: "SY", name: "Syria" },
  { code: "PS", name: "Palestine" },
  { code: "TR", name: "Turkey" },
  { code: "IN", name: "India" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
  { code: "PH", name: "Philippines" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "MA", name: "Morocco" },
  { code: "TN", name: "Tunisia" },
  { code: "OTHER", name: "Other" },
] as const;

export type RegistrationCountryCode = (typeof REGISTRATION_COUNTRIES)[number]["code"];
