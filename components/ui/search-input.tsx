"use client";

import * as React from "react";
import { Search as SearchIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchInputProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
}

function SearchInput({
  className,
  value = "",
  onChange,
  onClear,
  placeholder = "Search...",
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        placeholder={placeholder}
        className="pl-9 pr-9"
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => {
            onChange?.("");
            onClear?.();
          }}
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  );
}

export { SearchInput };
