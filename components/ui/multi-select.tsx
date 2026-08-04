"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function MultiSelect({
  options,
  value = [],
  onValueChange,
  placeholder = "Select…",
  disabled,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggle = (v: string) => {
    const next = value.includes(v) ? value.filter((x) => x !== v) : [...value, v];
    onValueChange?.(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          className={cn("h-auto min-h-10 w-full justify-between rounded-xl px-3 py-2", className)}
        >
          <div className="flex flex-wrap gap-1">
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              value.map((v) => {
                const opt = options.find((o) => o.value === v);
                return (
                  <Badge key={v} variant="secondary" className="gap-1">
                    {opt?.label ?? v}
                    <button
                      type="button"
                      className="rounded-sm hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(v);
                      }}
                      aria-label={`Remove ${opt?.label ?? v}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem key={opt.value} value={opt.label} onSelect={() => toggle(opt.value)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(opt.value) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { MultiSelect };
