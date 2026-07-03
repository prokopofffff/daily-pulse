/**
 * Slack delivery via an Incoming Webhook.
 *
 * Guarded by SLACK_WEBHOOK_URL. When unset (or in mock mode) this is a no-op
 * that logs the payload and reports success.
 */

import { USE_MOCK } from "@/lib/config";
import type { SendResult } from "./telegram";

export interface SlackMessage {
  /** Slack mrkdwn body. */
  text: string;
  /** Overrides the env webhook URL. */
  webhookUrl?: string;
}

/** Post a message to a Slack Incoming Webhook. Safe when unconfigured. */
export async function sendSlack(msg: SlackMessage): Promise<SendResult> {
  const webhookUrl = msg.webhookUrl ?? process.env.SLACK_WEBHOOK_URL;

  if (USE_MOCK || !webhookUrl) {
    console.log("[notifications:slack] (mock/no-op) would send:", {
      preview: msg.text.slice(0, 120),
    });
    return { ok: true, skipped: true };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: msg.text, mrkdwn: true }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, skipped: false, error: `Slack ${res.status}: ${detail}` };
    }
    return { ok: true, skipped: false };
  } catch (err) {
    return {
      ok: false,
      skipped: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
