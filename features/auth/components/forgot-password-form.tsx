"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema } from "@/utils/validation";
import { sanitizeEmail } from "@/utils/sanitize";
import { authFetch } from "@/features/auth/services/auth-api";
import { routes } from "@/constants/routes";

function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email: sanitizeEmail(email) });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }

    setPending(true);
    try {
      const result = await authFetch<{ email: string; demoOtp?: string }>(
        routes.api.auth.forgotPassword,
        { method: "POST", body: JSON.stringify(parsed.data) },
      );

      if (!result.success) {
        toast.error(result.error ?? "Unable to send reset code");
        return;
      }

      if (result.data && "demoOtp" in (result.data as object)) {
        toast.message(`Demo OTP: ${(result.data as { demoOtp?: string }).demoOtp}`);
      } else {
        toast.success("If an account exists, a reset code was sent.");
      }

      const params = new URLSearchParams({
        email: parsed.data.email,
        purpose: "reset_password",
      });
      router.push(`${routes.verifyOtp}?${params.toString()}`);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending..." : "Send reset code"}
      </Button>
    </form>
  );
}

export { ForgotPasswordForm };
