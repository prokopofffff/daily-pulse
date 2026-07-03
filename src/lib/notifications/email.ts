/**
 * Email delivery via the Resend HTTP API.
 *
 * Guarded by RESEND_API_KEY (+ EMAIL_FROM). When unset (or in mock mode) this
 * is a no-op that logs the payload and reports success. Uses the Resend REST
 * endpoint directly (no SDK dependency).
 */

import { USE_MOCK } from "@/lib/config";
import type { SendResult } from "./telegram";

const DEFAULT_FROM = "pulse@dailypulse.app";

export interface EmailMessage {
  /** Recipient email address. */
  to: string;
  subject: string;
  /** HTML body. */
  html: string;
  /** Plain-text fallback body. */
  text: string;
  /** Overrides the env EMAIL_FROM. */
  from?: string;
}

function resolveTo(raw: string): string | undefined {
  // Targets may be stored as plain emails ("alex@acme.com"); extract an address
  // if wrapped in extra copy, otherwise pass through when it looks like one.
  const match = raw.match(/[^\s<>]+@[^\s<>]+\.[^\s<>]+/);
  return match?.[0] ?? (raw.includes("@") ? raw : undefined);
}

/** Send a transactional email via Resend. Safe when unconfigured. */
export async function sendEmail(msg: EmailMessage): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = msg.from ?? process.env.EMAIL_FROM ?? DEFAULT_FROM;
  const to = resolveTo(msg.to);

  if (USE_MOCK || !apiKey || !to) {
    console.log("[notifications:email] (mock/no-op) would send:", {
      to: to ?? "(unset)",
      subject: msg.subject,
    });
    return { ok: true, skipped: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, skipped: false, error: `Resend ${res.status}: ${detail}` };
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
