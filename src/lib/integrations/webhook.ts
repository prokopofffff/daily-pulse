/**
 * Webhook collector — ingests real-time events pushed by a provider and
 * normalizes the payload into Metric[].
 *
 * The HTTP route (src/app/api/webhooks/[provider]/route.ts) is responsible for
 * verifying the signing secret; this module trusts its input and focuses on
 * normalization. Each provider maps its event shape onto the shared Metric
 * contract; unknown providers/payloads yield an empty result rather than
 * throwing so a stray webhook never 500s.
 *
 * Normalization is driven by a data-only REGISTRY (WEBHOOK_REGISTRY): each
 * provider is a list of rules that (a) decide whether they apply to a payload
 * and (b) describe the metric to emit. A single normalizer walks the rules, so
 * adding a provider/event is a data entry rather than a new switch branch.
 */

import type {
  Metric,
  MetricFormat,
  MetricKey,
  IntegrationProvider,
} from "@/lib/types";
import { SYNC_NOW_ISO } from "./shared";

export interface WebhookIngestResult {
  provider: IntegrationProvider;
  metrics: Metric[];
  accepted: boolean;
}

/**
 * A single normalization rule for one provider.
 *
 * `match` inspects the parsed payload and returns the numeric value for the
 * metric when the rule applies, or `undefined` when it does not (the rule is
 * then skipped). The remaining fields describe the emitted Metric.
 */
interface NormalizationRule {
  key: MetricKey;
  label: string;
  format: MetricFormat;
  source: Metric["source"];
  /** Return the metric value when this rule matches, else undefined. */
  match: (body: Record<string, unknown>) => number | undefined;
}

/**
 * Provider → ordered list of normalization rules. Each matching rule emits one
 * metric, in order. This table is the single source of truth for how inbound
 * webhooks map onto the Metric contract.
 */
const WEBHOOK_REGISTRY: Record<IntegrationProvider, NormalizationRule[]> = {
  // Stripe: charge.succeeded / charge.refunded style events.
  stripe: [
    {
      key: "revenue",
      label: "Yesterday revenue",
      format: "currency",
      source: "stripe",
      match: (body) => {
        if (asString(body.type) !== "charge.succeeded") return undefined;
        const amount = asNumber(pick(pick(body, "data"), "object")?.amount);
        return amount == null ? undefined : amount / 100; // smallest unit -> major
      },
    },
    {
      key: "lost_customers",
      label: "Lost customers",
      format: "number",
      source: "stripe",
      match: (body) => {
        if (asString(body.type) !== "charge.refunded") return undefined;
        const amount = asNumber(pick(pick(body, "data"), "object")?.amount);
        return amount == null ? undefined : 1;
      },
    },
  ],

  // GitHub: issues opened/reopened with a "critical" label.
  github: [
    {
      key: "critical_issues",
      label: "Critical issues",
      format: "number",
      source: "github",
      match: (body) => {
        const action = asString(body.action);
        const issue = pick(body, "issue");
        const labels = Array.isArray(issue?.labels) ? issue!.labels : [];
        const isCritical = labels.some(
          (l) => isRecord(l) && asString(l.name)?.toLowerCase() === "critical",
        );
        return isCritical && (action === "opened" || action === "reopened")
          ? 1
          : undefined;
      },
    },
  ],

  // Shopify: orders/create webhook — always an order, plus revenue when present.
  shopify: [
    {
      key: "orders",
      label: "Orders",
      format: "number",
      source: "shopify",
      match: () => 1,
    },
    {
      key: "revenue",
      label: "Yesterday revenue",
      format: "currency",
      source: "shopify",
      match: (body) =>
        asNumber(body.total_price) ??
        asNumber(pick(body, "order")?.total_price),
    },
  ],

  // HubSpot: new contact subscription.
  hubspot: [
    {
      key: "new_customers",
      label: "New customers",
      format: "number",
      source: "hubspot",
      match: (body) =>
        asString(body.subscriptionType) === "contact.creation"
          ? 1
          : undefined,
    },
  ],

  // Providers without a webhook normalizer emit nothing.
  google_analytics: [],
  supabase: [],
};

/** Providers that publish webhooks we know how to normalize. */
const WEBHOOK_PROVIDERS: readonly IntegrationProvider[] = (
  Object.keys(WEBHOOK_REGISTRY) as IntegrationProvider[]
).filter((provider) => WEBHOOK_REGISTRY[provider].length > 0);

export function isWebhookProvider(v: string): v is IntegrationProvider {
  return (WEBHOOK_PROVIDERS as readonly string[]).includes(v);
}

/**
 * Normalize an inbound webhook payload into Metric[].
 * `payload` is the already-parsed JSON body.
 */
export async function ingestWebhook(
  orgId: string,
  provider: IntegrationProvider,
  payload: unknown,
): Promise<WebhookIngestResult> {
  const body = isRecord(payload) ? payload : {};
  const metrics = normalize(orgId, provider, body);
  return { provider, metrics, accepted: metrics.length > 0 };
}

/* ------------------------------------------------------------------ */
/* Registry-driven normalizer                                          */
/* ------------------------------------------------------------------ */

function normalize(
  orgId: string,
  provider: IntegrationProvider,
  body: Record<string, unknown>,
): Metric[] {
  const rules = WEBHOOK_REGISTRY[provider] ?? [];
  const out: Metric[] = [];
  for (const rule of rules) {
    const value = rule.match(body);
    if (value == null) continue;
    out.push(
      metric(orgId, rule.key, rule.label, value, rule.format, rule.source),
    );
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function metric(
  orgId: string,
  key: MetricKey,
  label: string,
  value: number,
  format: MetricFormat,
  source: Metric["source"],
): Metric {
  return {
    id: `metric_webhook_${orgId}_${key}`,
    orgId,
    key,
    label,
    date: "2026-07-01",
    value,
    previousValue: null,
    deltaPct: null,
    format,
    source,
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function pick(
  obj: Record<string, unknown> | undefined,
  key: string,
): Record<string, unknown> | undefined {
  if (!obj) return undefined;
  const v = obj[key];
  return isRecord(v) ? v : undefined;
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function asNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/** Fixed timestamp attributed to webhook ingests. */
export const WEBHOOK_INGESTED_AT = SYNC_NOW_ISO;
