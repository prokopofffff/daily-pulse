import { describe, it, expect } from "vitest";

import { renderWithProviders, screen } from "@/test/render";
import { MetricDelta } from "@/components/ui-ext/metric-delta";

describe("MetricDelta", () => {
  it("renders a positive value with the success color and a +pct label", () => {
    const { container } = renderWithProviders(<MetricDelta value={18.2} />);
    expect(screen.getByText("+18.2%")).toBeInTheDocument();
    const pill = container.querySelector("span");
    expect(pill).toHaveClass("text-success");
    expect(pill).toHaveClass("bg-success-subtle");
    expect(pill).not.toHaveClass("text-danger");
  });

  it("renders a negative value with the danger color and a −pct label", () => {
    // formatPercent uses U+2212 (minus sign) for negatives.
    const { container } = renderWithProviders(<MetricDelta value={-14} />);
    expect(screen.getByText("−14.0%")).toBeInTheDocument();
    const pill = container.querySelector("span");
    expect(pill).toHaveClass("text-danger");
    expect(pill).toHaveClass("bg-danger-subtle");
  });

  it("treats zero as positive (up = good)", () => {
    const { container } = renderWithProviders(<MetricDelta value={0} />);
    expect(screen.getByText("+0.0%")).toBeInTheDocument();
    expect(container.querySelector("span")).toHaveClass("text-success");
  });

  it("inverts the color so a positive value reads as danger", () => {
    const { container } = renderWithProviders(
      <MetricDelta value={12} invertColor />,
    );
    expect(container.querySelector("span")).toHaveClass("text-danger");
    // Direction/label still driven by the raw value (up).
    expect(screen.getByText("+12.0%")).toBeInTheDocument();
  });

  it("inverts the color so a negative value reads as success", () => {
    const { container } = renderWithProviders(
      <MetricDelta value={-8} invertColor />,
    );
    expect(container.querySelector("span")).toHaveClass("text-success");
  });

  it("renders an explicit label instead of the percentage", () => {
    renderWithProviders(<MetricDelta value={5} label="Needs action" />);
    expect(screen.getByText("Needs action")).toBeInTheDocument();
    expect(screen.queryByText("+5.0%")).not.toBeInTheDocument();
  });

  it("renders the trend-up icon by default and hides it with hideIcon", () => {
    const { container: withIcon } = renderWithProviders(
      <MetricDelta value={3} />,
    );
    expect(withIcon.querySelector("svg")).toBeInTheDocument();

    const { container: noIcon } = renderWithProviders(
      <MetricDelta value={3} hideIcon />,
    );
    expect(noIcon.querySelector("svg")).not.toBeInTheDocument();
  });
});
