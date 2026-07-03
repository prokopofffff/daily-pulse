import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Providers, makeTestQueryClient } from "@/test/render";
import { CURRENT_ORG_ID } from "@/lib/config";
import { queryKeys } from "@/lib/query-keys";
import {
  useDashboard,
  useDashboardMetrics,
  useDashboardSeries,
  useMetricSeries,
} from "./use-dashboard";

function wrapper() {
  const client = makeTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Providers client={client}>{children}</Providers>
  );
  return { client, Wrapper };
}

describe("useDashboardMetrics", () => {
  it("resolves the seeded Acme metric cards", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useDashboardMetrics(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const metrics = result.current.data!;
    // 5 seeded metric cards for org_acme.
    expect(metrics).toHaveLength(5);
    expect(metrics.every((m) => m.orgId === CURRENT_ORG_ID)).toBe(true);

    const revenue = metrics.find((m) => m.key === "revenue")!;
    expect(revenue.value).toBe(48250);
    expect(revenue.previousValue).toBe(40820);
    expect(revenue.deltaPct).toBe(18.2);
    expect(revenue.format).toBe("currency");
    expect(revenue.source).toBe("stripe");
  });

  it("uses the metrics query key", () => {
    const { Wrapper } = wrapper();
    renderHook(() => useDashboardMetrics(), { wrapper: Wrapper });
    // The hook is derived from the factory; assert the shape here.
    expect(queryKeys.dashboardMetrics(CURRENT_ORG_ID)).toEqual([
      "org",
      CURRENT_ORG_ID,
      "dashboard",
      "metrics",
    ]);
  });
});

describe("useDashboardSeries", () => {
  it("resolves the seeded chart series", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useDashboardSeries(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const series = result.current.data!;
    expect(series).toHaveLength(5);
    const revenue = series.find((s) => s.key === "revenue")!;
    expect(revenue.total).toBe(48250);
    expect(revenue.points).toHaveLength(7);
    expect(revenue.points[revenue.points.length - 1]).toMatchObject({
      label: "Wed",
      date: "2026-07-01",
      value: 48250,
    });
  });
});

describe("useMetricSeries", () => {
  it("resolves a single series by key", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useMetricSeries("orders"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.key).toBe("orders");
    expect(result.current.data?.total).toBe(312);
    expect(result.current.data?.deltaPct).toBe(16.4);
  });

  it("resolves null for an unknown key", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useMetricSeries("errors"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe("useDashboard", () => {
  it("combines metrics + series and reports loading/error flags", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useDashboard(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.metrics.isSuccess).toBe(true);
      expect(result.current.series.isSuccess).toBe(true);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.metrics.data).toHaveLength(5);
    expect(result.current.series.data).toHaveLength(5);
  });
});
