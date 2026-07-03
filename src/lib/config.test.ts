import { describe, it, expect } from "vitest";
import { USE_MOCK, CURRENT_ORG_ID } from "@/lib/config";

describe("config", () => {
  it("CURRENT_ORG_ID is the seeded org_acme tenant", () => {
    expect(CURRENT_ORG_ID).toBe("org_acme");
  });

  it("USE_MOCK is true in the test/mock environment", () => {
    // vitest.setup.ts sets NEXT_PUBLIC_USE_MOCK_DATA=true.
    expect(USE_MOCK).toBe(true);
  });
});
