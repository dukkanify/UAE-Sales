"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SeriesPoint } from "@/components/dashboard/chart-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

interface ChartCardProps {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  heightClassName?: string;
}

export function ChartCard({
  title,
  description,
  className,
  children,
  heightClassName = "h-72",
}: ChartCardProps) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setReady(true);
  }, []);

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className={cn("w-full min-h-[18rem]", heightClassName)}>
          {ready ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={288}>
              {children as React.ReactElement}
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full animate-pulse rounded-lg bg-muted/40" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AreaTrendChart({
  data,
  color = CHART_COLORS[1],
  gradientId = "areaFill",
}: {
  data: SeriesPoint[];
  color?: string;
  gradientId?: string;
}) {
  return (
    <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.35} />
          <stop offset="95%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
      <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
      <YAxis tickLine={false} axisLine={false} fontSize={12} width={36} />
      <Tooltip />
      <Area
        type="monotone"
        dataKey="value"
        stroke={color}
        fill={`url(#${gradientId})`}
        strokeWidth={2}
      />
    </AreaChart>
  );
}

export function LineTrendChart({
  data,
  keys = ["value"],
}: {
  data: SeriesPoint[];
  keys?: string[];
}) {
  return (
    <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
      <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
      <YAxis tickLine={false} axisLine={false} fontSize={12} width={36} />
      <Tooltip />
      <Legend />
      {keys.map((key, i) => (
        <Line
          key={key}
          type="monotone"
          dataKey={key}
          stroke={CHART_COLORS[i % CHART_COLORS.length]}
          strokeWidth={2}
          dot={false}
        />
      ))}
    </LineChart>
  );
}

export function BarsChart({ data }: { data: SeriesPoint[] }) {
  return (
    <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
      <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
      <YAxis tickLine={false} axisLine={false} fontSize={12} width={36} />
      <Tooltip />
      <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
    </BarChart>
  );
}

export function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        innerRadius={55}
        outerRadius={90}
        paddingAngle={3}
      >
        {data.map((_, index) => (
          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}

export type { SeriesPoint };
