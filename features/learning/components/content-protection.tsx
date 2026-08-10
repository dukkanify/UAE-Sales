"use client";

import * as React from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { ContentProtectionConfig } from "@/types";

interface ContentProtectionShellProps {
  protection: ContentProtectionConfig;
  className?: string;
  children: React.ReactNode;
}

/**
 * Client-side content protection for recorded course lessons (CR002).
 * Deterrents only — browsers cannot fully block screenshots/recording.
 */
function ContentProtectionShell({ protection, className, children }: ContentProtectionShellProps) {
  const [obscured, setObscured] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!protection.disableRightClick) return;
    const node = rootRef.current;
    if (!node) return;
    const onContext = (e: Event) => {
      e.preventDefault();
    };
    node.addEventListener("contextmenu", onContext);
    return () => node.removeEventListener("contextmenu", onContext);
  }, [protection.disableRightClick]);

  React.useEffect(() => {
    if (!protection.blockScreenshotShortcuts) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const blockedCombo =
        e.key === "PrintScreen" ||
        (e.metaKey && e.shiftKey && (key === "3" || key === "4" || key === "5")) ||
        (e.ctrlKey && key === "s") ||
        (e.ctrlKey && key === "p") ||
        (e.metaKey && key === "s") ||
        (e.metaKey && key === "p");

      if (blockedCombo) {
        e.preventDefault();
        toast.message("Screenshots and saving are restricted on protected lessons.");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [protection.blockScreenshotShortcuts]);

  React.useEffect(() => {
    if (!protection.deterScreenRecording) return;

    const sync = () => {
      const hidden = document.visibilityState === "hidden";
      setObscured(hidden);
      if (hidden) {
        rootRef.current?.querySelectorAll("video").forEach((video) => {
          try {
            video.pause();
          } catch {
            // ignore
          }
        });
      }
    };

    const onBlur = () => setObscured(true);
    const onFocus = () => {
      if (document.visibilityState === "visible") setObscured(false);
    };

    document.addEventListener("visibilitychange", sync);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [protection.deterScreenRecording]);

  return (
    <div
      ref={rootRef}
      className={cn("relative", protection.disableRightClick && "select-none", className)}
      data-content-protection="recorded-lesson"
    >
      {children}

      {protection.watermarkEnabled ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <div className="absolute inset-[-20%] flex flex-wrap content-center justify-center gap-x-16 gap-y-24 opacity-[0.14]">
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="rotate-[-24deg] whitespace-nowrap text-xs font-semibold tracking-wide text-foreground sm:text-sm"
              >
                {protection.watermarkText}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {obscured ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-md">
          <p className="max-w-sm px-4 text-center text-sm text-muted-foreground">
            Playback is paused while this tab is hidden to discourage screen recording and account
            sharing.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export { ContentProtectionShell };
