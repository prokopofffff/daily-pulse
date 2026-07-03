// @vitest-environment node
import { describe, it, expect } from "vitest";
import { parseCsvToMetrics, CSV_INGESTED_AT } from "./csv";

const ORG = "org_acme";

describe("parseCsvToMetrics", () => {
  it("parses a small CSV into normalized Metric[] with computed delta", () => {
    const csv = [
      "key,label,date,value,previousValue,format",
      "revenue,Yesterday revenue,2026-07-01,48250,40820,currency",
      "orders,Orders,2026-07-01,312,268,number",
    ].join("\n");

    const metrics = parseCsvToMetrics(ORG, csv);
    expect(metrics).toHaveLength(2);

    const [rev, orders] = metrics;
    expect(rev).toMatchObject({
      orgId: ORG,
      key: "revenue",
      label: "Yesterday revenue",
      date: "2026-07-01",
      value: 48250,
      previousValue: 40820,
      format: "currency",
      source: "csv",
    });
    // (48250 - 40820) / 40820 * 100 = 18.2 (rounded to 1dp)
    expect(rev.deltaPct).toBe(18.2);
    // id incorporates org, key and the 1-based row index.
    expect(rev.id).toBe("metric_csv_org_acme_revenue_1");

    expect(orders.key).toBe("orders");
    expect(orders.value).toBe(312);
    // (312 - 268) / 268 * 100 = 16.4
    expect(orders.deltaPct).toBe(16.4);
  });

  it("returns [] for empty input", () => {
    expect(parseCsvToMetrics(ORG, "")).toEqual([]);
  });

  it("returns [] for header-only input (fewer than 2 rows)", () => {
    expect(parseCsvToMetrics(ORG, "key,date,value")).toEqual([]);
  });

  it("returns [] when a required column (value) is missing from the header", () => {
    const csv = ["key,date", "revenue,2026-07-01"].join("\n");
    expect(parseCsvToMetrics(ORG, csv)).toEqual([]);
  });

  it("is tolerant of a trailing newline and surrounding whitespace", () => {
    const csv = "  key , date , value \nrevenue,2026-07-01,100\n";
    const metrics = parseCsvToMetrics(ORG, csv);
    expect(metrics).toHaveLength(1);
    expect(metrics[0].value).toBe(100);
    expect(metrics[0].key).toBe("revenue");
  });

  it("skips rows with an unknown metric key", () => {
    const csv = [
      "key,date,value",
      "not_a_real_key,2026-07-01,5",
      "revenue,2026-07-01,100",
    ].join("\n");
    const metrics = parseCsvToMetrics(ORG, csv);
    expect(metrics).toHaveLength(1);
    expect(metrics[0].key).toBe("revenue");
  });

  it("skips rows whose value is non-numeric / empty", () => {
    const csv = [
      "key,date,value",
      "revenue,2026-07-01,not-a-number",
      "orders,2026-07-01,",
      "visitors,2026-07-01,21400",
    ].join("\n");
    const metrics = parseCsvToMetrics(ORG, csv);
    expect(metrics).toHaveLength(1);
    expect(metrics[0].key).toBe("visitors");
    expect(metrics[0].value).toBe(21400);
  });

  it("strips currency/percent symbols and thousands separators from values", () => {
    const csv = [
      "key,date,value",
      'revenue,2026-07-01,"$1,234"',
      "conversion,2026-07-01,3.8%",
    ].join("\n");
    const metrics = parseCsvToMetrics(ORG, csv);
    expect(metrics.find((m) => m.key === "revenue")?.value).toBe(1234);
    expect(metrics.find((m) => m.key === "conversion")?.value).toBe(3.8);
  });

  it("skips blank lines in the body", () => {
    const csv = ["key,date,value", "", "revenue,2026-07-01,100", ""].join("\n");
    const metrics = parseCsvToMetrics(ORG, csv);
    expect(metrics).toHaveLength(1);
  });

  it("defaults format to number and derives a label when omitted/blank", () => {
    const csv = ["key,label,date,value", "new_customers,,2026-07-01,142"].join(
      "\n",
    );
    const [m] = parseCsvToMetrics(ORG, csv);
    expect(m.format).toBe("number");
    // defaultLabel title-cases underscore-separated segments.
    expect(m.label).toBe("New Customers");
  });

  it("falls back to number format for an unknown format value", () => {
    const csv = [
      "key,date,value,format",
      "revenue,2026-07-01,100,bogus",
    ].join("\n");
    const [m] = parseCsvToMetrics(ORG, csv);
    expect(m.format).toBe("number");
  });

  it("leaves deltaPct null when previousValue is absent or zero", () => {
    const csv = [
      "key,date,value,previousValue",
      "revenue,2026-07-01,100,0",
      "orders,2026-07-01,50",
    ].join("\n");
    const metrics = parseCsvToMetrics(ORG, csv);
    expect(metrics.find((m) => m.key === "revenue")?.deltaPct).toBeNull();
    expect(metrics.find((m) => m.key === "revenue")?.previousValue).toBe(0);
    expect(metrics.find((m) => m.key === "orders")?.deltaPct).toBeNull();
    expect(metrics.find((m) => m.key === "orders")?.previousValue).toBeNull();
  });

  it("handles a case-insensitive header and reordered columns", () => {
    const csv = ["VALUE,KEY,DATE", "48250,revenue,2026-07-01"].join("\n");
    const [m] = parseCsvToMetrics(ORG, csv);
    expect(m.key).toBe("revenue");
    expect(m.value).toBe(48250);
  });

  it("exposes a fixed, deterministic ingest timestamp", () => {
    expect(CSV_INGESTED_AT).toBe("2026-07-02T16:00:00.000Z");
  });
});
