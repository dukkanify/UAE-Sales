import type { Country } from "@/types";

export const COUNTRIES: Country[] = [
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", active: true },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", active: true },
  { code: "EG", name: "Egypt", dialCode: "+20", active: true },
  { code: "JO", name: "Jordan", dialCode: "+962", active: true },
  { code: "US", name: "United States", dialCode: "+1", active: true },
  { code: "GB", name: "United Kingdom", dialCode: "+44", active: true },
  { code: "IN", name: "India", dialCode: "+91", active: true },
  { code: "PK", name: "Pakistan", dialCode: "+92", active: true },
  { code: "CA", name: "Canada", dialCode: "+1", active: true },
  { code: "AU", name: "Australia", dialCode: "+61", active: true },
  { code: "DE", name: "Germany", dialCode: "+49", active: true },
  { code: "FR", name: "France", dialCode: "+33", active: true },
  { code: "TR", name: "Turkey", dialCode: "+90", active: true },
  { code: "QA", name: "Qatar", dialCode: "+974", active: true },
  { code: "KW", name: "Kuwait", dialCode: "+965", active: true },
  { code: "BH", name: "Bahrain", dialCode: "+973", active: true },
  { code: "OM", name: "Oman", dialCode: "+968", active: true },
];

export function listCountries(): Country[] {
  return COUNTRIES.filter((c) => c.active);
}
