import { describe, it, expect, vi, beforeEach } from "vitest";

import { renderWithProviders, screen } from "@/test/render";
import { Sidebar } from "@/components/layout/sidebar";

const mockUsePathname = vi.fn(() => "/dashboard");

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

const NAV_LABELS = [
  "Dashboard",
  "Reports",
  "Insights",
  "Notifications",
  "Integrations",
  "Settings",
];

describe("Sidebar", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/dashboard");
  });

  it("renders the brand and all six nav labels", () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText("Daily Pulse")).toBeInTheDocument();
    for (const label of NAV_LABELS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("marks the active item matching the current pathname with aria-current", () => {
    mockUsePathname.mockReturnValue("/reports");
    renderWithProviders(<Sidebar />);

    const active = screen.getByRole("link", { name: /Reports/ });
    expect(active).toHaveAttribute("aria-current", "page");
    expect(active).toHaveClass("bg-accent");
    expect(active).toHaveClass("text-accent-foreground");

    const inactive = screen.getByRole("link", { name: /Dashboard/ });
    expect(inactive).not.toHaveAttribute("aria-current");
    expect(inactive).not.toHaveClass("bg-accent");
  });

  it("treats a nested route as active for its parent nav item", () => {
    mockUsePathname.mockReturnValue("/integrations/stripe");
    renderWithProviders(<Sidebar />);

    const active = screen.getByRole("link", { name: /Integrations/ });
    expect(active).toHaveAttribute("aria-current", "page");
  });

  it("points each nav link at its href", () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: /Settings/ })).toHaveAttribute(
      "href",
      "/settings",
    );
  });
});
