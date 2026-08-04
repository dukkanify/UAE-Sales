"use client";

import dynamic from "next/dynamic";
import * as React from "react";

import type { SeriesPoint } from "@/components/dashboard/chart-types";

const loading = () => (
  <div className="h-72 w-full animate-pulse rounded-lg bg-muted/40" aria-hidden />
);

export const ChartCard = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.ChartCard),
  { ssr: false, loading },
);

export const AreaTrendChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.AreaTrendChart),
  { ssr: false, loading },
);

export const LineTrendChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.LineTrendChart),
  { ssr: false, loading },
);

export const BarsChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.BarsChart),
  { ssr: false, loading },
);

export const DonutChart = dynamic(
  () => import("@/components/dashboard/charts").then((m) => m.DonutChart),
  { ssr: false, loading },
);

export type { SeriesPoint };
