import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";

import { renderWithProviders, screen } from "@/test/render";
import { ThemeToggle } from "@/components/theme-toggle";

describe("ThemeToggle", () => {
  it("renders the segmented control with Light / Dark / System radios", () => {
    renderWithProviders(<ThemeToggle variant="segmented" />);
    const group = screen.getByRole("radiogroup", { name: "Theme" });
    expect(group).toBeInTheDocument();

    expect(screen.getByRole("radio", { name: /Light/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Dark/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /System/ })).toBeInTheDocument();
  });

  it("marks the current theme radio as checked (defaultTheme=light)", () => {
    renderWithProviders(<ThemeToggle variant="segmented" />);
    expect(screen.getByRole("radio", { name: /Light/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: /Dark/ })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("switches the checked radio when another option is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeToggle variant="segmented" />);

    await user.click(screen.getByRole("radio", { name: /Dark/ }));

    expect(screen.getByRole("radio", { name: /Dark/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: /Light/ })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("renders the dropdown trigger by default and opens the Light/Dark/System menu", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeToggle />);

    const trigger = screen.getByRole("button", { name: /Toggle theme/ });
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);

    expect(
      await screen.findByRole("menuitem", { name: /Light/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Dark/ })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /System/ }),
    ).toBeInTheDocument();
  });
});
