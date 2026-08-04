"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface OtpInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

function OtpInput({
  length = 6,
  value = "",
  onChange,
  disabled,
  className,
  "aria-label": ariaLabel = "One-time password",
}: OtpInputProps) {
  const inputs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const setDigit = (index: number, char: string) => {
    const next = digits.slice();
    next[index] = char.slice(-1).replace(/\D/g, "");
    onChange?.(next.join("").slice(0, length));
  };

  return (
    <div className={cn("flex gap-2", className)} role="group" aria-label={ariaLabel}>
      {digits.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={digit}
          aria-label={`Digit ${index + 1}`}
          className="h-12 w-10 rounded-xl text-center text-lg font-semibold sm:w-12"
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            setDigit(index, v);
            if (v && index < length - 1) inputs.current[index + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[index] && index > 0) {
              inputs.current[index - 1]?.focus();
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            onChange?.(pasted);
            const focusIndex = Math.min(pasted.length, length - 1);
            inputs.current[focusIndex]?.focus();
          }}
        />
      ))}
    </div>
  );
}

export { OtpInput };
