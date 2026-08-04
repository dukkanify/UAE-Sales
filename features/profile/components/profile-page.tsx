"use client";

import * as React from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/auth-provider";
import { ROLE_LABELS } from "@/constants/roles";
import { ACCOUNT_STATUS_LABELS } from "@/constants/account-status";

interface ProfilePageViewProps {
  roleLabel: string;
}

function ProfilePageView({ roleLabel }: ProfilePageViewProps) {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description={`Your ${roleLabel} account overview.`}
        breadcrumbs={[{ label: "Profile" }]}
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Name</p>
            <p className="mt-1 font-medium">{user.fullName || "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
            <p className="mt-1 font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
            <Badge className="mt-1" variant="secondary">
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
            <Badge className="mt-1" variant="outline">
              {ACCOUNT_STATUS_LABELS[user.status]}
            </Badge>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Country</p>
            <p className="mt-1 font-medium">{user.countryCode || "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone</p>
            <p className="mt-1 font-medium">{user.phone || "—"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { ProfilePageView };
