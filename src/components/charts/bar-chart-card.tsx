"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import type { MetricPoint } from "@/lib/types";
import { cn, formatCompact, formatCurrency } from "@/lib/utils";

/**
 * Serializable value-format token. Functions cannot cross the RSC boundary, so
 * server components pass one of these instead of a formatter callback.
 */
export type BarChartValueFormat = "number" | "currency" | "compact";

export interface BarChartCardProps {
  points: MetricPoint[];
  /** Show weekday labels under each bar (revenue chart). */
  showLabels?: boolean;
  /** How to format the value shown in the tooltip. */
  formatValue?: BarChartValueFormat;
  className?: string;
}

function formatWith(format: BarChartValueFormat, value: number): string {
  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "compact":
      return formatCompact(value);
    default:
      return `${value}`;
  }
}

const PRIMARY = "var(--color-chart-1)"; // #2563EB
const MUTED = "var(--color-accent)"; // #EFF4FF (accent-subtle)

/**
 * Recharts bar chart matching the dashboard: rounded-top bars, the final
 * (most recent) bar highlighted in the primary blue, the rest in accent-subtle.
 */
export function BarChartCard({
  points,
  showLabels = false,
  formatValue = "number",
  className,
}: BarChartCardProps) {
  const lastIndex = points.length - 1;

  return (
    <div className={cn("h-full w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={points}
          margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
          barCategoryGap="18%"
        >
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={
              showLabels
                ? {
                    fill: "var(--color-text-tertiary)",
                    fontSize: 10.5,
                    fontWeight: 500,
                  }
                : false
            }
            height={showLabels ? 18 : 0}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: "var(--color-surface-hover)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as MetricPoint;
              return (
                <div className="rounded-md border border-border bg-card px-2.5 py-1.5 shadow-sm">
                  <div className="text-[11px] font-medium text-muted-foreground">
                    {p.label}
                  </div>
                  <div className="text-[13px] font-semibold text-foreground">
                    {formatWith(formatValue, p.value)}
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[5, 5, 0, 0]} isAnimationActive={false}>
            {points.map((point, i) => (
              <Cell
                key={point.date}
                fill={i === lastIndex ? PRIMARY : MUTED}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
