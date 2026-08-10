"use client";

import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/auth-provider";
import { ROLE_LABELS } from "@/constants/roles";
import { ACCOUNT_STATUS_LABELS } from "@/constants/account-status";
import { routes } from "@/constants/routes";
import { authFetch } from "@/features/auth/services/auth-api";
import { updateProfileSchema } from "@/utils/validation";
import { sanitizeString } from "@/utils/sanitize";
import {
  StudentAccountFields,
  type StudentAccountFieldValues,
} from "@/features/profile/components/student-account-fields";
import { SessionManagementCard } from "@/features/profile/components/session-management-card";
import type { UserProfile } from "@/types";

interface ProfilePageViewProps {
  roleLabel: string;
}

function emptyValues(user: UserProfile): StudentAccountFieldValues {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    phone: user.phone ?? "",
    countryCode: user.countryCode ?? "",
    nationality: user.nationality ?? "",
    dateOfBirth: user.dateOfBirth ?? "",
    gender: (user.gender as StudentAccountFieldValues["gender"]) ?? "",
    city: user.city ?? "",
    bio: user.bio ?? "",
    emergencyContactName: user.emergencyContactName ?? "",
    emergencyContactPhone: user.emergencyContactPhone ?? "",
    timezone: user.timezone ?? "UTC",
    language: user.language ?? "en",
  };
}

function ProfilePageView({ roleLabel }: ProfilePageViewProps) {
  const { user, isLoading, setUser, refresh } = useAuth();
  const [values, setValues] = React.useState<StudentAccountFieldValues | null>(null);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (user) setValues(emptyValues(user));
  }, [user]);

  if (isLoading || !user || !values) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  const isStudent = user.role === "student";

  const onChange = (patch: Partial<StudentAccountFieldValues>) => {
    setValues((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = updateProfileSchema.safeParse({
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
      const result = await authFetch<{ user: UserProfile }>(routes.api.auth.profile, {
        method: "PATCH",
        body: JSON.stringify(parsed.data),
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to update account");
        return;
      }

      setUser(result.data.user);
      await refresh();
      toast.success("Account updated");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isStudent ? "My student account" : "Profile"}
        description={
          isStudent
            ? "Your private account with personal, contact, and emergency details."
            : `Your ${roleLabel} account overview.`
        }
        breadcrumbs={[{ label: "Profile" }]}
      />

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-display text-xl">Account status</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
            <Badge variant="outline">{ACCOUNT_STATUS_LABELS[user.status]}</Badge>
            <Badge variant={user.profileComplete ? "default" : "destructive"}>
              {user.profileComplete ? "Complete" : "Incomplete"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <SessionManagementCard />

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">
            {isStudent ? "Student details" : "Account details"}
          </CardTitle>
          <CardDescription>
            {isStudent
              ? "Keep your details up to date so instructors and support can reach you."
              : "Update your name and contact information."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <StudentAccountFields
              values={values}
              onChange={onChange}
              requireStudentBasics={isStudent}
              emailReadonly={user.email}
              disabled={pending}
            />
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export { ProfilePageView };
