"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorState } from "@/shared/components/ErrorState";
import { Button } from "@/shared/ui/Button";

type RouteErrorFallbackProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
};

const USER_MESSAGE = "تعذر تحميل الصفحة مؤقتًا. يرجى المحاولة مرة أخرى.";
const MAX_RETRIES = 1;

function createErrorReference(error: Error & { digest?: string }) {
  const digest = error.digest?.slice(0, 8) ?? "unknown";
  const stamp = Date.now().toString(36);
  return `ERR-${digest}-${stamp}`;
}

export function RouteErrorFallback({
  error,
  reset,
  title = "تعذر تحميل الصفحة",
}: RouteErrorFallbackProps) {
  const [retryCount, setRetryCount] = useState(0);
  const errorRef = useMemo(() => createErrorReference(error), [error]);
  const loggedRef = useRef(false);

  useEffect(() => {
    if (loggedRef.current) return;
    loggedRef.current = true;

    if (process.env.NODE_ENV !== "production") {
      console.error(`[RouteError:${errorRef}]`, error);
      return;
    }

    console.error(`[RouteError:${errorRef}]`, error.message);
  }, [error, errorRef]);

  const canRetry = retryCount < MAX_RETRIES;

  function handleRetry() {
    if (!canRetry) return;
    setRetryCount((value) => value + 1);
    reset();
  }

  return (
    <ErrorState
      description={USER_MESSAGE}
      onRetry={canRetry ? handleRetry : undefined}
      title={title}
      variant="server"
    >
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <Button href="/" variant="secondary">
          العودة إلى الرئيسية
        </Button>
      </div>
      {process.env.NODE_ENV !== "production" ? (
        <p className="mx-auto mt-4 max-w-md text-xs text-muted" dir="ltr">
          {errorRef}: {error.message}
        </p>
      ) : null}
    </ErrorState>
  );
}
