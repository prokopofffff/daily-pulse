"use client";

/**
 * Integrations hooks: list + connect / disconnect / sync mutations.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  connectIntegrationAction,
  disconnectIntegrationAction,
  type IntegrationMutationResult,
  syncIntegrationAction,
} from "@/app/actions/integrations";
import { CURRENT_ORG_ID } from "@/lib/config";
import { listIntegrations } from "@/lib/data";
import { queryKeys } from "@/lib/query-keys";
import type { Integration, IntegrationProvider } from "@/lib/types";

export function useIntegrations(orgId: string = CURRENT_ORG_ID) {
  return useQuery<Integration[]>({
    queryKey: queryKeys.integrations(orgId),
    queryFn: () => listIntegrations(orgId),
  });
}

type Mutation = (
  orgId: string,
  provider: IntegrationProvider,
) => Promise<IntegrationMutationResult>;

function useIntegrationMutation(action: Mutation, orgId: string) {
  const qc = useQueryClient();
  return useMutation<IntegrationMutationResult, Error, IntegrationProvider>({
    mutationFn: (provider) => action(orgId, provider),
    onSuccess: (result) => {
      if (result.integration) {
        const updated = result.integration;
        qc.setQueryData<Integration[]>(
          queryKeys.integrations(orgId),
          (prev) =>
            prev?.map((i) =>
              i.provider === updated.provider ? updated : i,
            ),
        );
      }
      qc.invalidateQueries({ queryKey: queryKeys.integrations(orgId) });
    },
  });
}

export function useConnectIntegration(orgId: string = CURRENT_ORG_ID) {
  return useIntegrationMutation(connectIntegrationAction, orgId);
}

export function useDisconnectIntegration(orgId: string = CURRENT_ORG_ID) {
  return useIntegrationMutation(disconnectIntegrationAction, orgId);
}

export function useSyncIntegration(orgId: string = CURRENT_ORG_ID) {
  return useIntegrationMutation(syncIntegrationAction, orgId);
}
