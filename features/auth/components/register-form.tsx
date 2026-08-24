"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { registerSchema } from "@/utils/validation";
import { sanitizeEmail, sanitizeString } from "@/utils/sanitize";
import { authFetch } from "@/features/auth/services/auth-api";
import { routes } from "@/constants/routes";

function RegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({
      email: sanitizeEmail(email),
      firstName: sanitizeString(firstName),
      lastName: sanitizeString(lastName),
      rememberMe,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setPending(true);
    try {
      const result = await authFetch<{ email: string; demoOtp?: string }>(
        routes.api.auth.requestOtp,
        {
          method: "POST",
          body: JSON.stringify({ ...parsed.data, purpose: "register" }),
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
        purpose: "register",
      });
      router.push(`${routes.verifyOtp}?${params.toString()}`);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>
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
        <Checkbox
          checked={rememberMe}
          onCheckedChange={(v) => setRememberMe(v === true)}
        />
        Remember me
      </label>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending code..." : "Create account"}
      </Button>
    </form>
  );
}

export { RegisterForm };
