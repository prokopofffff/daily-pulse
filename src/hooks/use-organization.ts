"use client";

/**
 * Organization hooks: current org, org list, and settings patch.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  type OrganizationSettingsInput,
  updateOrganizationAction,
} from "@/app/actions/organization";
import { CURRENT_ORG_ID } from "@/lib/config";
import { getOrganization, listOrganizations } from "@/lib/data";
import { queryKeys } from "@/lib/query-keys";
import type { Organization } from "@/lib/types";

export function useOrganization(orgId: string = CURRENT_ORG_ID) {
  return useQuery<Organization | null>({
    queryKey: queryKeys.organization(orgId),
    queryFn: () => getOrganization(orgId),
  });
}

export function useOrganizations() {
  return useQuery<Organization[]>({
    queryKey: queryKeys.organizations(),
    queryFn: () => listOrganizations(),
  });
}

export function useUpdateOrganization(orgId: string = CURRENT_ORG_ID) {
  const qc = useQueryClient();
  return useMutation<
    Organization | null,
    Error,
    OrganizationSettingsInput
  >({
    mutationFn: (patch) => updateOrganizationAction(orgId, patch),
    onSuccess: (updated) => {
      if (updated) {
        qc.setQueryData(queryKeys.organization(orgId), updated);
      }
      qc.invalidateQueries({ queryKey: queryKeys.organization(orgId) });
      qc.invalidateQueries({ queryKey: queryKeys.organizations() });
    },
  });
}
