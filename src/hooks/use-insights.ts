"use client";

/**
 * Insights + recommended-actions hooks.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  acknowledgeActionAction,
  type ActionAckResult,
} from "@/app/actions/insights";
import { CURRENT_ORG_ID } from "@/lib/config";
import { listInsights, listRecommendedActions } from "@/lib/data";
import { queryKeys } from "@/lib/query-keys";
import type { Insight, RecommendedAction } from "@/lib/types";

export function useInsights(orgId: string = CURRENT_ORG_ID) {
  return useQuery<Insight[]>({
    queryKey: queryKeys.insights(orgId),
    queryFn: () => listInsights(orgId),
  });
}

export function useRecommendedActions(orgId: string = CURRENT_ORG_ID) {
  return useQuery<RecommendedAction[]>({
    queryKey: queryKeys.recommendedActions(orgId),
    queryFn: () => listRecommendedActions(orgId),
  });
}

/** Acknowledge / dismiss a recommended action. */
export function useAcknowledgeAction(orgId: string = CURRENT_ORG_ID) {
  const qc = useQueryClient();
  return useMutation<ActionAckResult, Error, string>({
    mutationFn: (actionId) => acknowledgeActionAction(orgId, actionId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.recommendedActions(orgId),
      });
    },
  });
}
