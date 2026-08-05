"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    void fetch("/api/ops/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        digest: error.digest,
        path: typeof window !== "undefined" ? window.location.pathname : null,
      }),
    }).catch(() => undefined);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--destructive)_0%,_transparent_50%)] opacity-[0.06]" />
      <div className="relative z-10 mx-auto max-w-lg text-center">
        <p className="font-display text-7xl font-bold tracking-tight text-primary/15 sm:text-8xl">
          500
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-primary">
          Something went wrong
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          {error.message || "An unexpected error occurred. You can try again or return home."}
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-muted-foreground/70">Ref: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => {
              reset();
              if (typeof window !== "undefined") window.location.reload();
            }}
          >
            Try again
          </Button>
          <Button variant="outline" asChild>
            <a href={routes.book}>Open booking</a>
          </Button>
          <Button variant="outline" asChild>
            <a href={routes.home}>Back to home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
