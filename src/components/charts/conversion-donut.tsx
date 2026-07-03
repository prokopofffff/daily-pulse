"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

export interface ConversionDonutProps {
  /** Conversion percentage, e.g. 3.8 (out of 100). */
  value: number;
  /** Label under the big number, e.g. "of visitors". */
  caption?: string;
  className?: string;
}

const PRIMARY = "var(--color-chart-1)"; // #2563EB
const TRACK = "var(--color-surface-subtle)"; // #FAFAFA

/**
 * Radial donut showing the conversion rate as a filled arc over a muted track,
 * with the percentage centered. Matches the dashboard "Conversions" card.
 */
export function ConversionDonut({
  value,
  caption = "of visitors",
  className,
}: ConversionDonutProps) {
  // Scale the tiny conversion % onto a readable arc while keeping it a fraction
  // of the full ring. ~30% of the ring reads well for a ~4% conversion rate.
  const filled = Math.min(Math.max(value * 8, 4), 100);
  const data = [
    { name: "filled", value: filled },
    { name: "rest", value: 100 - filled },
  ];

  return (
    <div className={cn("relative size-[140px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={54}
            outerRadius={70}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
            cornerRadius={8}
            paddingAngle={0}
          >
            <Cell fill={PRIMARY} />
            <Cell fill={TRACK} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-px">
        <span className="text-[24px] font-bold leading-none text-foreground">
          {value}%
        </span>
        <span className="text-[11px] font-medium text-text-tertiary">
          {caption}
        </span>
      </div>
    </div>
  );
}
