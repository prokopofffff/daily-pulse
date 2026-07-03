import { Mail, type LucideIcon, MessagesSquare, Send } from "lucide-react";

import type { NotificationChannel } from "@/lib/types";

/**
 * Per the design: Telegram = `send`, Slack = `slack`, Email = `mail`.
 * lucide-react has no `slack` glyph in this version, so we use the closest
 * chat icon (`messages-square`) for Slack.
 */
const CHANNEL_ICON: Record<NotificationChannel, LucideIcon> = {
  telegram: Send,
  slack: MessagesSquare,
  email: Mail,
};

/** Human-facing channel display names. */
export const CHANNEL_LABEL: Record<NotificationChannel, string> = {
  telegram: "Telegram",
  slack: "Slack",
  email: "Email",
};

export function ChannelIcon({
  channel,
  className,
}: {
  channel: NotificationChannel;
  className?: string;
}) {
  const Icon = CHANNEL_ICON[channel];
  return <Icon className={className} strokeWidth={2} />;
}
