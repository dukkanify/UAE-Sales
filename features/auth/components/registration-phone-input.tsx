"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  buildRegistrationPhone,
  formatLocalPhoneDisplay,
  parseLocalDigitsFromInput,
  REGISTRATION_PHONE_COUNTRIES,
  type RegistrationDialCountry,
  validateLocalMobile,
  localPlaceholder,
} from "@/utils/registration-phone";

type RegistrationPhoneInputProps = {
  dialCountry: RegistrationDialCountry;
  onDialCountryChange: (country: RegistrationDialCountry) => void;
  value: string;
  onChange: (e164: string, localDigits: string) => void;
  error?: string;
  disabled?: boolean;
};

function RegistrationPhoneInput({
  dialCountry,
  onDialCountryChange,
  value,
  onChange,
  error,
  disabled,
}: RegistrationPhoneInputProps) {
  const [localDigits, setLocalDigits] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [selectorOpen, setSelectorOpen] = React.useState(false);
  const selectorRef = React.useRef<HTMLDivElement>(null);

  const selected = REGISTRATION_PHONE_COUNTRIES.find((c) => c.code === dialCountry)!;

  React.useEffect(() => {
    const dial = selected.dialCode;
    if (value.startsWith(dial)) {
      setLocalDigits(parseLocalDigitsFromInput(dialCountry, value));
    }
  }, [value, dialCountry, selected.dialCode]);

  React.useEffect(() => {
    if (!selectorOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setSelectorOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [selectorOpen]);

  const liveError = touched ? validateLocalMobile(dialCountry, localDigits) : null;
  const displayError = error ?? liveError ?? undefined;

  const emitChange = (nextDial: RegistrationDialCountry, nextLocal: string) => {
    onChange(buildRegistrationPhone(nextDial, nextLocal), nextLocal);
  };

  const handleLocalChange = (raw: string) => {
    const nextLocal = parseLocalDigitsFromInput(dialCountry, raw);
    setLocalDigits(nextLocal);
    emitChange(dialCountry, nextLocal);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    handleLocalChange(text);
    setTouched(true);
  };

  const pickCountry = (code: RegistrationDialCountry) => {
    onDialCountryChange(code);
    setSelectorOpen(false);
    const trimmed = parseLocalDigitsFromInput(code, localDigits);
    setLocalDigits(trimmed);
    emitChange(code, trimmed);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="registration-phone-local">Phone number</Label>
      <div
        className={cn(
          // overflow-visible so the country listbox is not clipped (UAE +971 is 2nd option)
          "flex rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          displayError && "border-destructive focus-within:ring-destructive",
        )}
      >
        <div ref={selectorRef} className="relative shrink-0 border-r border-input">
          <button
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={selectorOpen}
            aria-label={`Country code, ${selected.label} ${selected.dialCode}`}
            onClick={() => setSelectorOpen((v) => !v)}
            className="flex h-10 min-w-[7.25rem] items-center gap-1.5 rounded-l-md px-2.5 text-sm text-foreground hover:bg-muted/40 disabled:opacity-50 sm:min-w-[8.5rem] sm:px-3"
          >
            <span className="text-base leading-none" aria-hidden>
              {selected.flag}
            </span>
            <span className="font-medium tabular-nums">{selected.dialCode}</span>
            <ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          </button>
          {selectorOpen ? (
            <ul
              role="listbox"
              aria-label="Phone country code"
              className="absolute left-0 bottom-full z-50 mb-1 min-w-[14rem] overflow-hidden rounded-md border border-border bg-popover py-1 shadow-md"
            >
              {REGISTRATION_PHONE_COUNTRIES.map((option) => (
                <li key={option.code} role="option" aria-selected={option.code === dialCountry}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted",
                      option.code === dialCountry && "bg-muted/60 font-medium",
                    )}
                    onClick={() => pickCountry(option.code)}
                  >
                    <span aria-hidden>{option.flag}</span>
                    <span>{option.label}</span>
                    <span className="ml-auto tabular-nums text-muted-foreground">
                      {option.dialCode}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <Input
          id="registration-phone-local"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={localPlaceholder(dialCountry)}
          value={formatLocalPhoneDisplay(dialCountry, localDigits)}
          onChange={(e) => handleLocalChange(e.target.value)}
          onPaste={handlePaste}
          onBlur={() => setTouched(true)}
          disabled={disabled}
          aria-invalid={Boolean(displayError)}
          aria-describedby={displayError ? "registration-phone-error" : "registration-phone-hint"}
          className="h-10 rounded-none rounded-r-md border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      {displayError ? (
        <p id="registration-phone-error" className="text-xs text-destructive" role="alert">
          {displayError}
        </p>
      ) : (
        <p id="registration-phone-hint" className="text-xs text-muted-foreground">
          {dialCountry === "KW"
            ? "Kuwait mobile — 8 digits starting with 5, 6, or 9"
            : "UAE mobile — 9 digits starting with 5"}
        </p>
      )}
    </div>
  );
}

export { RegistrationPhoneInput };
