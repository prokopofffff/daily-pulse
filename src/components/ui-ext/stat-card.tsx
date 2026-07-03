import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { MetricDelta } from "@/components/ui-ext/metric-delta";

export interface StatCardProps {
  /** Metric label, e.g. "Yesterday revenue". */
  label: string;
  /** Pre-formatted value, e.g. "$48,250" or "142". */
  value: string;
  /** Optional trailing icon in the card header (lucide). */
  icon?: LucideIcon;
  /** Percentage delta driving the colored pill. */
  deltaValue?: number;
  /** Override the delta pill text (e.g. "+12", "Needs action"). */
  deltaLabel?: string;
  /** Treat a positive delta as bad (danger color) — e.g. lost customers. */
  invertDelta?: boolean;
  /** Small muted hint under the delta, e.g. "vs. last week". */
  hint?: string;
  className?: string;
}

/**
 * Reusable metric card matching the dashboard: label + optional icon, large
 * value, and a colored delta pill. White surface, 1px border, rounded-lg.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  deltaValue,
  deltaLabel,
  invertDelta = false,
  hint,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-3 rounded-lg border border-border bg-card p-4",
        className,
      )}
    >
      <div className="flex flex-row items-center justify-between">
        <span className="text-[12.5px] font-medium text-muted-foreground">
          {label}
        </span>
        {Icon ? (
          <Icon className="size-[15px] shrink-0 text-text-tertiary" />
        ) : null}
      </div>
      <div className="text-[26px] font-bold leading-none text-foreground">
        {value}
      </div>
      {deltaValue !== undefined || deltaLabel ? (
        <div className="flex flex-row items-center gap-2">
          <MetricDelta
            value={deltaValue ?? 0}
            label={deltaLabel}
            invertColor={invertDelta}
          />
          {hint ? (
            <span className="text-[11px] text-text-tertiary">{hint}</span>
          ) : null}
        </div>
      ) : hint ? (
        <span className="text-[11px] text-text-tertiary">{hint}</span>
      ) : null}
    </div>
  );
}
