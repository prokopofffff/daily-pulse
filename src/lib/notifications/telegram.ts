/**
 * Telegram delivery via the Bot API (sendMessage).
 *
 * Guarded by TELEGRAM_BOT_TOKEN + a chat id. When unset (or in mock mode)
 * this is a no-op that logs the payload and reports success, so the app runs
 * end-to-end without credentials.
 */

import { USE_MOCK } from "@/lib/config";

/** Result of an attempted channel send. */
export interface SendResult {
  ok: boolean;
  /** True when no real network call was made (missing creds / mock mode). */
  skipped: boolean;
  /** Present when ok === false. */
  error?: string;
}

export interface TelegramMessage {
  /** Markdown-formatted body. */
  markdown: string;
  /** Overrides the env chat id (e.g. a per-config target). */
  chatId?: string;
}

function resolveChatId(explicit?: string): string | undefined {
  const raw = explicit ?? process.env.TELEGRAM_CHAT_ID;
  if (!raw) return undefined;
  // Targets are stored as human strings like "@alex on Telegram" — extract the
  // @handle / numeric id when present, otherwise pass through.
  const handle = raw.match(/@[\w]+/)?.[0];
  return handle ?? raw;
}

/** Send a Markdown message to a Telegram chat. Safe when unconfigured. */
export async function sendTelegram(msg: TelegramMessage): Promise<SendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = resolveChatId(msg.chatId);

  if (USE_MOCK || !token || !chatId) {
    console.log("[notifications:telegram] (mock/no-op) would send:", {
      chatId: chatId ?? "(unset)",
      preview: msg.markdown.slice(0, 120),
    });
    return { ok: true, skipped: true };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const post = (parseMode?: "Markdown") =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg.markdown,
        ...(parseMode ? { parse_mode: parseMode } : {}),
        disable_web_page_preview: true,
      }),
    });

  try {
    const res = await post("Markdown");
    if (res.ok) return { ok: true, skipped: false };

    // Telegram rejects messages with unbalanced Markdown (a stray * _ ` [ in the
    // AI-generated text) with HTTP 400. Rather than drop the daily pulse, retry
    // once as plain text so the message still gets delivered (without styling).
    if (res.status === 400) {
      const retry = await post(undefined);
      if (retry.ok) return { ok: true, skipped: false };
      const detail = await retry.text().catch(() => "");
      return { ok: false, skipped: false, error: `Telegram ${retry.status}: ${detail}` };
    }

    const detail = await res.text().catch(() => "");
    return { ok: false, skipped: false, error: `Telegram ${res.status}: ${detail}` };
  } catch (err) {
    return {
      ok: false,
      skipped: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
