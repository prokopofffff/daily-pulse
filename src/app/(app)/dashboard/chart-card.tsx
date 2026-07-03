import type { ReactNode } from "react";

import { MetricDelta } from "@/components/ui-ext/metric-delta";
import { cn } from "@/lib/utils";

export interface ChartCardProps {
  title: string;
  /** Pre-formatted headline value, e.g. "$48,250" or "21.4k". */
  value: string;
  /** Percentage delta driving the pill; omit to hide the pill. */
  deltaValue?: number;
  /** Positive delta is bad (danger color) — e.g. traffic down is red. */
  invertDelta?: boolean;
  /** The chart body (fills remaining height). */
  children: ReactNode;
  className?: string;
}

/**
 * White chart container matching the dashboard: header with title + big value
 * on the left and a colored delta pill on the right, chart fills the rest.
 */
export function ChartCard({
  title,
  value,
  deltaValue,
  invertDelta = false,
  children,
  className,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-[14px] rounded-[14px] border border-border bg-card p-[18px]",
        className,
      )}
    >
      <div className="flex shrink-0 flex-row items-start justify-between">
        <div className="flex flex-col gap-[3px]">
          <span className="text-[13px] font-medium text-muted-foreground">
            {title}
          </span>
          <span className="text-[21px] font-bold leading-none text-foreground">
            {value}
          </span>
        </div>
        {deltaValue !== undefined ? (
          <MetricDelta value={deltaValue} invertColor={invertDelta} />
        ) : null}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
