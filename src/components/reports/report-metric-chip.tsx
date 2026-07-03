import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ReportMetricChipProps {
  label: string;
  value: string;
  deltaPct: number | null;
  /** Treat "up" as bad (e.g. Tickets) — flips the trend color. */
  invert?: boolean;
  className?: string;
}

/**
 * Inline metric readout used inside a report card's stat row and in the detail
 * view: small tertiary label over a bold value with a colored trend arrow.
 */
export function ReportMetricChip({
  label,
  value,
  deltaPct,
  invert = false,
  className,
}: ReportMetricChipProps) {
  const up = deltaPct != null && deltaPct >= 0;
  const good = deltaPct == null ? true : invert ? !up : up;
  const Icon = up ? TrendingUp : TrendingDown;

  return (
    <div className={cn("flex flex-col gap-[3px]", className)}>
      <span className="text-[11.5px] font-medium text-text-tertiary">
        {label}
      </span>
      <div className="flex flex-row items-center gap-[5px]">
        <span className="text-[15px] font-bold text-foreground">{value}</span>
        {deltaPct != null ? (
          <Icon
            aria-hidden
            className={cn(
              "size-[13px]",
              good ? "text-success" : "text-danger",
            )}
          />
        ) : null}
      </div>
    </div>
  );
}
