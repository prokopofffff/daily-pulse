import { describe, it, expect } from "vitest";
import { DollarSign } from "lucide-react";

import { renderWithProviders, screen } from "@/test/render";
import { StatCard } from "@/components/ui-ext/stat-card";

describe("StatCard", () => {
  it("renders the label and pre-formatted value", () => {
    renderWithProviders(<StatCard label="Yesterday revenue" value="$48,250" />);
    expect(screen.getByText("Yesterday revenue")).toBeInTheDocument();
    expect(screen.getByText("$48,250")).toBeInTheDocument();
  });

  it("renders the delta pill from deltaValue", () => {
    renderWithProviders(
      <StatCard label="Revenue" value="$48,250" deltaValue={18.2} />,
    );
    expect(screen.getByText("+18.2%")).toBeInTheDocument();
  });

  it("uses deltaLabel to override the pill text", () => {
    renderWithProviders(
      <StatCard label="Health" value="OK" deltaLabel="Needs action" />,
    );
    expect(screen.getByText("Needs action")).toBeInTheDocument();
  });

  it("renders the hint alongside the delta", () => {
    renderWithProviders(
      <StatCard
        label="Revenue"
        value="$48,250"
        deltaValue={5}
        hint="vs. last week"
      />,
    );
    expect(screen.getByText("vs. last week")).toBeInTheDocument();
    expect(screen.getByText("+5.0%")).toBeInTheDocument();
  });

  it("renders a hint on its own when no delta is provided", () => {
    renderWithProviders(
      <StatCard label="Revenue" value="$48,250" hint="vs. last week" />,
    );
    expect(screen.getByText("vs. last week")).toBeInTheDocument();
    // No delta pill.
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
  });

  it("renders no delta pill and no hint when neither is provided", () => {
    const { container } = renderWithProviders(
      <StatCard label="Revenue" value="$48,250" />,
    );
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("applies invertDelta so a positive delta reads as danger", () => {
    const { container } = renderWithProviders(
      <StatCard
        label="Lost customers"
        value="12"
        deltaValue={4}
        invertDelta
      />,
    );
    const pill = container.querySelector("span.text-danger");
    expect(pill).toBeInTheDocument();
  });

  it("renders the header icon when provided", () => {
    const { container } = renderWithProviders(
      <StatCard label="Revenue" value="$48,250" icon={DollarSign} />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
