import type { MetricSeries } from "@/lib/types";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { ConversionDonut } from "@/components/charts/conversion-donut";
import { formatCompact, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

import { ChartCard } from "./chart-card";

/**
 * Dashboard charts: a Revenue bar chart + Conversion donut on top, then a row
 * of three mini bar charts (Orders, Traffic, Support tickets).
 */
export function ChartsSection({ series }: { series: MetricSeries[] }) {
  const byKey = new Map(series.map((s) => [s.key, s]));

  const revenue = byKey.get("revenue");
  const conversion = byKey.get("conversion");
  const orders = byKey.get("orders");
  const traffic = byKey.get("visitors");
  const support = byKey.get("support_tickets");

  return (
    <div className="flex w-full flex-col gap-[14px]">
      {/* Row 1: Revenue bar (grows) + Conversions donut */}
      <div className="flex w-full flex-col gap-[14px] lg:h-[236px] lg:flex-row">
        {revenue ? (
          <ChartCard
            className="min-h-[236px] flex-1 lg:min-h-0"
            title={revenue.label}
            value={formatCurrency(revenue.total)}
            deltaValue={revenue.deltaPct ?? 0}
          >
            <BarChartCard
              points={revenue.points}
              showLabels
              formatValue="currency"
            />
          </ChartCard>
        ) : null}

        {conversion ? (
          <div className="flex min-h-[236px] flex-col gap-[10px] rounded-[14px] border border-border bg-card p-[18px] lg:min-h-0 lg:w-[320px] lg:shrink-0">
            <span className="text-[13px] font-medium text-muted-foreground">
              Conversions
            </span>
            <div className="flex flex-1 flex-col items-center justify-center">
              <ConversionDonut value={conversion.total} />
            </div>
            <div className="flex flex-row items-center justify-center gap-1.5">
              <span className="size-[7px] rounded-full bg-success" />
              <span className="text-[11.5px] font-medium text-success">
                +0.4 pts vs prior day
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Row 2: three mini bar charts */}
      <div className="grid w-full grid-cols-1 gap-[14px] md:grid-cols-3 lg:h-[236px]">
        {orders ? (
          <ChartCard
            className={cn("min-h-[220px] lg:min-h-0")}
            title="Orders"
            value={`${orders.total}`}
            deltaValue={orders.deltaPct ?? 0}
          >
            <BarChartCard points={orders.points} />
          </ChartCard>
        ) : null}

        {traffic ? (
          <ChartCard
            className={cn("min-h-[220px] lg:min-h-0")}
            title="Traffic"
            value={formatCompact(traffic.total)}
            deltaValue={traffic.deltaPct ?? 0}
          >
            <BarChartCard points={traffic.points} formatValue="compact" />
          </ChartCard>
        ) : null}

        {support ? (
          <ChartCard
            className={cn("min-h-[220px] lg:min-h-0")}
            title="Support tickets"
            value={`${support.total}`}
            deltaValue={support.deltaPct ?? 0}
            invertDelta
          >
            <BarChartCard points={support.points} />
          </ChartCard>
        ) : null}
      </div>
    </div>
  );
}
