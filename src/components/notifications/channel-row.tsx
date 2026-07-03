"use client";

import { StatusBadge } from "@/components/ui-ext/status-badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { NotificationConfig } from "@/lib/types";

import { ChannelIcon } from "./channel-icon";
import { CHANNEL_META } from "./channel-meta";

export interface ChannelRowProps {
  config: NotificationConfig;
  /** Fired when the enabled switch is toggled. */
  onToggle: (enabled: boolean) => void;
  /** Fired when the Connect / Manage action button is pressed. */
  onAction: () => void;
  /** Disable interactive controls while a mutation is in flight. */
  pending?: boolean;
}

/**
 * A single delivery-channel card: icon tile + name/status/destination, an
 * enabled switch and a Manage (connected) / Connect (not connected) action.
 * Matches the "Telegram / Slack / Email Card" markup in the design.
 */
export function ChannelRow({
  config,
  onToggle,
  onAction,
  pending = false,
}: ChannelRowProps) {
  const isConnected = config.status === "connected";
  const meta = CHANNEL_META[config.channel];
  const label = meta.label;
  const dest = config.target ?? meta.notConnectedFallback;

  return (
    <div className="flex w-full flex-row items-center gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface-subtle">
        <ChannelIcon
          channel={config.channel}
          className="size-5 text-foreground"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
        <div className="flex flex-row items-center gap-2.5">
          <span className="text-[15px] font-semibold leading-none text-foreground">
            {label}
          </span>
          <StatusBadge
            status={config.status}
            className="py-[3px]"
          />
        </div>
        <p className="truncate text-[13px] text-muted-foreground">{dest}</p>
      </div>

      <div className="flex shrink-0 flex-row items-center gap-4">
        <Switch
          checked={config.enabled}
          onCheckedChange={onToggle}
          disabled={pending || !isConnected}
          aria-label={`Toggle ${label} notifications`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAction}
          disabled={pending}
        >
          {isConnected ? "Manage" : "Connect"}
        </Button>
      </div>
    </div>
  );
}
