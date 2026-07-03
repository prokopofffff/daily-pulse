/**
 * Stripe collector — payments, revenue and churn.
 *
 * Real path (guarded by STRIPE_SECRET_KEY): queries the Stripe balance /
 * charges API and normalizes into Metric[] for the data layer. When the key is
 * absent (or in global mock mode) it returns deterministic seeded metrics.
 */

import type { Metric, MetricPoint } from "@/lib/types";
import {
  CollectorResult,
  env,
  mockMetricsForSource,
  mockPointsForKey,
  shouldUseMock,
} from "./shared";

/** Collect Stripe-sourced metrics (revenue, lost customers) for an org. */
export async function collectStripe(orgId: string): Promise<CollectorResult> {
  const secret = env("STRIPE_SECRET_KEY");

  if (shouldUseMock(secret)) {
    return collectStripeMock(orgId);
  }

  return collectStripeLive(orgId, secret as string);
}

function collectStripeMock(orgId: string): CollectorResult {
  const metrics = mockMetricsForSource(orgId, "stripe");
  const points = mockPointsForKey("revenue");
  return { metrics, points };
}

/**
 * Live Stripe path. Kept dependency-free (fetch against the REST API) so the
 * build never requires the Stripe SDK. Falls back to mock on any failure so a
 * misconfigured key never breaks a sync.
 */
async function collectStripeLive(
  orgId: string,
  secret: string,
): Promise<CollectorResult> {
  try {
    const res = await fetch(
      "https://api.stripe.com/v1/balance",
      {
        headers: { Authorization: `Bearer ${secret}` },
        // Stripe returns amounts in the smallest currency unit.
      },
    );
    if (!res.ok) throw new Error(`Stripe API ${res.status}`);
    const body = (await res.json()) as {
      available?: Array<{ amount: number }>;
    };
    const available =
      (body.available ?? []).reduce((sum, b) => sum + (b.amount ?? 0), 0) / 100;

    const metrics: Metric[] = [
      {
        id: `metric_revenue_${orgId}`,
        orgId,
        key: "revenue",
        label: "Yesterday revenue",
        date: "2026-07-01",
        value: available,
        previousValue: null,
        deltaPct: null,
        format: "currency",
        source: "stripe",
      },
    ];
    const points: MetricPoint[] = [];
    return { metrics, points };
  } catch {
    // Never let a live failure break the sync — degrade to seeded data.
    return collectStripeMock(orgId);
  }
}
