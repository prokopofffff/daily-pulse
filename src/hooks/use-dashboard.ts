"use client";

/**
 * Dashboard data hooks: metric cards + chart series.
 */

import { useQuery } from "@tanstack/react-query";

import { CURRENT_ORG_ID } from "@/lib/config";
import {
  getDashboardMetrics,
  getDashboardSeries,
  getMetricSeries,
} from "@/lib/data";
import { queryKeys } from "@/lib/query-keys";
import type { Metric, MetricKey, MetricSeries } from "@/lib/types";

export function useDashboardMetrics(orgId: string = CURRENT_ORG_ID) {
  return useQuery<Metric[]>({
    queryKey: queryKeys.dashboardMetrics(orgId),
    queryFn: () => getDashboardMetrics(orgId),
  });
}

export function useDashboardSeries(orgId: string = CURRENT_ORG_ID) {
  return useQuery<MetricSeries[]>({
    queryKey: queryKeys.dashboardSeries(orgId),
    queryFn: () => getDashboardSeries(orgId),
  });
}

export function useMetricSeries(
  key: MetricKey,
  orgId: string = CURRENT_ORG_ID,
) {
  return useQuery<MetricSeries | null>({
    queryKey: queryKeys.metricSeries(orgId, key),
    queryFn: () => getMetricSeries(orgId, key),
  });
}

/** Convenience: cards + series together for the dashboard page. */
export function useDashboard(orgId: string = CURRENT_ORG_ID) {
  const metrics = useDashboardMetrics(orgId);
  const series = useDashboardSeries(orgId);
  return {
    metrics,
    series,
    isLoading: metrics.isLoading || series.isLoading,
    isError: metrics.isError || series.isError,
  };
}
