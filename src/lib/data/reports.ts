import { USE_MOCK } from "@/lib/config";
import { reports } from "@/lib/mock-data";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Report, ReportPeriod } from "@/lib/types";

function sortByDateDesc(a: Report, b: Report): number {
  return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
}

/** List reports for an org, most recent first, optionally filtered by period. */
export async function listReports(
  orgId: string,
  period?: ReportPeriod,
): Promise<Report[]> {
  if (USE_MOCK) {
    return reports
      .filter((r) => r.orgId === orgId && (!period || r.period === period))
      .sort(sortByDateDesc);
  }

  const supabase = await getServerSupabase();
  if (!supabase) {
    return reports
      .filter((r) => r.orgId === orgId && (!period || r.period === period))
      .sort(sortByDateDesc);
  }

  let query = supabase
    .from("reports")
    .select("*")
    .eq("org_id", orgId)
    .order("date", { ascending: false });
  if (period) query = query.eq("period", period);

  const { data } = await query;
  return (data as Report[] | null) ?? [];
}

/** Fetch a single report by id. */
export async function getReport(
  orgId: string,
  id: string,
): Promise<Report | null> {
  if (USE_MOCK) {
    return reports.find((r) => r.orgId === orgId && r.id === id) ?? null;
  }

  const supabase = await getServerSupabase();
  if (!supabase) {
    return reports.find((r) => r.orgId === orgId && r.id === id) ?? null;
  }

  const { data } = await supabase
    .from("reports")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", id)
    .maybeSingle();

  return (data as Report | null) ?? null;
}

/** Full-text-ish search over report title, summary and body. */
export async function searchReports(
  orgId: string,
  q: string,
): Promise<Report[]> {
  const term = q.trim().toLowerCase();
  if (!term) return listReports(orgId);

  if (USE_MOCK) {
    return reports
      .filter(
        (r) =>
          r.orgId === orgId &&
          (r.title.toLowerCase().includes(term) ||
            r.summary.toLowerCase().includes(term) ||
            r.body.toLowerCase().includes(term)),
      )
      .sort(sortByDateDesc);
  }

  const supabase = await getServerSupabase();
  if (!supabase) {
    return reports
      .filter(
        (r) =>
          r.orgId === orgId &&
          (r.title.toLowerCase().includes(term) ||
            r.summary.toLowerCase().includes(term) ||
            r.body.toLowerCase().includes(term)),
      )
      .sort(sortByDateDesc);
  }

  const { data } = await supabase
    .from("reports")
    .select("*")
    .eq("org_id", orgId)
    .or(`title.ilike.%${term}%,summary.ilike.%${term}%,body.ilike.%${term}%`)
    .order("date", { ascending: false });

  return (data as Report[] | null) ?? [];
}
