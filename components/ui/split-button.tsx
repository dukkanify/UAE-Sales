"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SplitButtonProps {
  label: string;
  onPrimaryClick?: () => void;
  items: { label: string; onSelect: () => void; destructive?: boolean }[];
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  disabled?: boolean;
}

function SplitButton({
  label,
  onPrimaryClick,
  items,
  variant = "default",
  size = "default",
  className,
  disabled,
}: SplitButtonProps) {
  return (
    <div className={cn("inline-flex", className)}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={onPrimaryClick}
        className="rounded-r-none border-r border-primary-foreground/20"
      >
        {label}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size === "icon" ? "icon" : size}
            disabled={disabled}
            className="rounded-l-none px-2"
            aria-label={`${label} options`}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {items.map((item) => (
            <DropdownMenuItem
              key={item.label}
              onSelect={item.onSelect}
              className={item.destructive ? "text-destructive" : undefined}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export { SplitButton };
