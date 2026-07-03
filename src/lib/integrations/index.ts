/**
 * Integrations registry.
 *
 * Maps each IntegrationProvider to a collector that returns normalized
 * Metric[] / MetricPoint[]. Phase 2's server actions call `syncIntegration`;
 * the report/AI pipeline can call `collectAllMetrics` to gather every
 * connected source's metrics at once.
 *
 * In mock mode (default) collectors resolve to deterministic seeded data, so
 * syncs always succeed without any external calls.
 */

import type {
  IntegrationProvider,
  Metric,
  MetricPoint,
} from "@/lib/types";
import { listIntegrations } from "@/lib/data";
import { collectStripe } from "./stripe";
import { collectGoogleAnalytics } from "./google-analytics";
import { collectGithub } from "./github";
import { collectSupabaseSource } from "./supabase-source";
import { CollectorResult, SYNC_NOW_ISO } from "./shared";

/** A collector gathers normalized metrics for one provider. */
export type Collector = (orgId: string) => Promise<CollectorResult>;

/** Registry of provider → collector. Providers without a first-party */
/* collector (hubspot, shopify) are ingested via webhooks instead. */
export const collectors: Partial<Record<IntegrationProvider, Collector>> = {
  stripe: collectStripe,
  google_analytics: collectGoogleAnalytics,
  github: collectGithub,
  supabase: collectSupabaseSource,
};

/** Providers that expose a pull-based collector. */
export const COLLECTOR_PROVIDERS = Object.keys(
  collectors,
) as IntegrationProvider[];

export interface SyncResult {
  provider: IntegrationProvider;
  metrics: Metric[];
  points: MetricPoint[];
  syncedAt: string;
}

/**
 * Sync a single integration. Matches the contract Phase 2's
 * `syncIntegrationAction` imports: `syncIntegration(orgId, provider) => void`.
 * Runs the provider's collector (mock or live) so a real deployment would
 * persist the returned metrics; in mock mode it simply resolves.
 *
 * Throws for providers that have no collector so a misconfigured sync surfaces
 * loudly in non-mock mode (the action wraps this in try/catch for mock).
 */
export async function syncIntegration(
  orgId: string,
  provider: IntegrationProvider,
): Promise<void> {
  const collector = collectors[provider];
  if (!collector) {
    throw new Error(`No collector registered for provider "${provider}"`);
  }
  // Run the collector for its side effect (would persist in a real backend).
  await collector(orgId);
}

/** Sync and return the collected result for a single provider. */
export async function syncIntegrationDetailed(
  orgId: string,
  provider: IntegrationProvider,
): Promise<SyncResult> {
  const collector = collectors[provider];
  if (!collector) {
    throw new Error(`No collector registered for provider "${provider}"`);
  }
  const { metrics, points } = await collector(orgId);
  return { provider, metrics, points, syncedAt: SYNC_NOW_ISO };
}

/**
 * Collect metrics from every *connected* integration that has a collector.
 * Failures on any single provider are swallowed so one bad source can't block
 * the rest of the batch.
 */
export async function collectAllMetrics(orgId: string): Promise<Metric[]> {
  const integrations = await listIntegrations(orgId);
  const connected = integrations.filter(
    (i) => i.status === "connected" && collectors[i.provider],
  );

  const results = await Promise.all(
    connected.map(async (i) => {
      try {
        const { metrics } = await collectors[i.provider]!(orgId);
        return metrics;
      } catch {
        return [] as Metric[];
      }
    }),
  );

  return results.flat();
}

/* Re-export the ingest helpers so callers can import everything from the */
/* registry barrel. */
export { parseCsvToMetrics } from "./csv";
export { ingestWebhook, isWebhookProvider } from "./webhook";
export type { WebhookIngestResult } from "./webhook";
export { SYNC_NOW_ISO } from "./shared";
export type { CollectorResult } from "./shared";
