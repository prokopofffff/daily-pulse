// @vitest-environment node
import { describe, it, expect } from "vitest";
import { getReport, listReports, searchReports } from "@/lib/data/reports";

const ACME = "org_acme";
const NORTHWIND = "org_northwind";

describe("listReports (mock mode)", () => {
  it("returns all Acme reports, most recent first", async () => {
    const r = await listReports(ACME);
    expect(r).toHaveLength(4);
    // sorted by date desc
    const dates = r.map((x) => x.date);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(r[0].id).toBe("report_jul_01");
  });

  it("filters to daily reports only", async () => {
    const r = await listReports(ACME, "daily");
    expect(r).toHaveLength(3);
    expect(r.every((x) => x.period === "daily")).toBe(true);
    expect(r.map((x) => x.id)).toEqual([
      "report_jul_01",
      "report_jun_30",
      "report_jun_29",
    ]);
  });

  it("filters to weekly reports only", async () => {
    const r = await listReports(ACME, "weekly");
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe("report_weekly_jun_22_28");
    expect(r[0].period).toBe("weekly");
  });

  it("returns empty for a period with no reports (monthly)", async () => {
    expect(await listReports(ACME, "monthly")).toEqual([]);
  });

  it("scopes reports to the org (Northwind has none)", async () => {
    expect(await listReports(NORTHWIND)).toEqual([]);
  });
});

describe("getReport (mock mode)", () => {
  it("returns the exact seeded report by id", async () => {
    const r = await getReport(ACME, "report_jul_01");
    expect(r).not.toBeNull();
    expect(r?.title).toBe("Daily Pulse — July 1");
    expect(r?.period).toBe("daily");
    expect(r?.status).toBe("ready");
    expect(r?.insightIds).toEqual([
      "insight_revenue_up",
      "insight_refunds_up",
      "insight_traffic_down",
      "insight_adoption",
    ]);
  });

  it("returns null for an unknown report id", async () => {
    expect(await getReport(ACME, "report_nope")).toBeNull();
  });

  it("returns null when the report belongs to another org", async () => {
    expect(await getReport(NORTHWIND, "report_jul_01")).toBeNull();
  });
});

describe("searchReports (mock mode)", () => {
  it("matches on title / summary / body (case-insensitive)", async () => {
    const r = await searchReports(ACME, "REVENUE");
    expect(r.length).toBeGreaterThan(0);
    expect(
      r.every(
        (x) =>
          x.title.toLowerCase().includes("revenue") ||
          x.summary.toLowerCase().includes("revenue") ||
          x.body.toLowerCase().includes("revenue"),
      ),
    ).toBe(true);
  });

  it("matches a term unique to one report", async () => {
    const r = await searchReports(ACME, "onboarding flow");
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe("report_weekly_jun_22_28");
  });

  it("returns results sorted by date desc", async () => {
    const r = await searchReports(ACME, "revenue");
    const dates = r.map((x) => x.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("empty / whitespace query falls back to full list", async () => {
    const all = await listReports(ACME);
    expect(await searchReports(ACME, "")).toEqual(all);
    expect(await searchReports(ACME, "   ")).toEqual(all);
  });

  it("returns empty for a term that matches nothing", async () => {
    expect(await searchReports(ACME, "zzzznotfound")).toEqual([]);
  });

  it("scopes search to the org (Northwind matches nothing)", async () => {
    expect(await searchReports(NORTHWIND, "revenue")).toEqual([]);
  });
});
