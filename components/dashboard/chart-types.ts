/** Shared chart series point — kept outside `"use client"` chart modules. */
export type SeriesPoint = {
  name: string;
  value: number;
  secondary?: number;
};

/** Brand palette for charts — live here so barrels can import without pulling recharts. */
export const CHART_COLORS = [
  "#143048",
  "#CCA04C",
  "#7C7B80",
  "#2F8F5B",
  "#0D2235",
  "#C48422",
  "#74B2D1",
  "#F3E0B8",
];
