/**
 * Inbound webhook endpoint: POST /api/webhooks/[provider]
 *
 * Validates a shared signing secret, then hands the parsed JSON body to
 * `ingestWebhook`, which normalizes it into Metric[]. Returns a small JSON
 * acknowledgement. Designed to never throw a 500 for a malformed body — a bad
 * payload yields `accepted: false` with 200 so providers don't hammer retries.
 *
 * Signing secret:
 *  - Header `x-webhook-secret` (or Stripe-style `x-webhook-signature`) must
 *    match env `WEBHOOK_SECRET` (falls back to `CRON_SECRET`).
 *  - In mock mode / when no secret is configured, verification is skipped so
 *    the endpoint is usable in local demos.
 */

import { NextRequest, NextResponse } from "next/server";
import { USE_MOCK, CURRENT_ORG_ID } from "@/lib/config";
import { ingestWebhook, isWebhookProvider } from "@/lib/integrations/webhook";

export const runtime = "nodejs";

function getConfiguredSecret(): string | undefined {
  const s = process.env.WEBHOOK_SECRET ?? process.env.CRON_SECRET;
  return s == null || s === "" || s === "change-me" ? undefined : s;
}

function isAuthorized(req: NextRequest): boolean {
  const expected = getConfiguredSecret();
  // No secret configured (or mock mode): allow, for local/demo usage.
  if (!expected || USE_MOCK) return true;

  const provided =
    req.headers.get("x-webhook-secret") ??
    req.headers.get("x-webhook-signature") ??
    "";
  return provided === expected;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ provider: string }> },
) {
  const { provider } = await ctx.params;

  if (!isWebhookProvider(provider)) {
    return NextResponse.json(
      { ok: false, error: `Unknown webhook provider "${provider}"` },
      { status: 404 },
    );
  }

  if (!isAuthorized(req)) {
    return NextResponse.json(
      { ok: false, error: "Invalid signing secret" },
      { status: 401 },
    );
  }

  // Org can be scoped via ?org=, defaulting to the current single-tenant org.
  const orgId = req.nextUrl.searchParams.get("org") ?? CURRENT_ORG_ID;

  let payload: unknown = {};
  try {
    const text = await req.text();
    payload = text ? JSON.parse(text) : {};
  } catch {
    // Malformed JSON — acknowledge without ingesting so the provider stops
    // retrying, but signal that nothing was accepted.
    return NextResponse.json(
      { ok: true, accepted: false, provider, metrics: 0 },
      { status: 200 },
    );
  }

  const result = await ingestWebhook(orgId, provider, payload);

  return NextResponse.json(
    {
      ok: true,
      accepted: result.accepted,
      provider: result.provider,
      metrics: result.metrics.length,
    },
    { status: 200 },
  );
}
