import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Providers, makeTestQueryClient } from "@/test/render";
import { CURRENT_ORG_ID } from "@/lib/config";
import { queryKeys } from "@/lib/query-keys";
import {
  useGenerateReport,
  useReport,
  useReportSearch,
  useReports,
} from "./use-reports";

function wrapper() {
  const client = makeTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Providers client={client}>{children}</Providers>
  );
  return { client, Wrapper };
}

describe("useReports", () => {
  it("lists all seeded reports (most recent first) with no period", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useReports(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const reports = result.current.data!;
    expect(reports).toHaveLength(4);
    // Sorted by date desc — July 1 is newest.
    expect(reports[0].id).toBe("report_jul_01");
    expect(reports[0].title).toBe("Daily Pulse — July 1");
    expect(reports[0].status).toBe("ready");
  });

  it("filters to daily reports when period='daily'", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useReports("daily"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const reports = result.current.data!;
    expect(reports).toHaveLength(3);
    expect(reports.every((r) => r.period === "daily")).toBe(true);
  });

  it("filters to weekly reports when period='weekly'", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useReports("weekly"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const reports = result.current.data!;
    expect(reports).toHaveLength(1);
    expect(reports[0].id).toBe("report_weekly_jun_22_28");
  });

  it("returns empty for a period with no reports", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useReports("monthly"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useReport", () => {
  it("resolves a single report by id", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useReport("report_jul_01"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("report_jul_01");
    expect(result.current.data?.summary).toContain("revenue up 18%");
    expect(result.current.data?.insightIds).toContain("insight_revenue_up");
  });

  it("resolves null for an unknown id", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useReport("nope"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("is disabled (no fetch) when id is undefined", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useReport(undefined), {
      wrapper: Wrapper,
    });

    // enabled: Boolean(id) === false → stays pending, never fetches.
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.isSuccess).toBe(false);
  });
});

describe("useReportSearch", () => {
  it("returns matching reports for a query term", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useReportSearch("refund"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const reports = result.current.data!;
    expect(reports.length).toBeGreaterThan(0);
    expect(
      reports.every(
        (r) =>
          r.title.toLowerCase().includes("refund") ||
          r.summary.toLowerCase().includes("refund") ||
          r.body.toLowerCase().includes("refund"),
      ),
    ).toBe(true);
  });

  it("falls back to listing all reports for an empty query", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useReportSearch("   "), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(4);
  });
});

describe("useGenerateReport", () => {
  it("generates a report and invalidates reports + insights keys", async () => {
    const { client, Wrapper } = wrapper();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useGenerateReport(), {
      wrapper: Wrapper,
    });

    await result.current.mutateAsync();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Deterministic mock output shaped into a Report.
    expect(result.current.data?.report.title).toBe("Daily Pulse — generated");
    expect(result.current.data?.report.status).toBe("ready");
    // dispatch is a mock no-op that reports dispatched=true.
    expect(result.current.data?.dispatched).toBe(true);

    // Invalidates the reports *prefix* (covers every period tab + detail/search),
    // not a single period key that would miss the default "daily" list.
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.reportsRoot(CURRENT_ORG_ID),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.insights(CURRENT_ORG_ID),
    });
  });

  it("uses a reports key that prefix-matches the period lists (regression for the no-op key)", () => {
    // React Query invalidates a cached query when the invalidation key is a
    // prefix of it. The old bug invalidated reports(orgId) = [...,"reports",
    // {period:"all"}], whose 4th element does NOT deep-equal the daily list's
    // {period:"daily"} — so nothing matched. reportsRoot has no 4th element and
    // is a true prefix of every reports query, so all of them invalidate.
    const root = queryKeys.reportsRoot(CURRENT_ORG_ID);
    const dailyKey = queryKeys.reports(CURRENT_ORG_ID, "daily");
    const detailKey = queryKeys.report(CURRENT_ORG_ID, "r1");
    const searchKey = queryKeys.reportSearch(CURRENT_ORG_ID, "q");

    for (const key of [dailyKey, detailKey, searchKey]) {
      expect(key.slice(0, root.length)).toEqual([...root]);
    }

    // The old period-specific key was NOT a prefix of the daily list.
    const oldKey = queryKeys.reports(CURRENT_ORG_ID);
    expect(dailyKey.slice(0, oldKey.length)).not.toEqual([...oldKey]);
  });
});
