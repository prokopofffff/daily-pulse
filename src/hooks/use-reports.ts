"use client";

/**
 * Reports hooks: list (by period), detail, search, and generate.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  generateReportAction,
  type GenerateReportResult,
} from "@/app/actions/reports";
import { CURRENT_ORG_ID } from "@/lib/config";
import { getReport, listReports, searchReports } from "@/lib/data";
import { queryKeys } from "@/lib/query-keys";
import type { Report, ReportPeriod } from "@/lib/types";

export function useReports(
  period?: ReportPeriod,
  orgId: string = CURRENT_ORG_ID,
) {
  return useQuery<Report[]>({
    queryKey: queryKeys.reports(orgId, period),
    queryFn: () => listReports(orgId, period),
  });
}

export function useReport(
  id: string | undefined,
  orgId: string = CURRENT_ORG_ID,
) {
  return useQuery<Report | null>({
    queryKey: queryKeys.report(orgId, id ?? ""),
    queryFn: () => getReport(orgId, id as string),
    enabled: Boolean(id),
  });
}

export function useReportSearch(q: string, orgId: string = CURRENT_ORG_ID) {
  const query = q.trim();
  return useQuery<Report[]>({
    queryKey: queryKeys.reportSearch(orgId, query),
    queryFn: () =>
      query ? searchReports(orgId, query) : listReports(orgId),
  });
}

/** Trigger AI generation of a new daily report and refresh the reports list. */
export function useGenerateReport(orgId: string = CURRENT_ORG_ID) {
  const qc = useQueryClient();
  return useMutation<GenerateReportResult, Error, void>({
    mutationFn: () => generateReportAction(orgId),
    onSuccess: () => {
      // Invalidate the reports *prefix* so every cached list (any period tab),
      // plus detail and search queries, refetch — a period-specific key would
      // only partial-match its own tab and miss the default "daily" list.
      qc.invalidateQueries({ queryKey: queryKeys.reportsRoot(orgId) });
      qc.invalidateQueries({ queryKey: queryKeys.insights(orgId) });
    },
  });
}
