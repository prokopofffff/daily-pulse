import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatCompact, formatPercent } from "@/lib/utils";

describe("utils (harness smoke)", () => {
  it("cn merges and dedupes classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe("text-sm font-bold");
  });

  it("formatCurrency formats USD with no decimals", () => {
    expect(formatCurrency(48250)).toBe("$48,250");
  });

  it("formatCompact abbreviates large numbers", () => {
    expect(formatCompact(21400)).toBe("21.4K");
  });

  it("formatPercent signs and rounds", () => {
    expect(formatPercent(18.2)).toBe("+18.2%");
    expect(formatPercent(-14)).toBe("−14.0%");
    expect(formatPercent(3.8, false)).toBe("3.8%");
  });
});
