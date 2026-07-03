// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Control USE_MOCK so we can exercise the signature-verification branch, which
// is skipped in mock mode. CURRENT_ORG_ID kept as the real seeded org id.
vi.mock("@/lib/config", () => ({
  get USE_MOCK() {
    return mockConfig.USE_MOCK;
  },
  CURRENT_ORG_ID: "org_acme",
  DEMO_NOW_ISO: "2026-07-02T16:00:00.000Z",
}));

const mockConfig = { USE_MOCK: true };

import { POST } from "./route";

const OLD_ENV = { ...process.env };

function makeReq(
  provider: string,
  init: { headers?: Record<string, string>; body?: string; org?: string } = {},
): { req: NextRequest; ctx: { params: Promise<{ provider: string }> } } {
  const search = init.org ? `?org=${init.org}` : "";
  const req = new NextRequest(
    `http://localhost/api/webhooks/${provider}${search}`,
    {
      method: "POST",
      headers: init.headers,
      body: init.body,
    },
  );
  return { req, ctx: { params: Promise.resolve({ provider }) } };
}

describe("webhooks/[provider] route", () => {
  beforeEach(() => {
    mockConfig.USE_MOCK = true;
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = { ...OLD_ENV };
  });

  it("returns 404 for an unknown provider", async () => {
    const { req, ctx } = makeReq("nope", { body: "{}" });
    const res = await POST(req, ctx);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain("nope");
  });

  it("rejects a missing/invalid signature with 401 when a secret is configured (non-mock)", async () => {
    mockConfig.USE_MOCK = false;
    process.env.WEBHOOK_SECRET = "super-secret";

    // No signature header at all.
    const missing = makeReq("stripe", { body: "{}" });
    const missingRes = await POST(missing.req, missing.ctx);
    expect(missingRes.status).toBe(401);
    const missingJson = await missingRes.json();
    expect(missingJson.error).toBe("Invalid signing secret");

    // Wrong signature.
    const wrong = makeReq("stripe", {
      headers: { "x-webhook-secret": "nope" },
      body: "{}",
    });
    const wrongRes = await POST(wrong.req, wrong.ctx);
    expect(wrongRes.status).toBe(401);
  });

  it("accepts a valid x-webhook-secret and ingests a stripe charge (non-mock)", async () => {
    mockConfig.USE_MOCK = false;
    process.env.WEBHOOK_SECRET = "super-secret";

    const { req, ctx } = makeReq("stripe", {
      headers: { "x-webhook-secret": "super-secret" },
      body: JSON.stringify({
        type: "charge.succeeded",
        data: { object: { amount: 4999 } },
      }),
    });
    const res = await POST(req, ctx);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.accepted).toBe(true);
    expect(json.provider).toBe("stripe");
    // One revenue metric normalized from the charge.
    expect(json.metrics).toBe(1);
  });

  it("accepts the Stripe-style x-webhook-signature header (non-mock)", async () => {
    mockConfig.USE_MOCK = false;
    process.env.WEBHOOK_SECRET = "super-secret";

    const { req, ctx } = makeReq("github", {
      headers: { "x-webhook-signature": "super-secret" },
      body: JSON.stringify({
        action: "opened",
        issue: { labels: [{ name: "critical" }] },
      }),
    });
    const res = await POST(req, ctx);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.accepted).toBe(true);
    expect(json.metrics).toBe(1);
  });

  it("skips verification in mock mode (no secret required)", async () => {
    mockConfig.USE_MOCK = true;
    process.env.WEBHOOK_SECRET = "super-secret";

    const { req, ctx } = makeReq("stripe", {
      body: JSON.stringify({
        type: "charge.succeeded",
        data: { object: { amount: 12300 } },
      }),
    });
    const res = await POST(req, ctx);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.accepted).toBe(true);
  });

  it("falls back to CRON_SECRET when WEBHOOK_SECRET is unset (non-mock)", async () => {
    mockConfig.USE_MOCK = false;
    delete process.env.WEBHOOK_SECRET;
    process.env.CRON_SECRET = "cron-secret";

    const bad = makeReq("stripe", {
      headers: { "x-webhook-secret": "nope" },
      body: "{}",
    });
    expect((await POST(bad.req, bad.ctx)).status).toBe(401);

    const good = makeReq("stripe", {
      headers: { "x-webhook-secret": "cron-secret" },
      body: JSON.stringify({
        type: "charge.succeeded",
        data: { object: { amount: 500 } },
      }),
    });
    expect((await POST(good.req, good.ctx)).status).toBe(200);
  });

  it('treats the placeholder secret "change-me" as unset (open) in non-mock mode', async () => {
    mockConfig.USE_MOCK = false;
    process.env.WEBHOOK_SECRET = "change-me";
    delete process.env.CRON_SECRET;

    const { req, ctx } = makeReq("stripe", {
      body: JSON.stringify({
        type: "charge.succeeded",
        data: { object: { amount: 100 } },
      }),
    });
    const res = await POST(req, ctx);
    // No effective secret -> authorized.
    expect(res.status).toBe(200);
  });

  it("acknowledges malformed JSON with 200 accepted:false (never 500)", async () => {
    mockConfig.USE_MOCK = true;
    const { req, ctx } = makeReq("stripe", { body: "{ not json" });
    const res = await POST(req, ctx);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.accepted).toBe(false);
    expect(json.metrics).toBe(0);
  });

  it("returns accepted:false for a recognized provider with an irrelevant payload", async () => {
    mockConfig.USE_MOCK = true;
    const { req, ctx } = makeReq("hubspot", {
      body: JSON.stringify({ subscriptionType: "something.else" }),
    });
    const res = await POST(req, ctx);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.accepted).toBe(false);
    expect(json.metrics).toBe(0);
  });
});
