"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface TimePickerProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

function TimePicker({
  value = "",
  onValueChange,
  disabled,
  className,
  id,
  "aria-label": ariaLabel = "Time",
}: TimePickerProps) {
  return (
    <Input
      id={id}
      type="time"
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn("rounded-xl", className)}
      onChange={(e) => onValueChange?.(e.target.value)}
    />
  );
}

export { TimePicker };
