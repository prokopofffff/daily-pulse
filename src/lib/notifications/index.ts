/**
 * Notifications backend — public entry point.
 *
 * `dispatchReport` reads the org's notification configs + delivery preferences
 * from the data layer and sends a formatted report to every channel that is
 * both connected and enabled. `sendCriticalAlert` does the same for a single
 * critical insight, gated by the org's `criticalAlerts` preference.
 *
 * Every channel sender is env-guarded and no-ops (with a console log) when its
 * credentials are absent or when running in mock mode, so this is always safe
 * to call from server actions and the cron route.
 */

import { getDeliveryPreferences, listNotificationConfigs } from "@/lib/data";
import type {
  Insight,
  NotificationChannel,
  NotificationConfig,
  Report,
} from "@/lib/types";

import { formatCriticalAlert, formatReport } from "./format";
import { sendEmail } from "./email";
import { sendSlack } from "./slack";
import { sendTelegram, type SendResult } from "./telegram";

export type { SendResult } from "./telegram";
export type { FormattedAlert, FormattedReport } from "./format";
export { formatCriticalAlert, formatReport } from "./format";
export { sendTelegram } from "./telegram";
export { sendSlack } from "./slack";
export { sendEmail } from "./email";

/** Per-channel outcome of a dispatch. */
export interface ChannelDispatchResult extends SendResult {
  channel: NotificationChannel;
}

/** Aggregate outcome of a dispatch across all channels. */
export interface DispatchResult {
  /** True when every attempted channel succeeded (or there were none). */
  ok: boolean;
  /** Channels that were connected + enabled and therefore attempted. */
  results: ChannelDispatchResult[];
}

/** Channels that are connected AND enabled for this org. */
function activeChannels(configs: NotificationConfig[]): NotificationConfig[] {
  return configs.filter((c) => c.status === "connected" && c.enabled);
}

async function sendReportToChannel(
  config: NotificationConfig,
  formatted: ReturnType<typeof formatReport>,
): Promise<ChannelDispatchResult> {
  const result = await routeSend(config, {
    telegram: () => sendTelegram({ markdown: formatted.markdown, chatId: targetOf(config) }),
    slack: () => sendSlack({ text: formatted.slack }),
    email: () =>
      sendEmail({
        to: targetOf(config) ?? "",
        subject: formatted.subject,
        html: formatted.html,
        text: formatted.text,
      }),
  });
  return { channel: config.channel, ...result };
}

async function sendAlertToChannel(
  config: NotificationConfig,
  formatted: ReturnType<typeof formatCriticalAlert>,
): Promise<ChannelDispatchResult> {
  const result = await routeSend(config, {
    telegram: () => sendTelegram({ markdown: formatted.markdown, chatId: targetOf(config) }),
    slack: () => sendSlack({ text: formatted.slack }),
    email: () =>
      sendEmail({
        to: targetOf(config) ?? "",
        subject: formatted.subject,
        html: formatted.html,
        text: formatted.text,
      }),
  });
  return { channel: config.channel, ...result };
}

function routeSend(
  config: NotificationConfig,
  handlers: Record<NotificationChannel, () => Promise<SendResult>>,
): Promise<SendResult> {
  const handler = handlers[config.channel];
  return handler();
}

function targetOf(config: NotificationConfig): string | undefined {
  return config.target ?? undefined;
}

/**
 * Dispatch a report to all connected + enabled channels for the org, gated by
 * the `dailySummary` (daily/monthly) or `weeklyDigest` (weekly) preference.
 * Never throws: channel failures are captured per-channel in the result.
 */
export async function dispatchReport(
  orgId: string,
  report: Report,
): Promise<DispatchResult> {
  const [configs, prefs] = await Promise.all([
    listNotificationConfigs(orgId),
    getDeliveryPreferences(orgId),
  ]);

  // Respect delivery preferences for the relevant cadence.
  const cadenceEnabled =
    report.period === "weekly"
      ? prefs?.weeklyDigest !== false
      : prefs?.dailySummary !== false;

  if (!cadenceEnabled) {
    return { ok: true, results: [] };
  }

  const formatted = formatReport(report);
  const targets = activeChannels(configs);

  const results = await Promise.all(
    targets.map((config) => sendReportToChannel(config, formatted)),
  );

  return { ok: results.every((r) => r.ok), results };
}

/**
 * Dispatch a single critical insight to all connected + enabled channels,
 * gated by the org's `criticalAlerts` preference. Never throws.
 */
export async function sendCriticalAlert(
  orgId: string,
  insight: Insight,
): Promise<DispatchResult> {
  const [configs, prefs] = await Promise.all([
    listNotificationConfigs(orgId),
    getDeliveryPreferences(orgId),
  ]);

  if (prefs?.criticalAlerts === false) {
    return { ok: true, results: [] };
  }

  const formatted = formatCriticalAlert(insight);
  const targets = activeChannels(configs);

  const results = await Promise.all(
    targets.map((config) => sendAlertToChannel(config, formatted)),
  );

  return { ok: results.every((r) => r.ok), results };
}
