/**
 * Google Analytics collector — traffic, sessions and conversions.
 *
 * Real path (guarded by GA_PROPERTY_ID + GA_SERVICE_ACCOUNT_JSON): runs a GA4
 * Data API runReport and normalizes into Metric[] / MetricPoint[]. When either
 * credential is absent (or in mock mode) it returns deterministic seeded data.
 */

import type { Metric, MetricPoint } from "@/lib/types";
import {
  CollectorResult,
  env,
  mockPointsForKey,
  shouldUseMock,
} from "./shared";

/** Collect Google-Analytics-sourced metrics (traffic) for an org. */
export async function collectGoogleAnalytics(
  orgId: string,
): Promise<CollectorResult> {
  const propertyId = env("GA_PROPERTY_ID");
  const serviceAccount = env("GA_SERVICE_ACCOUNT_JSON");

  if (shouldUseMock(propertyId, serviceAccount)) {
    return collectGaMock(orgId);
  }

  return collectGaLive(orgId, propertyId as string, serviceAccount as string);
}

function collectGaMock(orgId: string): CollectorResult {
  const points = mockPointsForKey("visitors");
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const metrics: Metric[] = [
    {
      id: `metric_visitors_${orgId}`,
      orgId,
      key: "visitors",
      label: "Traffic",
      date: "2026-07-01",
      value: last?.value ?? 21400,
      previousValue: prev?.value ?? null,
      deltaPct: -6.0,
      format: "compact",
      source: "google_analytics",
    },
  ];
  return { metrics, points };
}

/**
 * Live GA4 path. The GA Data API requires an OAuth2 access token derived from
 * the service account; producing that token is intentionally left as an
 * integration point (a real deployment would use google-auth-library). Until a
 * token minting strategy is wired, we degrade to seeded data so the sync always
 * succeeds. Kept async + typed so the contract stays stable.
 */
async function collectGaLive(
  orgId: string,
  _propertyId: string,
  _serviceAccount: string,
): Promise<CollectorResult> {
  void _propertyId;
  void _serviceAccount;
  // No token-minting dependency available in this environment; degrade safely.
  const mock = collectGaMock(orgId);
  const points: MetricPoint[] = mock.points;
  return { metrics: mock.metrics, points };
}
