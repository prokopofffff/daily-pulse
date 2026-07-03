// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/config", () => ({ USE_MOCK: false, CURRENT_ORG_ID: "org_acme" }));

import { sendEmail } from "./email";

const ORIGINAL_ENV = { ...process.env };

function okFetch() {
  return vi.fn(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
}

const baseMsg = {
  to: "alex@acme.com",
  subject: "Daily Pulse",
  html: "<p>hi</p>",
  text: "hi",
};

describe("sendEmail", () => {
  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    process.env = { ...ORIGINAL_ENV };
  });

  it("is a safe no-op that does NOT call fetch when the API key is unset", async () => {
    const fetchSpy = okFetch();
    vi.stubGlobal("fetch", fetchSpy);
    vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await sendEmail(baseMsg);

    expect(result).toEqual({ ok: true, skipped: true });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("no-ops when a key is set but the recipient is not an address", async () => {
    process.env.RESEND_API_KEY = "re_key";
    const fetchSpy = okFetch();
    vi.stubGlobal("fetch", fetchSpy);
    vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await sendEmail({ ...baseMsg, to: "not-an-address" });

    expect(result.skipped).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls the Resend API with auth header and payload when configured", async () => {
    process.env.RESEND_API_KEY = "re_secret";
    const fetchSpy = okFetch();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await sendEmail(baseMsg);

    expect(result).toEqual({ ok: true, skipped: false });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = (fetchSpy as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer re_secret");

    const body = JSON.parse(init.body);
    expect(body.to).toEqual(["alex@acme.com"]);
    expect(body.subject).toBe("Daily Pulse");
    expect(body.html).toBe("<p>hi</p>");
    expect(body.text).toBe("hi");
    // Default sender when EMAIL_FROM is unset and no explicit from.
    expect(body.from).toBe("pulse@dailypulse.app");
  });

  it("uses EMAIL_FROM env and extracts an address from wrapped copy", async () => {
    process.env.RESEND_API_KEY = "re_secret";
    process.env.EMAIL_FROM = "reports@dailypulse.app";
    const fetchSpy = okFetch();
    vi.stubGlobal("fetch", fetchSpy);

    await sendEmail({ ...baseMsg, to: "Alex <alex@acme.com>" });

    const [, init] = (fetchSpy as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.from).toBe("reports@dailypulse.app");
    expect(body.to).toEqual(["alex@acme.com"]);
  });

  it("reports a non-ok HTTP status as an error", async () => {
    process.env.RESEND_API_KEY = "re_secret";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 422 })));

    const result = await sendEmail(baseMsg);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Resend 422");
  });

  it("captures thrown network errors gracefully", async () => {
    process.env.RESEND_API_KEY = "re_secret";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("timeout");
      }),
    );

    const result = await sendEmail(baseMsg);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("timeout");
  });
});
