export type SearchSuggestionKind =
  | "query"
  | "category"
  | "city"
  | "listing"
  | "recent"
  | "brand"
  | "model";

export type SearchSuggestion = {
  href: string;
  hint?: string;
  kind: SearchSuggestionKind;
  label: string;
};
