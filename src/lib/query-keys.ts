/**
 * Centralized React Query key factory for Daily Pulse.
 *
 * All hooks derive their query keys from this factory so that invalidation
 * and cache reads stay consistent across the app. Keys are namespaced by
 * organization so multi-org support works out of the box.
 */

import type { MetricKey, ReportPeriod } from "@/lib/types";

export const queryKeys = {
  /** Root namespace for a single organization. */
  org: (orgId: string) => ["org", orgId] as const,

  organization: (orgId: string) => ["org", orgId, "organization"] as const,
  organizations: () => ["organizations"] as const,

  dashboard: (orgId: string) => ["org", orgId, "dashboard"] as const,
  dashboardMetrics: (orgId: string) =>
    ["org", orgId, "dashboard", "metrics"] as const,
  dashboardSeries: (orgId: string) =>
    ["org", orgId, "dashboard", "series"] as const,
  metricSeries: (orgId: string, key: MetricKey) =>
    ["org", orgId, "dashboard", "series", key] as const,

  /** Prefix covering every report query (all periods, detail, search) — use for invalidation. */
  reportsRoot: (orgId: string) => ["org", orgId, "reports"] as const,
  reports: (orgId: string, period?: ReportPeriod) =>
    ["org", orgId, "reports", { period: period ?? "all" }] as const,
  report: (orgId: string, id: string) =>
    ["org", orgId, "reports", "detail", id] as const,
  reportSearch: (orgId: string, q: string) =>
    ["org", orgId, "reports", "search", q] as const,

  insights: (orgId: string) => ["org", orgId, "insights"] as const,
  recommendedActions: (orgId: string) =>
    ["org", orgId, "recommended-actions"] as const,

  integrations: (orgId: string) => ["org", orgId, "integrations"] as const,

  notifications: (orgId: string) => ["org", orgId, "notifications"] as const,
  deliveryPreferences: (orgId: string) =>
    ["org", orgId, "delivery-preferences"] as const,
} as const;

export type QueryKeys = typeof queryKeys;
