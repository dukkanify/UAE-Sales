import type { Metadata } from "next";

import { CompleteProfileForm } from "@/features/auth/components/complete-profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Complete profile",
};

export default function CompleteProfilePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_50%)] opacity-[0.07]" />
      <Card className="relative z-10 w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle>Complete your profile</CardTitle>
          <CardDescription>
            Tell us a bit more about yourself to finish setting up your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompleteProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
