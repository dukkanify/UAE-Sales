"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  showToggle?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showToggle = true, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-10", className)}
          autoComplete={props.autoComplete ?? "current-password"}
          {...props}
        />
        {showToggle ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        ) : null}
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
