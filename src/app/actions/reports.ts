"use server";

/**
 * Server actions for reports.
 *
 * Reads delegate to the data layer. The write path (generate a new daily
 * report) calls into the Phase 3 AI + notifications libs. In mock mode the
 * AI lib returns a deterministic seeded output and dispatch is a no-op.
 */

import { USE_MOCK } from "@/lib/config";
import {
  getReport,
  listReports,
  searchReports,
} from "@/lib/data";
import type {
  AIReportOutput,
  Report,
  ReportPeriod,
} from "@/lib/types";
// Resolved in Phase 3.
import { generateDailyReport } from "@/lib/ai";
import { dispatchReport } from "@/lib/notifications";

export async function listReportsAction(
  orgId: string,
  period?: ReportPeriod,
): Promise<Report[]> {
  return listReports(orgId, period);
}

export async function getReportAction(
  orgId: string,
  id: string,
): Promise<Report | null> {
  return getReport(orgId, id);
}

export async function searchReportsAction(
  orgId: string,
  q: string,
): Promise<Report[]> {
  const query = q.trim();
  if (!query) return listReports(orgId);
  return searchReports(orgId, query);
}

export interface GenerateReportResult {
  report: Report;
  output: AIReportOutput;
  dispatched: boolean;
}

/**
 * Generate a fresh daily report via the AI lib and (optionally) dispatch it
 * through the configured notification channels. In mock mode this shapes the
 * AI output into a deterministic Report without persisting.
 */
export async function generateReportAction(
  orgId: string,
): Promise<GenerateReportResult> {
  const output = await generateDailyReport(orgId);

  const report: Report = {
    id: `report_generated_${orgId}`,
    orgId,
    period: "daily",
    title: "Daily Pulse — generated",
    date: "2026-07-03",
    summary: output.summary,
    body: output.body,
    metrics: [],
    insightIds: [],
    generatedAt: "2026-07-03T08:00:00.000Z",
    status: "ready",
  };

  let dispatched = false;
  try {
    await dispatchReport(orgId, report);
    dispatched = true;
  } catch {
    dispatched = USE_MOCK;
  }

  return { report, output, dispatched };
}
