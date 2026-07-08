"use client";

import { useCallback, useRef, useState } from "react";
import { getErrorMessage } from "@/services/api";

export function useAsyncAction<TArgs extends unknown[]>(
  action: (...args: TArgs) => Promise<void>,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRunningRef = useRef(false);

  const run = useCallback(
    async (...args: TArgs) => {
      if (isRunningRef.current) {
        return;
      }

      isRunningRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        await action(...args);
      } catch (nextError) {
        setError(getErrorMessage(nextError));
      } finally {
        isRunningRef.current = false;
        setIsLoading(false);
      }
    },
    [action],
  );

  const reset = useCallback(() => setError(null), []);

  return { error, isLoading, reset, run };
}
