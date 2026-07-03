// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  syncIntegration,
  syncIntegrationDetailed,
  collectAllMetrics,
  collectors,
  COLLECTOR_PROVIDERS,
  SYNC_NOW_ISO,
  parseCsvToMetrics,
  ingestWebhook,
  isWebhookProvider,
} from "./index";

const ORG = "org_acme";

describe("collectors registry", () => {
  it("registers pull-based collectors for stripe, google_analytics, github and supabase", () => {
    expect(Object.keys(collectors).sort()).toEqual([
      "github",
      "google_analytics",
      "stripe",
      "supabase",
    ]);
    expect(COLLECTOR_PROVIDERS.sort()).toEqual([
      "github",
      "google_analytics",
      "stripe",
      "supabase",
    ]);
  });

  it("re-exports the ingest helpers from the barrel", () => {
    expect(typeof parseCsvToMetrics).toBe("function");
    expect(typeof ingestWebhook).toBe("function");
    expect(isWebhookProvider("stripe")).toBe(true);
    expect(SYNC_NOW_ISO).toBe("2026-07-02T16:00:00.000Z");
  });
});

describe("syncIntegration", () => {
  it("resolves (void) for a known provider", async () => {
    await expect(syncIntegration(ORG, "stripe")).resolves.toBeUndefined();
    await expect(syncIntegration(ORG, "github")).resolves.toBeUndefined();
  });

  it("throws for an unknown / collector-less provider", async () => {
    // shopify has no first-party collector (webhook-ingested instead).
    await expect(syncIntegration(ORG, "shopify")).rejects.toThrow(
      /No collector registered for provider "shopify"/,
    );
    await expect(
      syncIntegration(ORG, "hubspot"),
    ).rejects.toThrow(/No collector registered/);
  });
});

describe("syncIntegrationDetailed", () => {
  it("returns the collected metrics/points plus the fixed syncedAt", async () => {
    const result = await syncIntegrationDetailed(ORG, "stripe");
    expect(result.provider).toBe("stripe");
    expect(result.syncedAt).toBe(SYNC_NOW_ISO);
    expect(result.metrics.map((m) => m.key).sort()).toEqual([
      "lost_customers",
      "revenue",
    ]);
    expect(result.points.length).toBe(7);
  });

  it("throws for a provider without a collector", async () => {
    await expect(
      syncIntegrationDetailed(ORG, "shopify"),
    ).rejects.toThrow(/No collector registered/);
  });
});

describe("collectAllMetrics", () => {
  it("aggregates metrics from every connected provider that has a collector", async () => {
    const metrics = await collectAllMetrics(ORG);

    // Connected + has collector for acme: stripe (revenue, lost_customers),
    // google_analytics (visitors), github (critical_issues). supabase is
    // not_connected so it is excluded.
    const bySource = metrics.reduce<Record<string, number>>((acc, m) => {
      acc[m.source] = (acc[m.source] ?? 0) + 1;
      return acc;
    }, {});
    expect(bySource).toEqual({
      stripe: 2,
      google_analytics: 1,
      github: 1,
    });
    expect(metrics).toHaveLength(4);

    const keys = metrics.map((m) => m.key).sort();
    expect(keys).toEqual([
      "critical_issues",
      "lost_customers",
      "revenue",
      "visitors",
    ]);
    expect(metrics.every((m) => m.orgId === ORG)).toBe(true);
  });

  it("returns [] for an org with no connected collector integrations", async () => {
    const metrics = await collectAllMetrics("org_northwind");
    expect(metrics).toEqual([]);
  });

  it("is deterministic across calls", async () => {
    const a = await collectAllMetrics(ORG);
    const b = await collectAllMetrics(ORG);
    expect(a).toEqual(b);
  });
});
