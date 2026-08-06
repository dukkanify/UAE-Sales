"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { completeProfileSchema } from "@/utils/validation";
import { sanitizeString } from "@/utils/sanitize";
import { authFetch } from "@/features/auth/services/auth-api";
import { routes } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import {
  StudentAccountFields,
  type StudentAccountFieldValues,
} from "@/features/profile/components/student-account-fields";
import type { UserProfile } from "@/types";

function emptyValues(user: UserProfile | null): StudentAccountFieldValues {
  return {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
    countryCode: user?.countryCode ?? "",
    nationality: user?.nationality ?? "",
    dateOfBirth: user?.dateOfBirth ?? "",
    gender: (user?.gender as StudentAccountFieldValues["gender"]) ?? "",
    city: user?.city ?? "",
    bio: user?.bio ?? "",
    emergencyContactName: user?.emergencyContactName ?? "",
    emergencyContactPhone: user?.emergencyContactPhone ?? "",
    timezone: user?.timezone ?? "UTC",
    language: user?.language ?? "en",
  };
}

function CompleteProfileForm() {
  const router = useRouter();
  const { user, refresh, setUser } = useAuth();
  const [values, setValues] = React.useState<StudentAccountFieldValues>(() => emptyValues(user));
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (user) setValues(emptyValues(user));
  }, [user]);

  const onChange = (patch: Partial<StudentAccountFieldValues>) => {
    setValues((prev) => ({ ...prev, ...patch }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = completeProfileSchema.safeParse({
      firstName: sanitizeString(values.firstName),
      lastName: sanitizeString(values.lastName),
      phone: sanitizeString(values.phone),
      countryCode: values.countryCode,
      nationality: sanitizeString(values.nationality),
      dateOfBirth: values.dateOfBirth || "",
      gender: values.gender || "",
      city: sanitizeString(values.city),
      bio: sanitizeString(values.bio),
      emergencyContactName: sanitizeString(values.emergencyContactName),
      emergencyContactPhone: sanitizeString(values.emergencyContactPhone),
      timezone: values.timezone,
      language: values.language,
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
      toast.success("Student account ready");
      router.replace(result.data.redirectTo);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <StudentAccountFields
        values={values}
        onChange={onChange}
        requireStudentBasics
        emailReadonly={user?.email}
        disabled={pending}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving..." : "Save and continue"}
      </Button>
    </form>
  );
}

export { CompleteProfileForm };
