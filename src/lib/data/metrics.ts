import { USE_MOCK } from "@/lib/config";
import { metrics, metricSeries } from "@/lib/mock-data";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Metric, MetricKey, MetricSeries } from "@/lib/types";

/** The 5 headline metric cards for the dashboard. */
export async function getDashboardMetrics(orgId: string): Promise<Metric[]> {
  if (USE_MOCK) return metrics.filter((m) => m.orgId === orgId);

  const supabase = await getServerSupabase();
  if (!supabase) return metrics.filter((m) => m.orgId === orgId);

  const { data } = await supabase
    .from("metrics")
    .select("*")
    .eq("org_id", orgId);

  return (data as Metric[] | null) ?? [];
}

/** A single time-series (with points) for a given metric key. */
export async function getMetricSeries(
  orgId: string,
  key: MetricKey,
): Promise<MetricSeries | null> {
  if (USE_MOCK) return metricSeries.find((s) => s.key === key) ?? null;

  const supabase = await getServerSupabase();
  if (!supabase) return metricSeries.find((s) => s.key === key) ?? null;

  const { data } = await supabase
    .from("metric_points")
    .select("*")
    .eq("org_id", orgId)
    .eq("metric_key", key)
    .order("date", { ascending: true });

  const points = (data as MetricSeries["points"] | null) ?? [];
  if (points.length === 0) return null;
  const last = points[points.length - 1];
  return {
    key,
    label: key,
    format: "number",
    total: last.value,
    deltaPct: null,
    points,
  };
}

/** All chart series used across the dashboard. */
export async function getDashboardSeries(
  orgId: string,
): Promise<MetricSeries[]> {
  if (USE_MOCK) return metricSeries;

  const supabase = await getServerSupabase();
  if (!supabase) return metricSeries;

  // In non-mock mode, assemble from metric_points; kept simple for the demo.
  void orgId;
  return metricSeries;
}
