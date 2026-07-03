// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  getDashboardMetrics,
  getDashboardSeries,
  getMetricSeries,
} from "@/lib/data/metrics";

const ACME = "org_acme";
const NORTHWIND = "org_northwind";

describe("getDashboardMetrics (mock mode)", () => {
  it("returns the 5 headline metric cards for Acme", async () => {
    const m = await getDashboardMetrics(ACME);
    expect(m).toHaveLength(5);
    expect(m.map((x) => x.key)).toEqual([
      "revenue",
      "new_customers",
      "lost_customers",
      "support_tickets",
      "critical_issues",
    ]);
  });

  it("returns the exact seeded revenue metric", async () => {
    const m = await getDashboardMetrics(ACME);
    const revenue = m.find((x) => x.key === "revenue");
    expect(revenue).toMatchObject({
      id: "metric_revenue",
      orgId: ACME,
      label: "Yesterday revenue",
      date: "2026-07-01",
      value: 48250,
      previousValue: 40820,
      deltaPct: 18.2,
      format: "currency",
      source: "stripe",
    });
  });

  it("scopes metrics to the org (Northwind has none)", async () => {
    expect(await getDashboardMetrics(NORTHWIND)).toEqual([]);
  });
});

describe("getMetricSeries (mock mode)", () => {
  it("returns the revenue series with 7 points and seeded totals", async () => {
    const s = await getMetricSeries(ACME, "revenue");
    expect(s).not.toBeNull();
    expect(s?.label).toBe("Revenue");
    expect(s?.format).toBe("currency");
    expect(s?.total).toBe(48250);
    expect(s?.deltaPct).toBe(18.2);
    expect(s?.points).toHaveLength(7);
    expect(s?.points[s.points.length - 1]).toEqual({
      label: "Wed",
      date: "2026-07-01",
      value: 48250,
    });
  });

  it("looks series up by key regardless of org (mock impl)", async () => {
    const s = await getMetricSeries(ACME, "conversion");
    expect(s?.total).toBe(3.8);
    expect(s?.format).toBe("percent");
  });

  it("returns null for an unknown metric key", async () => {
    // @ts-expect-error deliberately passing an invalid key
    expect(await getMetricSeries(ACME, "nope")).toBeNull();
  });
});

describe("getDashboardSeries (mock mode)", () => {
  it("returns all 5 chart series", async () => {
    const series = await getDashboardSeries(ACME);
    expect(series).toHaveLength(5);
    expect(series.map((s) => s.key)).toEqual([
      "revenue",
      "orders",
      "visitors",
      "support_tickets",
      "conversion",
    ]);
  });

  it("every series carries 7 dated points", async () => {
    const series = await getDashboardSeries(ACME);
    for (const s of series) {
      expect(s.points).toHaveLength(7);
      expect(s.points[0]).toHaveProperty("date");
      expect(s.points[0]).toHaveProperty("value");
    }
  });
});
