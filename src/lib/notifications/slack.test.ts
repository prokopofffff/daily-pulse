// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/config", () => ({ USE_MOCK: false, CURRENT_ORG_ID: "org_acme" }));

import { sendSlack } from "./slack";

const ORIGINAL_ENV = { ...process.env };
const WEBHOOK = "https://hooks.slack.com/services/T000/B000/xyz";

function okFetch() {
  return vi.fn(async () => new Response("ok", { status: 200 })) as unknown as typeof fetch;
}

describe("sendSlack", () => {
  beforeEach(() => {
    delete process.env.SLACK_WEBHOOK_URL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    process.env = { ...ORIGINAL_ENV };
  });

  it("is a safe no-op that does NOT call fetch when the webhook is unset", async () => {
    const fetchSpy = okFetch();
    vi.stubGlobal("fetch", fetchSpy);
    vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await sendSlack({ text: "hi" });

    expect(result).toEqual({ ok: true, skipped: true });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts to the env webhook URL with an mrkdwn payload when configured", async () => {
    process.env.SLACK_WEBHOOK_URL = WEBHOOK;
    const fetchSpy = okFetch();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await sendSlack({ text: "*report*" });

    expect(result).toEqual({ ok: true, skipped: false });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = (fetchSpy as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(WEBHOOK);
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body);
    expect(body.text).toBe("*report*");
    expect(body.mrkdwn).toBe(true);
  });

  it("prefers an explicit webhookUrl over the env value", async () => {
    process.env.SLACK_WEBHOOK_URL = WEBHOOK;
    const explicit = "https://hooks.slack.com/services/EXPLICIT";
    const fetchSpy = okFetch();
    vi.stubGlobal("fetch", fetchSpy);

    await sendSlack({ text: "x", webhookUrl: explicit });

    const [url] = (fetchSpy as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(explicit);
  });

  it("reports a non-ok HTTP status as an error", async () => {
    process.env.SLACK_WEBHOOK_URL = WEBHOOK;
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 500 })));

    const result = await sendSlack({ text: "x" });
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Slack 500");
  });

  it("captures thrown network errors gracefully", async () => {
    process.env.SLACK_WEBHOOK_URL = WEBHOOK;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("boom");
      }),
    );

    const result = await sendSlack({ text: "x" });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("boom");
  });
});
