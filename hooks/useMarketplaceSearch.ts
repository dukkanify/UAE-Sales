"use client";

import { useMemo, useState } from "react";

export function useMarketplaceSearch() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("dubai");

  const filters = useMemo(
    () => ({
      query,
      city,
    }),
    [city, query],
  );

  return {
    filters,
    setCity,
    setQuery,
  };
}
