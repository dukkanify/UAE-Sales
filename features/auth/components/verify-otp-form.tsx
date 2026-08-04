"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyOtpSchema } from "@/utils/validation";
import { sanitizeEmail } from "@/utils/sanitize";
import { verifyOtp } from "@/services/auth/auth-service";
import { routes } from "@/constants/routes";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState(searchParams.get("email") ?? "");
  const [token, setToken] = React.useState("");
  const [pending, setPending] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = verifyOtpSchema.safeParse({
      email: sanitizeEmail(email),
      token: token.trim(),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid code");
      return;
    }

    setPending(true);
    try {
      const result = await verifyOtp(parsed.data);
      if (!result.success) {
        toast.error(result.error ?? "Verification failed");
        return;
      }
      toast.success("Signed in successfully");
      router.replace(routes.dashboard);
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
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="token">One-time code</Label>
        <Input
          id="token"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          maxLength={6}
          value={token}
          onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Verifying..." : "Verify and continue"}
      </Button>
    </form>
  );
}

export { VerifyOtpForm };
