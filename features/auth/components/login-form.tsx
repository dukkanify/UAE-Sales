"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/utils/validation";
import { sanitizeEmail } from "@/utils/sanitize";
import { sendLoginOtp } from "@/services/auth/auth-service";
import { routes } from "@/constants/routes";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email: sanitizeEmail(email) });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }

    setPending(true);
    try {
      const result = await sendLoginOtp(parsed.data);
      if (!result.success) {
        toast.error(result.error ?? "Unable to send OTP");
        return;
      }
      toast.success("Check your email for a one-time code");
      router.push(`${routes.verifyOtp}?email=${encodeURIComponent(parsed.data.email)}`);
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
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending code..." : "Continue with email"}
      </Button>
    </form>
  );
}

export { LoginForm };
