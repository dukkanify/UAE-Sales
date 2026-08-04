"use client";

import { WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SystemLayout } from "@/components/layout/app-layouts";

export default function OfflinePage() {
  return (
    <SystemLayout>
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <WifiOff className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-primary">
          No internet connection
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Check your network connection and try again. Your work is safe once you are back online.
        </p>
        <Button className="mt-8" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    </SystemLayout>
  );
}
