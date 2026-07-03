"use client";

/**
 * Notification channel hooks: list + toggle / connect / disconnect.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  connectNotificationChannelAction,
  disconnectNotificationChannelAction,
  type NotificationMutationResult,
  toggleNotificationChannelAction,
} from "@/app/actions/notifications";
import { CURRENT_ORG_ID } from "@/lib/config";
import { listNotificationConfigs } from "@/lib/data";
import { queryKeys } from "@/lib/query-keys";
import type { NotificationChannel, NotificationConfig } from "@/lib/types";

export function useNotifications(orgId: string = CURRENT_ORG_ID) {
  return useQuery<NotificationConfig[]>({
    queryKey: queryKeys.notifications(orgId),
    queryFn: () => listNotificationConfigs(orgId),
  });
}

function applyConfig(
  qc: ReturnType<typeof useQueryClient>,
  orgId: string,
  result: NotificationMutationResult,
) {
  if (result.config) {
    const updated = result.config;
    qc.setQueryData<NotificationConfig[]>(
      queryKeys.notifications(orgId),
      (prev) =>
        prev?.map((c) => (c.channel === updated.channel ? updated : c)),
    );
  }
  qc.invalidateQueries({ queryKey: queryKeys.notifications(orgId) });
}

export function useToggleNotificationChannel(orgId: string = CURRENT_ORG_ID) {
  const qc = useQueryClient();
  return useMutation<
    NotificationMutationResult,
    Error,
    { channel: NotificationChannel; enabled: boolean }
  >({
    mutationFn: ({ channel, enabled }) =>
      toggleNotificationChannelAction(orgId, channel, enabled),
    onSuccess: (result) => applyConfig(qc, orgId, result),
  });
}

export function useConnectNotificationChannel(orgId: string = CURRENT_ORG_ID) {
  const qc = useQueryClient();
  return useMutation<
    NotificationMutationResult,
    Error,
    { channel: NotificationChannel; target?: string }
  >({
    mutationFn: ({ channel, target }) =>
      connectNotificationChannelAction(orgId, channel, target),
    onSuccess: (result) => applyConfig(qc, orgId, result),
  });
}

export function useDisconnectNotificationChannel(
  orgId: string = CURRENT_ORG_ID,
) {
  const qc = useQueryClient();
  return useMutation<NotificationMutationResult, Error, NotificationChannel>({
    mutationFn: (channel) =>
      disconnectNotificationChannelAction(orgId, channel),
    onSuccess: (result) => applyConfig(qc, orgId, result),
  });
}
