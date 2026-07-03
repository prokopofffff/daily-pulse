"use client";

/**
 * Delivery preferences hooks: read + patch.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  type DeliveryPreferencesInput,
  getDeliveryPreferencesAction,
  updateDeliveryPreferencesAction,
} from "@/app/actions/notifications";
import { CURRENT_ORG_ID } from "@/lib/config";
import { getDeliveryPreferences } from "@/lib/data";
import { queryKeys } from "@/lib/query-keys";
import type { DeliveryPreferences } from "@/lib/types";

export function useDeliveryPreferences(orgId: string = CURRENT_ORG_ID) {
  return useQuery<DeliveryPreferences | null>({
    queryKey: queryKeys.deliveryPreferences(orgId),
    queryFn: () => getDeliveryPreferences(orgId),
  });
}

export function useUpdateDeliveryPreferences(orgId: string = CURRENT_ORG_ID) {
  const qc = useQueryClient();
  return useMutation<
    DeliveryPreferences | null,
    Error,
    DeliveryPreferencesInput
  >({
    mutationFn: (patch) => updateDeliveryPreferencesAction(orgId, patch),
    onSuccess: (updated) => {
      if (updated) {
        qc.setQueryData(queryKeys.deliveryPreferences(orgId), updated);
      }
      qc.invalidateQueries({
        queryKey: queryKeys.deliveryPreferences(orgId),
      });
    },
  });
}

// Re-export for callers that want the query-fn action directly.
export { getDeliveryPreferencesAction };
