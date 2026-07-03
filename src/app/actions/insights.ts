"use server";

/**
 * Server actions for insights and recommended actions.
 *
 * Read-only: both delegate to the data layer. Marking a recommended action as
 * done is an optimistic mock write when USE_MOCK (no persistence yet).
 */

import { USE_MOCK } from "@/lib/config";
import { listInsights, listRecommendedActions } from "@/lib/data";
import type { Insight, RecommendedAction } from "@/lib/types";

export async function listInsightsAction(
  orgId: string,
): Promise<Insight[]> {
  return listInsights(orgId);
}

export async function listRecommendedActionsAction(
  orgId: string,
): Promise<RecommendedAction[]> {
  return listRecommendedActions(orgId);
}

export interface ActionAckResult {
  actionId: string;
  acknowledged: boolean;
}

/**
 * Acknowledge / dismiss a recommended action. Optimistic no-op in mock mode.
 */
export async function acknowledgeActionAction(
  orgId: string,
  actionId: string,
): Promise<ActionAckResult> {
  void orgId;
  // Persistence wired in a later phase; mock mode simply confirms.
  return { actionId, acknowledged: USE_MOCK ? true : true };
}
