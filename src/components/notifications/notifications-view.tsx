"use client";

import { toast } from "sonner";

import {
  useConnectNotificationChannel,
  useDisconnectNotificationChannel,
  useNotifications,
  useToggleNotificationChannel,
} from "@/hooks/use-notifications";
import {
  useDeliveryPreferences,
  useUpdateDeliveryPreferences,
} from "@/hooks/use-delivery-preferences";
import type { NotificationChannel, NotificationConfig } from "@/lib/types";

import type { DeliveryPreferencesInput } from "@/app/actions/notifications";

import { ChannelIcon, CHANNEL_LABEL } from "./channel-icon";
import { ChannelRow } from "./channel-row";
import { DeliveryPreferencesCard } from "./delivery-preferences-card";

/** Order the channels as shown in the design: Telegram, Slack, Email. */
const CHANNEL_ORDER: NotificationChannel[] = ["telegram", "slack", "email"];

/** Suggested targets used when connecting a channel in mock mode. */
const CONNECT_TARGET: Partial<Record<NotificationChannel, string>> = {
  slack: "#daily-pulse on Slack",
};

function orderConfigs(configs: NotificationConfig[]): NotificationConfig[] {
  return [...configs].sort(
    (a, b) =>
      CHANNEL_ORDER.indexOf(a.channel) - CHANNEL_ORDER.indexOf(b.channel),
  );
}

export function NotificationsView() {
  const channelsQuery = useNotifications();
  const prefsQuery = useDeliveryPreferences();

  const toggleChannel = useToggleNotificationChannel();
  const connectChannel = useConnectNotificationChannel();
  const disconnectChannel = useDisconnectNotificationChannel();
  const updatePrefs = useUpdateDeliveryPreferences();

  const channels = channelsQuery.data ?? [];
  const preferences = prefsQuery.data ?? null;

  const channelPending =
    toggleChannel.isPending ||
    connectChannel.isPending ||
    disconnectChannel.isPending;

  function handleToggle(config: NotificationConfig, enabled: boolean) {
    toggleChannel.mutate(
      { channel: config.channel, enabled },
      {
        onSuccess: () =>
          toast.success(
            `${CHANNEL_LABEL[config.channel]} notifications ${
              enabled ? "enabled" : "paused"
            }`,
          ),
        onError: () =>
          toast.error(
            `Couldn't update ${CHANNEL_LABEL[config.channel]} notifications`,
          ),
      },
    );
  }

  function handleAction(config: NotificationConfig) {
    const name = CHANNEL_LABEL[config.channel];
    if (config.status === "connected") {
      disconnectChannel.mutate(config.channel, {
        onSuccess: () => toast.success(`${name} disconnected`),
        onError: () => toast.error(`Couldn't disconnect ${name}`),
      });
    } else {
      connectChannel.mutate(
        { channel: config.channel, target: CONNECT_TARGET[config.channel] },
        {
          onSuccess: () => toast.success(`${name} connected`),
          onError: () => toast.error(`Couldn't connect ${name}`),
        },
      );
    }
  }

  function handlePatchPrefs(patch: DeliveryPreferencesInput) {
    updatePrefs.mutate(patch, {
      onSuccess: () => toast.success("Delivery preferences updated"),
      onError: () => toast.error("Couldn't update delivery preferences"),
    });
  }

  return (
    <>
      <section className="flex w-full flex-col gap-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.3px] text-muted-foreground">
          Delivery channels
        </h2>

        {channelsQuery.isError ? (
          <ChannelsError />
        ) : channelsQuery.isLoading ? (
          <ChannelsLoading />
        ) : (
          orderConfigs(channels).map((config) => (
            <ChannelRow
              key={config.channel}
              config={config}
              pending={channelPending}
              onToggle={(enabled) => handleToggle(config, enabled)}
              onAction={() => handleAction(config)}
            />
          ))
        )}
      </section>

      {prefsQuery.isError ? (
        <PreferencesError />
      ) : preferences ? (
        <DeliveryPreferencesCard
          preferences={preferences}
          pending={updatePrefs.isPending}
          onPatch={handlePatchPrefs}
        />
      ) : prefsQuery.isLoading ? (
        <PreferencesLoading />
      ) : null}
    </>
  );
}

function ChannelsLoading() {
  return (
    <>
      {CHANNEL_ORDER.map((channel) => (
        <div
          key={channel}
          className="flex w-full flex-row items-center gap-4 rounded-lg border border-border bg-card p-5"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface-subtle">
            <ChannelIcon channel={channel} className="size-5 text-text-tertiary" />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3.5 w-28 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-40 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-[26px] w-11 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </>
  );
}

function ChannelsError() {
  return (
    <div className="flex w-full flex-col gap-1 rounded-lg border border-border bg-card p-5">
      <p className="text-sm font-medium text-foreground">
        Couldn&apos;t load delivery channels
      </p>
      <p className="text-[13px] text-muted-foreground">
        Refresh the page to try again.
      </p>
    </div>
  );
}

function PreferencesLoading() {
  return (
    <div className="flex w-full flex-col rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-2 px-5 pb-4 pt-5">
        <div className="h-4 w-40 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-56 animate-pulse rounded-full bg-muted" />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex w-full flex-row items-center gap-4 border-t border-border px-5 py-4"
        >
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3.5 w-32 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-48 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-[26px] w-11 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

function PreferencesError() {
  return (
    <div className="flex w-full flex-col gap-1 rounded-lg border border-border bg-card p-5">
      <p className="text-sm font-medium text-foreground">
        Couldn&apos;t load delivery preferences
      </p>
      <p className="text-[13px] text-muted-foreground">
        Refresh the page to try again.
      </p>
    </div>
  );
}
