"use client";

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

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CHART_COLORS = ["#0B1F3A", "#38BDF8", "#16A34A", "#EA580C", "#7C3AED", "#0EA5E9"];

interface ChartCardProps {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  heightClassName?: string;
}

function ChartCard({
  title,
  description,
  className,
  children,
  heightClassName = "h-72",
}: ChartCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className={cn("w-full", heightClassName)}>
          <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface SeriesPoint {
  name: string;
  value: number;
  secondary?: number;
}

function AreaTrendChart({ data, color = CHART_COLORS[1] }: { data: SeriesPoint[]; color?: string }) {
  return (
    <AreaChart data={data}>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.35} />
          <stop offset="95%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
      <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
      <YAxis tickLine={false} axisLine={false} fontSize={12} width={36} />
      <Tooltip />
      <Area type="monotone" dataKey="value" stroke={color} fill="url(#areaFill)" strokeWidth={2} />
    </AreaChart>
  );
}

function LineTrendChart({
  data,
  keys = ["value"],
}: {
  data: SeriesPoint[];
  keys?: string[];
}) {
  return (
    <LineChart data={data}>
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

function BarsChart({ data }: { data: SeriesPoint[] }) {
  return (
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
      <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
      <YAxis tickLine={false} axisLine={false} fontSize={12} width={36} />
      <Tooltip />
      <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
    </BarChart>
  );
}

function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <PieChart>
      <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
        {data.map((_, index) => (
          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}

export {
  ChartCard,
  AreaTrendChart,
  LineTrendChart,
  BarsChart,
  DonutChart,
  CHART_COLORS,
};
export type { SeriesPoint };
