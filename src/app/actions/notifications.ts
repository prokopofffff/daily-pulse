"use server";

/**
 * Server actions for notification channels and delivery preferences.
 *
 * Reads delegate to the data layer. Toggling a channel, connecting a channel,
 * and updating delivery preferences are optimistic mock writes when USE_MOCK.
 */

import {
  getDeliveryPreferences,
  listNotificationConfigs,
} from "@/lib/data";
import type {
  DeliveryPreferences,
  NotificationChannel,
  NotificationConfig,
} from "@/lib/types";

export async function listNotificationsAction(
  orgId: string,
): Promise<NotificationConfig[]> {
  return listNotificationConfigs(orgId);
}

export async function getDeliveryPreferencesAction(
  orgId: string,
): Promise<DeliveryPreferences | null> {
  return getDeliveryPreferences(orgId);
}

async function findConfig(
  orgId: string,
  channel: NotificationChannel,
): Promise<NotificationConfig | null> {
  const all = await listNotificationConfigs(orgId);
  return all.find((c) => c.channel === channel) ?? null;
}

export interface NotificationMutationResult {
  channel: NotificationChannel;
  config: NotificationConfig | null;
}

/** Fetch the current channel config and return it merged with an optimistic patch. */
async function patchConfig(
  orgId: string,
  channel: NotificationChannel,
  patch: Partial<NotificationConfig>,
): Promise<NotificationMutationResult> {
  const current = await findConfig(orgId, channel);
  return { channel, config: current ? { ...current, ...patch } : null };
}

/** Enable / disable an already-connected channel. */
export async function toggleNotificationChannelAction(
  orgId: string,
  channel: NotificationChannel,
  enabled: boolean,
): Promise<NotificationMutationResult> {
  return patchConfig(orgId, channel, { enabled });
}

/** Connect (or disconnect) a channel and optionally set its delivery target. */
export async function connectNotificationChannelAction(
  orgId: string,
  channel: NotificationChannel,
  target?: string,
): Promise<NotificationMutationResult> {
  const current = await findConfig(orgId, channel);
  const config: NotificationConfig | null = current
    ? {
        ...current,
        status: "connected",
        enabled: true,
        target: target ?? current.target,
      }
    : null;
  return { channel, config };
}

export async function disconnectNotificationChannelAction(
  orgId: string,
  channel: NotificationChannel,
): Promise<NotificationMutationResult> {
  return patchConfig(orgId, channel, { status: "not_connected", enabled: false });
}

export interface DeliveryPreferencesInput {
  dailySummary?: boolean;
  criticalAlerts?: boolean;
  weeklyDigest?: boolean;
  sendTime?: string;
}

/** Patch delivery preferences; optimistic merge in mock mode. */
export async function updateDeliveryPreferencesAction(
  orgId: string,
  patch: DeliveryPreferencesInput,
): Promise<DeliveryPreferences | null> {
  const current = await getDeliveryPreferences(orgId);
  if (!current) return null;
  return { ...current, ...patch };
}
