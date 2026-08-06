"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

export default function BookError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[book]", error);
  }, [error]);

  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="font-display text-3xl font-semibold text-primary">
        Booking studio interrupted
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        {error.message || "Something went wrong while loading booking."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          onClick={() => {
            reset();
            window.location.assign(routes.book);
          }}
        >
          Reload booking
        </Button>
        <Button variant="outline" asChild>
          <a href={routes.home}>Back to home</a>
        </Button>
      </div>
    </div>
  );
}
