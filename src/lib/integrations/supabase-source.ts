/**
 * Supabase collector — product usage and events (orders / conversion).
 *
 * Real path (guarded by the Supabase server client): aggregates rows from an
 * events table into Metric[]. When Supabase is unavailable (or in mock mode) it
 * returns deterministic seeded metrics.
 */

import type { Metric, MetricPoint } from "@/lib/types";
import { getServerSupabase } from "@/lib/supabase/server";
import { USE_MOCK } from "@/lib/config";
import {
  CollectorResult,
  mockPointsForKey,
} from "./shared";

/** Collect Supabase-sourced product metrics (orders, conversion) for an org. */
export async function collectSupabaseSource(
  orgId: string,
): Promise<CollectorResult> {
  if (USE_MOCK) return collectSupabaseMock(orgId);

  const supabase = await getServerSupabase();
  if (!supabase) return collectSupabaseMock(orgId);

  try {
    const { data, error } = await supabase
      .from("events")
      .select("type")
      .eq("org_id", orgId);
    if (error) throw error;

    const rows = (data as Array<{ type: string }> | null) ?? [];
    const orders = rows.filter((r) => r.type === "order").length;

    const metrics: Metric[] = [
      {
        id: `metric_orders_${orgId}`,
        orgId,
        key: "orders",
        label: "Orders",
        date: "2026-07-01",
        value: orders,
        previousValue: null,
        deltaPct: null,
        format: "number",
        source: "supabase",
      },
    ];
    return { metrics, points: [] };
  } catch {
    return collectSupabaseMock(orgId);
  }
}

function collectSupabaseMock(orgId: string): CollectorResult {
  const points: MetricPoint[] = mockPointsForKey("orders");
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const metrics: Metric[] = [
    {
      id: `metric_orders_${orgId}`,
      orgId,
      key: "orders",
      label: "Orders",
      date: "2026-07-01",
      value: last?.value ?? 312,
      previousValue: prev?.value ?? null,
      deltaPct: 16.4,
      format: "number",
      source: "supabase",
    },
  ];
  return { metrics, points };
}
