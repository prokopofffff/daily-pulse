// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { POST } from "./route";

const OLD_ENV = { ...process.env };

async function readBody(res: Response): Promise<string> {
  // Prefer streaming read to exercise the ReadableStream path.
  if (res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let out = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) out += decoder.decode(value, { stream: true });
    }
    out += decoder.decode();
    return out;
  }
  return res.text();
}

function post(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/insights/stream", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("insights/stream route", () => {
  beforeEach(() => {
    // Ensure no OpenAI key -> deterministic mock stream path.
    delete process.env.OPENAI_API_KEY;
    process.env = { ...process.env };
  });

  afterEach(() => {
    process.env = { ...OLD_ENV };
  });

  it("streams a non-empty text/plain answer for a sample question", async () => {
    const res = await post({ question: "How did revenue do yesterday?" });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(res.headers.get("Cache-Control")).toBe("no-cache, no-transform");

    const text = await readBody(res);
    expect(text.length).toBeGreaterThan(0);
    // Deterministic mock answer echoes the question and cites seeded revenue.
    expect(text).toContain("How did revenue do yesterday?");
    // Seeded revenue value is 48250 -> formatted as $48,250.
    expect(text).toContain("$48,250");
  });

  it("defaults to CURRENT_ORG_ID when orgId is omitted (org_acme metrics present)", async () => {
    const res = await post({ question: "Give me a summary" });
    expect(res.status).toBe(200);
    const text = await readBody(res);
    // org_acme has seeded metrics -> grounded, non-empty answer.
    expect(text).toContain("Give me a summary");
    expect(text.length).toBeGreaterThan(20);
  });

  it("honors an explicit orgId in the body", async () => {
    const res = await post({
      orgId: "org_acme",
      question: "What about new customers?",
    });
    expect(res.status).toBe(200);
    const text = await readBody(res);
    expect(text).toContain("new customers");
  });

  it("returns 400 for a missing question", async () => {
    const res = await post({ orgId: "org_acme" });
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Missing 'question'");
  });

  it("returns 400 for a blank/whitespace question", async () => {
    const res = await post({ question: "   " });
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid JSON body", async () => {
    const res = await post("{ not valid json");
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Invalid JSON body");
  });

  it("streams gracefully for an org with no metrics (org_northwind)", async () => {
    const res = await post({
      orgId: "org_northwind",
      question: "Any revenue?",
    });
    expect(res.status).toBe(200);
    const text = await readBody(res);
    // No metrics -> the mock fallback line, still non-empty text.
    expect(text.length).toBeGreaterThan(0);
    expect(text).toContain("Any revenue?");
  });
});
