// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  listInsights,
  listRecommendedActions,
} from "@/lib/data/insights";

const ACME = "org_acme";
const NORTHWIND = "org_northwind";

describe("listInsights (mock mode)", () => {
  it("returns Acme insights ranked by confidence descending", async () => {
    const i = await listInsights(ACME);
    expect(i).toHaveLength(4);
    const confidences = i.map((x) => x.confidence);
    expect(confidences).toEqual([...confidences].sort((a, b) => b - a));
    // highest-confidence insight first
    expect(i[0].id).toBe("insight_revenue_up");
    expect(i[0].confidence).toBe(0.94);
  });

  it("carries exact seeded fields", async () => {
    const i = await listInsights(ACME);
    const risk = i.find((x) => x.id === "insight_refunds_up");
    expect(risk).toMatchObject({
      category: "risk",
      sentiment: "watch",
      title: "Refund requests increased",
      confidence: 0.88,
      reportId: "report_jul_01",
    });
  });

  it("scopes insights to the org (Northwind has none)", async () => {
    expect(await listInsights(NORTHWIND)).toEqual([]);
  });
});

describe("listRecommendedActions (mock mode)", () => {
  it("returns Acme actions ordered high -> low priority", async () => {
    const a = await listRecommendedActions(ACME);
    expect(a).toHaveLength(4);
    expect(a.map((x) => x.priority)).toEqual([
      "high",
      "high",
      "medium",
      "low",
    ]);
  });

  it("carries exact seeded fields for the top action", async () => {
    const a = await listRecommendedActions(ACME);
    expect(a[0]).toMatchObject({
      id: "action_checkout_spike",
      priority: "high",
      title: "Review the checkout error spike",
      ctaLabel: "Take action",
      reportId: "report_jul_01",
    });
  });

  it("scopes actions to the org (Northwind has none)", async () => {
    expect(await listRecommendedActions(NORTHWIND)).toEqual([]);
  });
});
