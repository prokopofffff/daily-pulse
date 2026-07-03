/**
 * Daily cron endpoint — generates and dispatches the daily report for every
 * organization. Intended to run on a schedule (e.g. Vercel Cron / external
 * scheduler) at each org's configured report time.
 *
 * Auth: requires CRON_SECRET, supplied as a Bearer token in the Authorization
 * header (the scheme Vercel Cron uses). When CRON_SECRET is unset the endpoint
 * is open (dev / mock convenience).
 *
 * For each org: collect metrics -> generateDailyReport -> shape a Report ->
 * dispatchReport via the notifications lib. Returns a JSON summary.
 */

import { generateDailyReport } from "@/lib/ai";
import { dispatchReport } from "@/lib/notifications";
import { listOrganizations } from "@/lib/data";
import type { AIReportOutput, Report } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Deterministic reference timestamps (no Date.now() — keeps output stable in
// mock/test runs). Real deployments can key these off the request time.
const RUN_DATE = "2026-07-03";
const RUN_AT = "2026-07-03T08:00:00.000Z";

interface OrgRunResult {
  orgId: string;
  reportId: string;
  status: Report["status"];
  dispatched: boolean;
}

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured -> open (dev only)

  // Bearer header only — never accept the secret via query string, which would
  // leak into access logs and Referer headers.
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/** Shape the AI output into a persisted-style Report for the org. */
function toReport(orgId: string, output: AIReportOutput): Report {
  return {
    id: `report_daily_${orgId}_${RUN_DATE}`,
    orgId,
    period: "daily",
    title: `Daily Pulse — ${RUN_DATE}`,
    date: RUN_DATE,
    summary: output.summary,
    body: output.body,
    metrics: [],
    insightIds: [],
    generatedAt: RUN_AT,
    status: "ready",
  };
}

async function runForOrg(orgId: string): Promise<OrgRunResult> {
  try {
    const output = await generateDailyReport(orgId);
    const report = toReport(orgId, output);

    // NOTE: no persistence in mock mode — the data layer has no report store.
    // A live deployment would insert `report` (and its insights/actions) here.

    let dispatched = false;
    try {
      const result = await dispatchReport(orgId, report);
      dispatched = result.ok;
    } catch {
      dispatched = false;
    }

    return {
      orgId,
      reportId: report.id,
      status: report.status,
      dispatched,
    };
  } catch {
    return {
      orgId,
      reportId: `report_daily_${orgId}_${RUN_DATE}`,
      status: "failed",
      dispatched: false,
    };
  }
}

async function handle(req: Request): Promise<Response> {
  if (!isAuthorized(req)) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const orgs = await listOrganizations();
  const results = await Promise.all(orgs.map((org) => runForOrg(org.id)));

  return Response.json({
    ok: results.every((r) => r.status !== "failed"),
    ranAt: RUN_AT,
    count: results.length,
    results,
  });
}

export async function GET(req: Request): Promise<Response> {
  return handle(req);
}

export async function POST(req: Request): Promise<Response> {
  return handle(req);
}
