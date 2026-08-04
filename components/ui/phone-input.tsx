"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DIAL_CODES = [
  { code: "+965", label: "KW +965" },
  { code: "+971", label: "AE +971" },
  { code: "+966", label: "SA +966" },
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
] as const;

interface PhoneInputProps {
  value?: string;
  dialCode?: string;
  onValueChange?: (value: string) => void;
  onDialCodeChange?: (code: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  id?: string;
}

function PhoneInput({
  value = "",
  dialCode = "+965",
  onValueChange,
  onDialCodeChange,
  disabled,
  className,
  placeholder = "5XXX XXXX",
  id,
}: PhoneInputProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      <Select value={dialCode} onValueChange={onDialCodeChange} disabled={disabled}>
        <SelectTrigger className="w-[120px] rounded-xl" aria-label="Country dial code">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DIAL_CODES.map((d) => (
            <SelectItem key={d.code} value={d.code}>
              {d.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        className="rounded-xl"
        onChange={(e) => onValueChange?.(e.target.value.replace(/[^\d\s-]/g, ""))}
      />
    </div>
  );
}

export { PhoneInput };
