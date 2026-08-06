"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "@/components/ui/app-link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { loginSchema } from "@/utils/validation";
import { sanitizeEmail } from "@/utils/sanitize";
import { authFetch } from "@/features/auth/services/auth-api";
import { routes } from "@/constants/routes";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({
      email: sanitizeEmail(email),
      rememberMe,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }

    setPending(true);
    try {
      const result = await authFetch<{ email: string; demoOtp?: string }>(
        routes.api.auth.requestOtp,
        {
          method: "POST",
          body: JSON.stringify({ ...parsed.data, purpose: "login" }),
        },
      );

      if (!result.success) {
        toast.error(result.error ?? "Unable to send OTP");
        return;
      }

      if (result.data?.demoOtp) {
        toast.message(`Demo OTP: ${result.data.demoOtp}`);
      } else {
        toast.success("Check your email for a one-time code");
      }

      const params = new URLSearchParams({
        email: parsed.data.email,
        purpose: "login",
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
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
        Remember me for 30 days
      </label>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending code..." : "Continue with email"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href={routes.forgotPassword} className="text-primary hover:underline">
          Forgot password?
        </Link>
      </p>
    </form>
  );
}

export { LoginForm };
