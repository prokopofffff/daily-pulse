// @vitest-environment node
import { describe, it, expect } from "vitest";
import { collectStripe } from "./stripe";
import { collectGoogleAnalytics } from "./google-analytics";
import { collectGithub } from "./github";
import { collectSupabaseSource } from "./supabase-source";

const ORG = "org_acme";

// All collectors run in deterministic mock mode here: NEXT_PUBLIC_USE_MOCK_DATA
// is "true" (set by the test setup) so shouldUseMock()/USE_MOCK short-circuit
// to seeded data before any provider key is consulted and no network is hit.

describe("collectStripe (mock)", () => {
  it("returns the seeded Stripe metrics (revenue + lost_customers) and revenue points", async () => {
    const { metrics, points } = await collectStripe(ORG);

    const keys = metrics.map((m) => m.key).sort();
    expect(keys).toEqual(["lost_customers", "revenue"]);
    expect(metrics.every((m) => m.source === "stripe")).toBe(true);
    expect(metrics.every((m) => m.orgId === ORG)).toBe(true);

    const revenue = metrics.find((m) => m.key === "revenue");
    expect(revenue?.value).toBe(48250);

    // points come from the seeded revenue series (7 days ending 2026-07-01).
    expect(points).toHaveLength(7);
    expect(points[points.length - 1]).toMatchObject({
      date: "2026-07-01",
      value: 48250,
    });
  });

  it("scopes metrics to the org (empty for an org with no stripe metrics)", async () => {
    const { metrics } = await collectStripe("org_northwind");
    expect(metrics).toEqual([]);
  });

  it("is deterministic across calls", async () => {
    const a = await collectStripe(ORG);
    const b = await collectStripe(ORG);
    expect(a).toEqual(b);
  });
});

describe("collectGoogleAnalytics (mock)", () => {
  it("returns a single visitors metric derived from the seeded traffic series", async () => {
    const { metrics, points } = await collectGoogleAnalytics(ORG);

    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({
      orgId: ORG,
      key: "visitors",
      label: "Traffic",
      format: "compact",
      source: "google_analytics",
      deltaPct: -6.0,
    });
    // last seeded traffic point value.
    expect(metrics[0].value).toBe(21400);
    expect(metrics[0].previousValue).toBe(22770);

    expect(points).toHaveLength(7);
    expect(points[points.length - 1].value).toBe(21400);
  });
});

describe("collectGithub (mock)", () => {
  it("returns the seeded critical_issues metric with no points", async () => {
    const { metrics, points } = await collectGithub(ORG);

    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({
      orgId: ORG,
      key: "critical_issues",
      value: 2,
      source: "github",
    });
    expect(points).toEqual([]);
  });

  it("scopes to the org", async () => {
    const { metrics } = await collectGithub("org_northwind");
    expect(metrics).toEqual([]);
  });
});

describe("collectSupabaseSource (mock)", () => {
  it("returns an orders metric derived from the seeded orders series", async () => {
    const { metrics, points } = await collectSupabaseSource(ORG);

    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({
      orgId: ORG,
      key: "orders",
      label: "Orders",
      format: "number",
      source: "supabase",
      deltaPct: 16.4,
    });
    // last / previous seeded orders points.
    expect(metrics[0].value).toBe(312);
    expect(metrics[0].previousValue).toBe(268);

    expect(points).toHaveLength(7);
    expect(points[points.length - 1].value).toBe(312);
  });
});
