// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  getDeliveryPreferences,
  listIntegrations,
  listNotificationConfigs,
} from "@/lib/data/settings";

const ACME = "org_acme";
const NORTHWIND = "org_northwind";

describe("listIntegrations (mock mode)", () => {
  it("returns all 6 Acme integrations", async () => {
    const i = await listIntegrations(ACME);
    expect(i).toHaveLength(6);
    expect(i.map((x) => x.provider)).toEqual([
      "stripe",
      "hubspot",
      "google_analytics",
      "github",
      "supabase",
      "shopify",
    ]);
  });

  it("carries exact connection state for Stripe", async () => {
    const i = await listIntegrations(ACME);
    const stripe = i.find((x) => x.provider === "stripe");
    expect(stripe).toMatchObject({
      id: "integration_stripe",
      name: "Stripe",
      status: "connected",
      lastSyncedAt: "2026-07-02T15:48:00.000Z",
    });
    const hubspot = i.find((x) => x.provider === "hubspot");
    expect(hubspot?.status).toBe("not_connected");
    expect(hubspot?.lastSyncedAt).toBeNull();
  });

  it("scopes integrations to the org (Northwind has none)", async () => {
    expect(await listIntegrations(NORTHWIND)).toEqual([]);
  });
});

describe("listNotificationConfigs (mock mode)", () => {
  it("returns the 3 Acme channels", async () => {
    const n = await listNotificationConfigs(ACME);
    expect(n).toHaveLength(3);
    expect(n.map((x) => x.channel)).toEqual(["telegram", "slack", "email"]);
  });

  it("carries exact seeded Telegram + Slack + Email targets", async () => {
    const n = await listNotificationConfigs(ACME);
    const telegram = n.find((x) => x.channel === "telegram");
    expect(telegram).toMatchObject({
      status: "connected",
      target: "@alex on Telegram",
      enabled: true,
    });
    const slack = n.find((x) => x.channel === "slack");
    expect(slack).toMatchObject({
      status: "not_connected",
      target: null,
      enabled: false,
    });
    const email = n.find((x) => x.channel === "email");
    expect(email?.target).toBe("alex@acme.com");
  });

  it("scopes channels to the org (Northwind has none)", async () => {
    expect(await listNotificationConfigs(NORTHWIND)).toEqual([]);
  });
});

describe("getDeliveryPreferences (mock mode)", () => {
  it("returns exact seeded prefs for Acme", async () => {
    const p = await getDeliveryPreferences(ACME);
    expect(p).toMatchObject({
      orgId: ACME,
      dailySummary: true,
      criticalAlerts: true,
      weeklyDigest: true,
      sendTime: "08:00",
    });
  });

  it("returns Northwind's own prefs (org scoping)", async () => {
    const p = await getDeliveryPreferences(NORTHWIND);
    expect(p).toMatchObject({
      orgId: NORTHWIND,
      dailySummary: true,
      criticalAlerts: false,
      weeklyDigest: true,
      sendTime: "07:30",
    });
  });

  it("returns null for an org with no prefs", async () => {
    expect(await getDeliveryPreferences("org_none")).toBeNull();
  });
});
