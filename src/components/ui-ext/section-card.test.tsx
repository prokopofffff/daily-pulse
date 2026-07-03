import { describe, it, expect } from "vitest";

import { renderWithProviders, screen } from "@/test/render";
import { SectionCard } from "@/components/ui-ext/section-card";

describe("SectionCard", () => {
  it("renders the title, description and children", () => {
    renderWithProviders(
      <SectionCard title="Revenue" description="Last 7 days">
        <p>Chart goes here</p>
      </SectionCard>,
    );
    const heading = screen.getByRole("heading", { name: "Revenue" });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
    expect(screen.getByText("Chart goes here")).toBeInTheDocument();
  });

  it("renders the right-aligned header slot", () => {
    renderWithProviders(
      <SectionCard title="Revenue" headerRight={<button>Filter</button>}>
        <div>body</div>
      </SectionCard>,
    );
    expect(screen.getByRole("button", { name: "Filter" })).toBeInTheDocument();
  });

  it("renders a header-less card (no heading) but still shows children", () => {
    renderWithProviders(
      <SectionCard>
        <span>only body</span>
      </SectionCard>,
    );
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.getByText("only body")).toBeInTheDocument();
  });

  it("renders a header when only headerRight is provided", () => {
    renderWithProviders(
      <SectionCard headerRight={<span>badge</span>}>
        <div>body</div>
      </SectionCard>,
    );
    expect(screen.getByText("badge")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});
