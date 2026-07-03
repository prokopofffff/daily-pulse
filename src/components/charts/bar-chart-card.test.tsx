import { describe, it, expect } from "vitest";

import type { MetricPoint } from "@/lib/types";
import { renderWithProviders } from "@/test/render";
import { BarChartCard } from "@/components/charts/bar-chart-card";

const POINTS: MetricPoint[] = [
  { label: "Mon", date: "2026-06-29", value: 41000 },
  { label: "Tue", date: "2026-06-30", value: 39500 },
  { label: "Wed", date: "2026-07-01", value: 44200 },
  { label: "Thu", date: "2026-07-02", value: 48250 },
];

describe("BarChartCard", () => {
  it("renders without throwing given a sample series", () => {
    expect(() =>
      renderWithProviders(<BarChartCard points={POINTS} />),
    ).not.toThrow();
  });

  it("renders with weekday labels and currency formatting enabled", () => {
    const { container } = renderWithProviders(
      <BarChartCard points={POINTS} showLabels formatValue="currency" />,
    );
    // ResponsiveContainer mounts a recharts wrapper element.
    expect(
      container.querySelector(".recharts-responsive-container"),
    ).toBeInTheDocument();
  });

  it("renders an empty series without throwing", () => {
    expect(() =>
      renderWithProviders(<BarChartCard points={[]} />),
    ).not.toThrow();
  });
});
