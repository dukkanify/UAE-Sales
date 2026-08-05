"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { completeProfileSchema } from "@/utils/validation";
import { sanitizeString } from "@/utils/sanitize";
import { authFetch } from "@/features/auth/services/auth-api";
import { routes } from "@/constants/routes";
import { COUNTRIES } from "@/constants/countries";
import { useAuth } from "@/providers/auth-provider";
import type { UserProfile } from "@/types";

function CompleteProfileForm() {
  const router = useRouter();
  const { user, refresh, setUser } = useAuth();
  const [firstName, setFirstName] = React.useState(user?.firstName ?? "");
  const [lastName, setLastName] = React.useState(user?.lastName ?? "");
  const [phone, setPhone] = React.useState(user?.phone ?? "");
  const [countryCode, setCountryCode] = React.useState(user?.countryCode ?? "");
  const [nationality, setNationality] = React.useState(user?.nationality ?? "");
  const [timezone, setTimezone] = React.useState(user?.timezone ?? "UTC");
  const [language, setLanguage] = React.useState(user?.language ?? "en");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setPhone(user.phone ?? "");
      setCountryCode(user.countryCode ?? "");
      setNationality(user.nationality ?? "");
      setTimezone(user.timezone ?? "UTC");
      setLanguage(user.language ?? "en");
    }
  }, [user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = completeProfileSchema.safeParse({
      firstName: sanitizeString(firstName),
      lastName: sanitizeString(lastName),
      phone: phone ? sanitizeString(phone) : "",
      countryCode,
      nationality,
      timezone,
      language,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setPending(true);
    try {
      const result = await authFetch<{ user: UserProfile; redirectTo: string }>(
        routes.api.auth.completeProfile,
        { method: "POST", body: JSON.stringify(parsed.data) },
      );

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to save profile");
        return;
      }

      setUser(result.data.user);
      await refresh();
      toast.success("Profile completed");
      router.replace(result.data.redirectTo);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971..." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Country</Label>
          <Select value={countryCode || undefined} onValueChange={setCountryCode}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Input
            id="nationality"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input id="language" value={language} onChange={(e) => setLanguage(e.target.value)} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving..." : "Save and continue"}
      </Button>
    </form>
  );
}

export { CompleteProfileForm };
