import { describe, it, expect } from "vitest";
import { queryKeys } from "@/lib/query-keys";

const ORG = "org_acme";
const OTHER = "org_northwind";

describe("queryKeys", () => {
  it("org() namespaces by org id", () => {
    expect(queryKeys.org(ORG)).toEqual(["org", ORG]);
    expect(queryKeys.org(OTHER)).toEqual(["org", OTHER]);
  });

  it("differs by org so caches never collide across tenants", () => {
    expect(queryKeys.dashboard(ORG)).not.toEqual(queryKeys.dashboard(OTHER));
    expect(queryKeys.organization(ORG)).not.toEqual(
      queryKeys.organization(OTHER),
    );
  });

  it("is stable: same inputs produce equal arrays", () => {
    expect(queryKeys.dashboardMetrics(ORG)).toEqual(
      queryKeys.dashboardMetrics(ORG),
    );
    expect(queryKeys.report(ORG, "r1")).toEqual(queryKeys.report(ORG, "r1"));
  });

  it("organization keys are org-scoped, organizations() is global", () => {
    expect(queryKeys.organization(ORG)).toEqual(["org", ORG, "organization"]);
    expect(queryKeys.organizations()).toEqual(["organizations"]);
  });

  it("dashboard keys nest under the org root for prefix invalidation", () => {
    const root = queryKeys.org(ORG);
    const dashboard = queryKeys.dashboard(ORG);
    const metrics = queryKeys.dashboardMetrics(ORG);
    const series = queryKeys.dashboardSeries(ORG);

    expect(dashboard.slice(0, root.length)).toEqual([...root]);
    expect(metrics.slice(0, dashboard.length)).toEqual([...dashboard]);
    expect(series.slice(0, dashboard.length)).toEqual([...dashboard]);

    expect(dashboard).toEqual(["org", ORG, "dashboard"]);
    expect(metrics).toEqual(["org", ORG, "dashboard", "metrics"]);
    expect(series).toEqual(["org", ORG, "dashboard", "series"]);
  });

  it("metricSeries nests under dashboardSeries and differs by metric key", () => {
    const series = queryKeys.dashboardSeries(ORG);
    const revenue = queryKeys.metricSeries(ORG, "revenue");
    const orders = queryKeys.metricSeries(ORG, "orders");

    expect(revenue).toEqual([...series, "revenue"]);
    expect(revenue.slice(0, series.length)).toEqual([...series]);
    expect(revenue).not.toEqual(orders);
  });

  it("reports() encodes the period (defaulting to 'all') and differs by period", () => {
    expect(queryKeys.reports(ORG)).toEqual([
      "org",
      ORG,
      "reports",
      { period: "all" },
    ]);
    expect(queryKeys.reports(ORG, "weekly")).toEqual([
      "org",
      ORG,
      "reports",
      { period: "weekly" },
    ]);
    expect(queryKeys.reports(ORG, "daily")).not.toEqual(
      queryKeys.reports(ORG, "weekly"),
    );
  });

  it("report() and reportSearch() vary by id / query", () => {
    expect(queryKeys.report(ORG, "abc")).toEqual([
      "org",
      ORG,
      "reports",
      "detail",
      "abc",
    ]);
    expect(queryKeys.report(ORG, "abc")).not.toEqual(
      queryKeys.report(ORG, "xyz"),
    );

    expect(queryKeys.reportSearch(ORG, "churn")).toEqual([
      "org",
      ORG,
      "reports",
      "search",
      "churn",
    ]);
    expect(queryKeys.reportSearch(ORG, "a")).not.toEqual(
      queryKeys.reportSearch(ORG, "b"),
    );
  });

  it("report family shares the reports prefix for invalidation", () => {
    const reportsPrefix = ["org", ORG, "reports"];
    for (const key of [
      queryKeys.reports(ORG),
      queryKeys.report(ORG, "x"),
      queryKeys.reportSearch(ORG, "q"),
    ]) {
      expect(key.slice(0, 3)).toEqual(reportsPrefix);
    }
  });

  it("exposes the remaining flat, org-scoped domains", () => {
    expect(queryKeys.insights(ORG)).toEqual(["org", ORG, "insights"]);
    expect(queryKeys.recommendedActions(ORG)).toEqual([
      "org",
      ORG,
      "recommended-actions",
    ]);
    expect(queryKeys.integrations(ORG)).toEqual(["org", ORG, "integrations"]);
    expect(queryKeys.notifications(ORG)).toEqual(["org", ORG, "notifications"]);
    expect(queryKeys.deliveryPreferences(ORG)).toEqual([
      "org",
      ORG,
      "delivery-preferences",
    ]);
  });

  it("all org-scoped keys start with the org root", () => {
    const root = queryKeys.org(ORG);
    const scoped = [
      queryKeys.organization(ORG),
      queryKeys.dashboard(ORG),
      queryKeys.dashboardMetrics(ORG),
      queryKeys.dashboardSeries(ORG),
      queryKeys.metricSeries(ORG, "revenue"),
      queryKeys.reports(ORG),
      queryKeys.report(ORG, "x"),
      queryKeys.reportSearch(ORG, "q"),
      queryKeys.insights(ORG),
      queryKeys.recommendedActions(ORG),
      queryKeys.integrations(ORG),
      queryKeys.notifications(ORG),
      queryKeys.deliveryPreferences(ORG),
    ];
    for (const key of scoped) {
      expect(key.slice(0, root.length)).toEqual([...root]);
    }
  });
});
