"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-6 font-sans text-foreground">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-semibold">Critical error</h1>
          <p className="mt-3 text-muted-foreground">
            {error.message || "The application failed to load."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
