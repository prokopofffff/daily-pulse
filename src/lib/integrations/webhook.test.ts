// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  ingestWebhook,
  isWebhookProvider,
  WEBHOOK_INGESTED_AT,
} from "./webhook";

const ORG = "org_acme";

describe("isWebhookProvider", () => {
  it("recognizes known webhook providers", () => {
    expect(isWebhookProvider("stripe")).toBe(true);
    expect(isWebhookProvider("github")).toBe(true);
    expect(isWebhookProvider("shopify")).toBe(true);
    expect(isWebhookProvider("hubspot")).toBe(true);
  });

  it("rejects providers without a webhook normalizer", () => {
    expect(isWebhookProvider("google_analytics")).toBe(false);
    expect(isWebhookProvider("supabase")).toBe(false);
    expect(isWebhookProvider("nope")).toBe(false);
  });
});

describe("ingestWebhook", () => {
  it("normalizes a Stripe charge.succeeded into a revenue metric (cents -> dollars)", async () => {
    const result = await ingestWebhook(ORG, "stripe", {
      type: "charge.succeeded",
      data: { object: { amount: 4825000 } },
    });

    expect(result.provider).toBe("stripe");
    expect(result.accepted).toBe(true);
    expect(result.metrics).toHaveLength(1);
    expect(result.metrics[0]).toMatchObject({
      orgId: ORG,
      key: "revenue",
      value: 48250,
      format: "currency",
      source: "stripe",
      previousValue: null,
      deltaPct: null,
      date: "2026-07-01",
    });
    expect(result.metrics[0].id).toBe("metric_webhook_org_acme_revenue");
  });

  it("normalizes a Stripe charge.refunded into a lost_customers metric", async () => {
    const result = await ingestWebhook(ORG, "stripe", {
      type: "charge.refunded",
      data: { object: { amount: 1000 } },
    });
    expect(result.accepted).toBe(true);
    expect(result.metrics[0]).toMatchObject({
      key: "lost_customers",
      value: 1,
      source: "stripe",
    });
  });

  it("does not accept an unknown Stripe event type", async () => {
    const result = await ingestWebhook(ORG, "stripe", {
      type: "customer.created",
      data: { object: { amount: 100 } },
    });
    expect(result.metrics).toEqual([]);
    expect(result.accepted).toBe(false);
  });

  it("normalizes a GitHub critical issue opened event", async () => {
    const result = await ingestWebhook(ORG, "github", {
      action: "opened",
      issue: { labels: [{ name: "Critical" }] },
    });
    expect(result.accepted).toBe(true);
    expect(result.metrics[0]).toMatchObject({
      key: "critical_issues",
      value: 1,
      source: "github",
    });
  });

  it("ignores a GitHub issue without a critical label", async () => {
    const result = await ingestWebhook(ORG, "github", {
      action: "opened",
      issue: { labels: [{ name: "bug" }] },
    });
    expect(result.metrics).toEqual([]);
    expect(result.accepted).toBe(false);
  });

  it("ignores a critical GitHub issue whose action is not opened/reopened", async () => {
    const result = await ingestWebhook(ORG, "github", {
      action: "closed",
      issue: { labels: [{ name: "critical" }] },
    });
    expect(result.metrics).toEqual([]);
    expect(result.accepted).toBe(false);
  });

  it("normalizes a Shopify order with orders + revenue metrics", async () => {
    const result = await ingestWebhook(ORG, "shopify", {
      total_price: 129.99,
    });
    expect(result.accepted).toBe(true);
    expect(result.metrics.map((m) => m.key)).toEqual(["orders", "revenue"]);
    const revenue = result.metrics.find((m) => m.key === "revenue");
    expect(revenue).toMatchObject({ value: 129.99, source: "shopify" });
  });

  it("normalizes a Shopify order missing total_price to just an orders metric", async () => {
    const result = await ingestWebhook(ORG, "shopify", {});
    expect(result.metrics.map((m) => m.key)).toEqual(["orders"]);
    expect(result.accepted).toBe(true);
  });

  it("normalizes a HubSpot contact.creation into a new_customers metric", async () => {
    const result = await ingestWebhook(ORG, "hubspot", {
      subscriptionType: "contact.creation",
    });
    expect(result.accepted).toBe(true);
    expect(result.metrics[0]).toMatchObject({
      key: "new_customers",
      value: 1,
      source: "hubspot",
    });
  });

  it("ignores an unrelated HubSpot subscription type", async () => {
    const result = await ingestWebhook(ORG, "hubspot", {
      subscriptionType: "deal.propertyChange",
    });
    expect(result.metrics).toEqual([]);
    expect(result.accepted).toBe(false);
  });

  it("returns an empty non-accepted result for a non-object payload (no throw)", async () => {
    const result = await ingestWebhook(ORG, "stripe", null);
    expect(result.metrics).toEqual([]);
    expect(result.accepted).toBe(false);
  });

  it("returns an empty result for an unknown provider (no throw)", async () => {
    // Cast through unknown so we can exercise the default branch.
    const result = await ingestWebhook(
      ORG,
      "mystery" as never,
      { anything: true },
    );
    expect(result.metrics).toEqual([]);
    expect(result.accepted).toBe(false);
    expect(result.provider).toBe("mystery");
  });

  it("exposes a fixed ingest timestamp", () => {
    expect(WEBHOOK_INGESTED_AT).toBe("2026-07-02T16:00:00.000Z");
  });
});
