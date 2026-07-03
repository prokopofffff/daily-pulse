import { TrendingDown, TrendingUp } from "lucide-react";

import { cn, formatPercent } from "@/lib/utils";
import { deltaToneClasses } from "@/lib/ui/tone";

export interface MetricDeltaProps {
  /** Percentage change, e.g. 18.2 for +18.2% or -14 for −14%. */
  value: number;
  /**
   * Render an explicit label instead of a percentage (e.g. "+12", "Needs action").
   * When provided, `value` still drives the up/down direction & color.
   */
  label?: string;
  /**
   * When true, a positive value is bad (e.g. lost customers, errors) and is
   * shown in the danger color. Defaults to false (up = good = green).
   */
  invertColor?: boolean;
  /** Hide the trend arrow icon. */
  hideIcon?: boolean;
  className?: string;
}

/**
 * Colored delta pill: green up / red down, matching the dashboard metric cards.
 * bg-success-subtle / text-success (positive) or bg-danger-subtle / text-danger.
 */
export function MetricDelta({
  value,
  label,
  invertColor = false,
  hideIcon = false,
  className,
}: MetricDeltaProps) {
  const up = value >= 0;
  const positive = invertColor ? !up : up;
  const Icon = up ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex w-fit flex-row items-center gap-1.5 rounded-xl px-2 py-[3px] text-xs font-semibold",
        deltaToneClasses(positive),
        className,
      )}
    >
      {hideIcon ? null : <Icon className="size-[13px] shrink-0" />}
      {label ?? formatPercent(value)}
    </span>
  );
}
