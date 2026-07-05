"use client";

import { useCallback, useState } from "react";
import { getErrorMessage } from "@/services/api";

export function useAsyncAction<TArgs extends unknown[]>(
  action: (...args: TArgs) => Promise<void>,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (...args: TArgs) => {
      setIsLoading(true);
      setError(null);

      try {
        await action(...args);
      } catch (nextError) {
        setError(getErrorMessage(nextError));
      } finally {
        setIsLoading(false);
      }
    },
    [action],
  );

  const reset = useCallback(() => setError(null), []);

  return { error, isLoading, reset, run };
}
