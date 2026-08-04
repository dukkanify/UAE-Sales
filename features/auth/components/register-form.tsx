"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/utils/validation";
import { sanitizeEmail, sanitizeString } from "@/utils/sanitize";
import { sendRegisterOtp } from "@/services/auth/auth-service";
import { routes } from "@/constants/routes";

function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({
      email: sanitizeEmail(email),
      fullName: sanitizeString(fullName),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setPending(true);
    try {
      const result = await sendRegisterOtp(parsed.data);
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
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder="Alex Rivera"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
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
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending code..." : "Create account"}
      </Button>
    </form>
  );
}

export { RegisterForm };
