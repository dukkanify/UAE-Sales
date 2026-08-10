"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  id?: string;
}

function ColorPicker({
  value = "#2E7DAA",
  onValueChange,
  disabled,
  className,
  id,
}: ColorPickerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Input
        id={id}
        type="color"
        value={value}
        disabled={disabled}
        onChange={(e) => onValueChange?.(e.target.value)}
        className="h-10 w-14 cursor-pointer rounded-xl p-1"
        aria-label="Pick color"
      />
      <Input
        value={value}
        disabled={disabled}
        onChange={(e) => onValueChange?.(e.target.value)}
        className="rounded-xl font-mono uppercase"
        maxLength={7}
        aria-label="Color hex value"
      />
    </div>
  );
}

export { ColorPicker };
