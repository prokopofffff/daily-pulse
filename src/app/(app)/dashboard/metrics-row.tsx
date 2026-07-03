import {
  DollarSign,
  LifeBuoy,
  TriangleAlert,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import type { Metric } from "@/lib/types";
import { StatCard } from "@/components/ui-ext/stat-card";
import { formatCurrency } from "@/lib/utils";

const ICONS: Partial<Record<Metric["key"], LucideIcon>> = {
  revenue: DollarSign,
  new_customers: UserPlus,
  lost_customers: UserMinus,
  support_tickets: LifeBuoy,
  critical_issues: TriangleAlert,
};

function deltaCount(m: Metric): string | undefined {
  if (m.previousValue == null) return undefined;
  const diff = m.value - m.previousValue;
  return `${diff >= 0 ? "+" : "−"}${Math.abs(diff)}`;
}

/**
 * The 5 dashboard metric cards. Each seeded metric maps to a StatCard with the
 * design's icon, label, formatted value and colored delta.
 */
export function MetricsRow({ metrics }: { metrics: Metric[] }) {
  const byKey = new Map(metrics.map((m) => [m.key, m]));

  const revenue = byKey.get("revenue");
  const newCustomers = byKey.get("new_customers");
  const lostCustomers = byKey.get("lost_customers");
  const support = byKey.get("support_tickets");
  const critical = byKey.get("critical_issues");

  return (
    <div className="flex w-full flex-row flex-wrap gap-[14px]">
      {revenue ? (
        <StatCard
          className="min-w-[160px] rounded-[14px]"
          label={revenue.label}
          value={formatCurrency(revenue.value)}
          icon={ICONS.revenue}
          deltaValue={revenue.deltaPct ?? 0}
        />
      ) : null}

      {newCustomers ? (
        <StatCard
          className="min-w-[160px] rounded-[14px]"
          label={newCustomers.label}
          value={`${newCustomers.value}`}
          icon={ICONS.new_customers}
          deltaValue={newCustomers.deltaPct ?? 0}
          deltaLabel={deltaCount(newCustomers)}
        />
      ) : null}

      {lostCustomers ? (
        <StatCard
          className="min-w-[160px] rounded-[14px]"
          label={lostCustomers.label}
          value={`${lostCustomers.value}`}
          icon={ICONS.lost_customers}
          deltaValue={lostCustomers.deltaPct ?? 0}
          deltaLabel={deltaCount(lostCustomers)}
          invertDelta
        />
      ) : null}

      {support ? (
        <StatCard
          className="min-w-[160px] rounded-[14px]"
          label={support.label}
          value={`${support.value}`}
          icon={ICONS.support_tickets}
          deltaValue={support.deltaPct ?? 0}
          invertDelta
        />
      ) : null}

      {critical ? (
        <StatCard
          className="min-w-[160px] rounded-[14px]"
          label={critical.label}
          value={`${critical.value}`}
          icon={ICONS.critical_issues}
          deltaValue={1}
          deltaLabel="Needs action"
          invertDelta
        />
      ) : null}
    </div>
  );
}
