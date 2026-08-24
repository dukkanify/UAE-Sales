/** Shared chart series point — kept outside `"use client"` chart modules. */
export type SeriesPoint = {
  name: string;
  value: number;
  secondary?: number;
};
