"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Presentation } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { registerSchema } from "@/utils/validation";
import { sanitizeEmail, sanitizeString } from "@/utils/sanitize";
import { authFetch } from "@/features/auth/services/auth-api";
import { routes } from "@/constants/routes";

type RegisterRole = "student" | "instructor";

const ROLE_COPY: Record<
  RegisterRole,
  { headline: string; description: string; cta: string; tip: string }
> = {
  student: {
    headline: "Join as a student",
    description: "Learner access to ATPL courses, live Zoom coaching, and exam tools.",
    cta: "Create student account",
    tip: "Best if you are studying for PPL/ATPL theory and want a course path.",
  },
  instructor: {
    headline: "Join as an instructor",
    description: "Teach assigned courses, mentor students, and run live Zoom sessions.",
    cta: "Create instructor account",
    tip: "Instructor accounts may need admin approval before teaching tools unlock.",
  },
};

function RegisterForm({
  role: initialRole = "student",
  onRoleChange,
}: {
  role?: RegisterRole;
  onRoleChange?: (role: RegisterRole) => void;
}) {
  const router = useRouter();
  const [role, setRole] = React.useState<RegisterRole>(initialRole);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  const copy = ROLE_COPY[role];

  const selectRole = (next: RegisterRole) => {
    setRole(next);
    onRoleChange?.(next);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({
      email: sanitizeEmail(email),
      firstName: sanitizeString(firstName),
      lastName: sanitizeString(lastName),
      rememberMe,
      role,
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
        role: parsed.data.role,
      });
      router.push(`${routes.verifyOtp}?${params.toString()}`);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <fieldset className="space-y-2.5">
        <legend className="text-sm font-medium text-foreground">Account type</legend>
        <div
          className="grid grid-cols-2 gap-2 rounded-2xl bg-[rgb(18_36_51_/0.06)] p-1.5"
          role="radiogroup"
          aria-label="Account type"
        >
          {(
            [
              {
                id: "student" as const,
                label: "Student",
                sub: "Learner",
                icon: GraduationCap,
              },
              {
                id: "instructor" as const,
                label: "Instructor",
                sub: "Teacher",
                icon: Presentation,
              },
            ] as const
          ).map((option) => {
            const selected = role === option.id;
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => selectRole(option.id)}
                className={cn(
                  "flex min-h-[4.25rem] flex-col items-start gap-1 rounded-xl px-3.5 py-3 text-start transition duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "bg-[var(--surface-ink)] text-white shadow-[0_10px_28px_-18px_rgba(11,26,36,0.85)]"
                    : "text-foreground/80 hover:bg-white/70 hover:text-foreground",
                )}
              >
                <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <Icon className={cn("h-4 w-4", selected ? "text-accent" : "text-primary/80")} />
                  {option.label}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-medium uppercase tracking-[0.16em]",
                    selected ? "text-white/55" : "text-muted-foreground",
                  )}
                >
                  {option.sub}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{copy.tip}</p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            placeholder="Alex"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            placeholder="Reed"
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

      <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
        Remember me on this device
      </label>

      <Button type="submit" variant="accent" className="hero-cta-primary w-full" disabled={pending}>
        {pending ? "Sending code..." : copy.cta}
      </Button>
    </form>
  );
}

export { RegisterForm, ROLE_COPY };
export type { RegisterRole };
