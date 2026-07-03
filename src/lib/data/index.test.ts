// @vitest-environment node
import { describe, it, expect } from "vitest";
import * as data from "@/lib/data";
import { USE_MOCK } from "@/lib/config";

describe("data barrel (index.ts)", () => {
  it("re-exports every data accessor as a function", () => {
    const names = [
      "getOrganization",
      "listOrganizations",
      "getDashboardMetrics",
      "getDashboardSeries",
      "getMetricSeries",
      "getReport",
      "listReports",
      "searchReports",
      "listInsights",
      "listRecommendedActions",
      "getDeliveryPreferences",
      "listIntegrations",
      "listNotificationConfigs",
    ] as const;
    for (const name of names) {
      expect(typeof data[name]).toBe("function");
    }
  });

  it("runs in mock mode under the test env (no Supabase needed)", () => {
    expect(USE_MOCK).toBe(true);
  });

  it("barrel accessors return the same seeded data as direct imports", async () => {
    const org = await data.getOrganization("org_acme");
    expect(org?.slug).toBe("acme");

    const metrics = await data.getDashboardMetrics("org_acme");
    expect(metrics).toHaveLength(5);

    const reports = await data.listReports("org_acme");
    expect(reports[0].id).toBe("report_jul_01");

    const prefs = await data.getDeliveryPreferences("org_acme");
    expect(prefs?.sendTime).toBe("08:00");
  });
});
