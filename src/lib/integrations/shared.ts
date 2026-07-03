/**
 * Shared helpers for the integrations collectors.
 *
 * Every collector follows the same shape: a real SDK/API path guarded by env,
 * and a deterministic mock path (derived from the seeded mock data) when the
 * relevant keys are absent or when the app runs in mock mode.
 *
 * All timestamps used by collectors are hard-coded so sync results are
 * reproducible (no Date.now() / randomness).
 */

import { DEMO_NOW_ISO, USE_MOCK } from "@/lib/config";
import { metrics as mockMetrics, metricSeries as mockSeries } from "@/lib/mock-data";
import type { Metric, MetricKey, MetricPoint } from "@/lib/types";

/** Fixed "now" used across the integrations layer for deterministic syncs. */
export const SYNC_NOW_ISO = DEMO_NOW_ISO;

/** Result of a single collector run. */
export interface CollectorResult {
  metrics: Metric[];
  points: MetricPoint[];
}

/**
 * True when we should serve deterministic mock data instead of hitting a real
 * API. This is the case in global mock mode, or when a required env var for
 * that provider is missing.
 */
export function shouldUseMock(...requiredEnv: Array<string | undefined>): boolean {
  if (USE_MOCK) return true;
  return requiredEnv.some((v) => v == null || v === "");
}

/** Seeded metrics for an org attributed to a given source. */
export function mockMetricsForSource(
  orgId: string,
  source: Metric["source"],
): Metric[] {
  return mockMetrics.filter((m) => m.orgId === orgId && m.source === source);
}

/** Seeded series points for a given metric key (empty when unknown). */
export function mockPointsForKey(key: MetricKey): MetricPoint[] {
  return mockSeries.find((s) => s.key === key)?.points ?? [];
}

/** Read an environment variable, returning undefined for empty strings. */
export function env(name: string): string | undefined {
  const v = process.env[name];
  return v == null || v === "" ? undefined : v;
}
