import { describe, it, expect } from "vitest";

import { renderWithProviders, screen } from "@/test/render";
import { ConversionDonut } from "@/components/charts/conversion-donut";

describe("ConversionDonut", () => {
  it("renders without throwing and shows the centered percentage", () => {
    renderWithProviders(<ConversionDonut value={3.8} />);
    expect(screen.getByText("3.8%")).toBeInTheDocument();
  });

  it("renders the default caption", () => {
    renderWithProviders(<ConversionDonut value={3.8} />);
    expect(screen.getByText("of visitors")).toBeInTheDocument();
  });

  it("renders a custom caption", () => {
    renderWithProviders(<ConversionDonut value={5} caption="of sessions" />);
    expect(screen.getByText("of sessions")).toBeInTheDocument();
  });

  it("mounts the recharts responsive container", () => {
    const { container } = renderWithProviders(<ConversionDonut value={3.8} />);
    expect(
      container.querySelector(".recharts-responsive-container"),
    ).toBeInTheDocument();
  });
});
