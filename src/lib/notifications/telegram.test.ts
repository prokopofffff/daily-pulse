// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Force non-mock mode so the real fetch path is reachable when creds are set.
vi.mock("@/lib/config", () => ({ USE_MOCK: false, CURRENT_ORG_ID: "org_acme" }));

import { sendTelegram } from "./telegram";

const ORIGINAL_ENV = { ...process.env };

function okFetch() {
  return vi.fn(async () =>
    new Response("ok", { status: 200 }),
  ) as unknown as typeof fetch;
}

describe("sendTelegram", () => {
  beforeEach(() => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    process.env = { ...ORIGINAL_ENV };
  });

  it("is a safe no-op that does NOT call fetch when token is unset", async () => {
    const fetchSpy = okFetch();
    vi.stubGlobal("fetch", fetchSpy);
    vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await sendTelegram({ markdown: "hi", chatId: "@alex" });

    expect(result).toEqual({ ok: true, skipped: true });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("no-ops when a token is set but no chat id can be resolved", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "bot-token";
    const fetchSpy = okFetch();
    vi.stubGlobal("fetch", fetchSpy);
    vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await sendTelegram({ markdown: "hi" });

    expect(result.skipped).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls fetch with the Bot API URL and a Markdown payload when configured", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "bot-token-123";
    const fetchSpy = okFetch();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await sendTelegram({ markdown: "*hello*", chatId: "@alex on Telegram" });

    expect(result).toEqual({ ok: true, skipped: false });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = (fetchSpy as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://api.telegram.org/botbot-token-123/sendMessage");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(init.body);
    // "@alex on Telegram" -> handle extracted.
    expect(body.chat_id).toBe("@alex");
    expect(body.text).toBe("*hello*");
    expect(body.parse_mode).toBe("Markdown");
    expect(body.disable_web_page_preview).toBe(true);
  });

  it("falls back to TELEGRAM_CHAT_ID env when no explicit chatId is given", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "tok";
    process.env.TELEGRAM_CHAT_ID = "123456";
    const fetchSpy = okFetch();
    vi.stubGlobal("fetch", fetchSpy);

    await sendTelegram({ markdown: "x" });

    const [, init] = (fetchSpy as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(JSON.parse(init.body).chat_id).toBe("123456");
  });

  it("reports a non-ok HTTP status as an error", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "tok";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("bad", { status: 400 })),
    );

    const result = await sendTelegram({ markdown: "x", chatId: "@a" });
    expect(result.ok).toBe(false);
    expect(result.skipped).toBe(false);
    expect(result.error).toContain("Telegram 400");
  });

  it("retries as plain text (no parse_mode) when Markdown parsing 400s, so it still delivers", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "tok";
    // First attempt (parse_mode: Markdown) 400s on unbalanced markup; the
    // plain-text retry succeeds.
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(new Response("can't parse entities", { status: 400 }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await sendTelegram({ markdown: "oops *unbalanced", chatId: "@a" });

    expect(result).toEqual({ ok: true, skipped: false });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    // First call carried parse_mode; the retry dropped it.
    expect(JSON.parse(fetchSpy.mock.calls[0][1].body).parse_mode).toBe("Markdown");
    expect(JSON.parse(fetchSpy.mock.calls[1][1].body).parse_mode).toBeUndefined();
  });

  it("captures thrown network errors gracefully", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "tok";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    const result = await sendTelegram({ markdown: "x", chatId: "@a" });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("network down");
  });
});
