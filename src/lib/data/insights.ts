import { USE_MOCK } from "@/lib/config";
import { insights, recommendedActions } from "@/lib/mock-data";
import { getServerSupabase } from "@/lib/supabase/server";
import type { ActionPriority, Insight, RecommendedAction } from "@/lib/types";

const PRIORITY_RANK: Record<ActionPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/** Insights for an org, ranked by confidence descending. */
export async function listInsights(orgId: string): Promise<Insight[]> {
  if (USE_MOCK) {
    return insights
      .filter((i) => i.orgId === orgId)
      .sort((a, b) => b.confidence - a.confidence);
  }

  const supabase = await getServerSupabase();
  if (!supabase) {
    return insights
      .filter((i) => i.orgId === orgId)
      .sort((a, b) => b.confidence - a.confidence);
  }

  const { data } = await supabase
    .from("insights")
    .select("*")
    .eq("org_id", orgId)
    .order("confidence", { ascending: false });

  return (data as Insight[] | null) ?? [];
}

/** Recommended actions for an org, ordered high → low priority. */
export async function listRecommendedActions(
  orgId: string,
): Promise<RecommendedAction[]> {
  if (USE_MOCK) {
    return recommendedActions
      .filter((a) => a.orgId === orgId)
      .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  }

  const supabase = await getServerSupabase();
  if (!supabase) {
    return recommendedActions
      .filter((a) => a.orgId === orgId)
      .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  }

  const { data } = await supabase
    .from("recommended_actions")
    .select("*")
    .eq("org_id", orgId);

  return ((data as RecommendedAction[] | null) ?? []).sort(
    (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
  );
}
