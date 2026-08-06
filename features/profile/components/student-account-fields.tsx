"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/constants/countries";

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

export type GenderValue = (typeof GENDER_OPTIONS)[number]["value"] | "";

export interface StudentAccountFieldValues {
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: string;
  nationality: string;
  dateOfBirth: string;
  gender: GenderValue;
  city: string;
  bio: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  timezone: string;
  language: string;
}

interface StudentAccountFieldsProps {
  values: StudentAccountFieldValues;
  onChange: (patch: Partial<StudentAccountFieldValues>) => void;
  /** When true, contact + identity fields are marked required. */
  requireStudentBasics?: boolean;
  disabled?: boolean;
  emailReadonly?: string | null;
}

function StudentAccountFields({
  values,
  onChange,
  requireStudentBasics = true,
  disabled = false,
  emailReadonly,
}: StudentAccountFieldsProps) {
  return (
    <div className="space-y-6">
      {emailReadonly ? (
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={emailReadonly} disabled readOnly />
        </div>
      ) : null}

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Personal details</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name *</Label>
            <Input
              id="firstName"
              value={values.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              required
              disabled={disabled}
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name *</Label>
            <Input
              id="lastName"
              value={values.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              required
              disabled={disabled}
              autoComplete="family-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={values.dateOfBirth}
              onChange={(e) => onChange({ dateOfBirth: e.target.value })}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={values.gender || undefined}
              onValueChange={(v) => onChange({ gender: v as GenderValue })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Contact & identity</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone {requireStudentBasics ? "*" : ""}</Label>
            <Input
              id="phone"
              value={values.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+971 50 000 0000"
              required={requireStudentBasics}
              disabled={disabled}
              autoComplete="tel"
            />
          </div>
          <div className="space-y-2">
            <Label>Country {requireStudentBasics ? "*" : ""}</Label>
            <Select
              value={values.countryCode || undefined}
              onValueChange={(v) => onChange({ countryCode: v })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name} ({c.dialCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality {requireStudentBasics ? "*" : ""}</Label>
            <Input
              id="nationality"
              value={values.nationality}
              onChange={(e) => onChange({ nationality: e.target.value })}
              placeholder="e.g. Emirati"
              required={requireStudentBasics}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={values.city}
              onChange={(e) => onChange({ city: e.target.value })}
              disabled={disabled}
              autoComplete="address-level2"
            />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">About you</p>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={values.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="Training goals, aircraft experience, or notes for your instructor…"
            rows={3}
            maxLength={500}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Emergency contact</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Contact name</Label>
            <Input
              id="emergencyContactName"
              value={values.emergencyContactName}
              onChange={(e) => onChange({ emergencyContactName: e.target.value })}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">Contact phone</Label>
            <Input
              id="emergencyContactPhone"
              value={values.emergencyContactPhone}
              onChange={(e) => onChange({ emergencyContactPhone: e.target.value })}
              disabled={disabled}
              autoComplete="tel"
            />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Preferences</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={values.timezone}
              onChange={(e) => onChange({ timezone: e.target.value })}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input
              id="language"
              value={values.language}
              onChange={(e) => onChange({ language: e.target.value })}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { StudentAccountFields };
