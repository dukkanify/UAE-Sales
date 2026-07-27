"use client";

import { useEffect } from "react";
import { addRecentSearch } from "@/services/storage";

type RecordRecentSearchProps = {
  query?: string;
};

/** Records a completed search navigation into recent history. */
export function RecordRecentSearch({ query }: RecordRecentSearchProps) {
  useEffect(() => {
    if (!query?.trim()) return;
    addRecentSearch(query);
  }, [query]);

  return null;
}
