import type { NotificationChannel } from "@/lib/types";

export interface ChannelMeta {
  /** Human-facing channel display name. */
  label: string;
  /**
   * Destination text shown when the channel has no configured target
   * (i.e. is not connected). Slack differs from the other channels.
   */
  notConnectedFallback: string;
}

/** Per-channel display metadata (label + not-connected fallback text). */
export const CHANNEL_META: Record<NotificationChannel, ChannelMeta> = {
  telegram: {
    label: "Telegram",
    notConnectedFallback: "Not connected",
  },
  slack: {
    label: "Slack",
    notConnectedFallback: "Not linked to a workspace yet",
  },
  email: {
    label: "Email",
    notConnectedFallback: "Not connected",
  },
};
