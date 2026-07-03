// @vitest-environment node
import { describe, it, expect } from "vitest";
import { getOrganization, listOrganizations } from "@/lib/data/organizations";
import { CURRENT_ORG_ID } from "@/lib/config";

describe("getOrganization (mock mode)", () => {
  it("returns the seeded Acme org with exact fields", async () => {
    const org = await getOrganization(CURRENT_ORG_ID);
    expect(org).not.toBeNull();
    expect(org).toMatchObject({
      id: "org_acme",
      name: "Acme Inc.",
      slug: "acme",
      timezone: "America/Los_Angeles",
      reportTime: "08:00",
      accentColor: "#2563EB",
      logoUrl: null,
      createdAt: "2025-01-15T08:00:00.000Z",
    });
  });

  it("returns the Northwind org", async () => {
    const org = await getOrganization("org_northwind");
    expect(org?.slug).toBe("northwind");
    expect(org?.name).toBe("Northwind Trading");
    expect(org?.timezone).toBe("America/New_York");
  });

  it("returns null for an unknown org id", async () => {
    expect(await getOrganization("org_does_not_exist")).toBeNull();
  });
});

describe("listOrganizations (mock mode)", () => {
  it("lists both seeded organizations", async () => {
    const orgs = await listOrganizations();
    expect(orgs).toHaveLength(2);
    expect(orgs.map((o) => o.id).sort()).toEqual([
      "org_acme",
      "org_northwind",
    ]);
  });
});
