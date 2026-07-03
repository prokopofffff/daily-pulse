// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the AI + notifications boundaries so the route has no side effects and
// runs deterministically regardless of env keys.
const generateDailyReport = vi.fn();
const dispatchReport = vi.fn();

vi.mock("@/lib/ai", () => ({
  generateDailyReport: (...args: unknown[]) => generateDailyReport(...args),
}));

vi.mock("@/lib/notifications", () => ({
  dispatchReport: (...args: unknown[]) => dispatchReport(...args),
}));

import { GET, POST } from "./route";

const OLD_ENV = { ...process.env };

describe("cron/daily route", () => {
  beforeEach(() => {
    generateDailyReport.mockReset();
    dispatchReport.mockReset();
    generateDailyReport.mockResolvedValue({
      summary: "mock summary",
      body: "mock body",
    });
    dispatchReport.mockResolvedValue({ ok: true, results: [] });
  });

  afterEach(() => {
    process.env = { ...OLD_ENV };
  });

  it("returns 401 when CRON_SECRET is set and no auth is provided", async () => {
    process.env.CRON_SECRET = "change-me";
    const res = await GET(new Request("http://localhost/api/cron/daily"));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe("unauthorized");
    expect(generateDailyReport).not.toHaveBeenCalled();
    expect(dispatchReport).not.toHaveBeenCalled();
  });

  it("returns 401 when the Bearer token does not match", async () => {
    process.env.CRON_SECRET = "change-me";
    const res = await GET(
      new Request("http://localhost/api/cron/daily", {
        headers: { authorization: "Bearer wrong-token" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 with a valid Bearer token and summarizes both orgs", async () => {
    process.env.CRON_SECRET = "change-me";
    const res = await GET(
      new Request("http://localhost/api/cron/daily", {
        headers: { authorization: "Bearer change-me" },
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(json.ranAt).toBe("2026-07-03T08:00:00.000Z");
    // Two seeded orgs: org_acme + org_northwind.
    expect(json.count).toBe(2);
    expect(Array.isArray(json.results)).toBe(true);
    expect(json.results).toHaveLength(2);

    const orgIds = json.results.map((r: { orgId: string }) => r.orgId).sort();
    expect(orgIds).toEqual(["org_acme", "org_northwind"]);

    for (const result of json.results) {
      expect(result.status).toBe("ready");
      expect(result.dispatched).toBe(true);
      expect(result.reportId).toBe(
        `report_daily_${result.orgId}_2026-07-03`,
      );
    }

    // AI + notifications invoked once per org.
    expect(generateDailyReport).toHaveBeenCalledTimes(2);
    expect(dispatchReport).toHaveBeenCalledTimes(2);
  });

  it("rejects the secret supplied via ?secret= query param (header-only)", async () => {
    process.env.CRON_SECRET = "change-me";
    const res = await POST(
      new Request("http://localhost/api/cron/daily?secret=change-me", {
        method: "POST",
      }),
    );
    // The query-param path was removed to avoid leaking the secret into logs;
    // only the Authorization: Bearer header is accepted.
    expect(res.status).toBe(401);
  });

  it("is open (200) when CRON_SECRET is unset", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(new Request("http://localhost/api/cron/daily"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.count).toBe(2);
  });

  it("marks an org failed (and ok=false) when generation throws, without a 500", async () => {
    delete process.env.CRON_SECRET;
    generateDailyReport.mockRejectedValue(new Error("ai down"));

    const res = await GET(new Request("http://localhost/api/cron/daily"));
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.ok).toBe(false);
    for (const result of json.results) {
      expect(result.status).toBe("failed");
      expect(result.dispatched).toBe(false);
    }
  });

  it("reports dispatched=false when dispatch throws but generation succeeds", async () => {
    delete process.env.CRON_SECRET;
    dispatchReport.mockRejectedValue(new Error("channel down"));

    const res = await GET(new Request("http://localhost/api/cron/daily"));
    expect(res.status).toBe(200);
    const json = await res.json();

    // Report still generated -> status ready, ok stays true.
    expect(json.ok).toBe(true);
    for (const result of json.results) {
      expect(result.status).toBe("ready");
      expect(result.dispatched).toBe(false);
    }
  });
});
