// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { streamAnswer } from "./stream-insights";

// Never let a real OpenAI client be constructed.
const createSpy = vi.fn();
vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: createSpy } };
  },
}));

beforeEach(() => {
  createSpy.mockReset();
});

/** Drain an async iterable of string chunks into an array. */
async function collect(iter: AsyncIterable<string>): Promise<string[]> {
  const out: string[] = [];
  for await (const chunk of iter) out.push(chunk);
  return out;
}

describe("streamAnswer — mock stream", () => {
  it("yields multiple chunks that concatenate into a non-empty grounded answer", async () => {
    const chunks = await collect(
      streamAnswer("org_acme", "How did revenue do?"),
    );
    expect(chunks.length).toBeGreaterThan(1);
    const answer = chunks.join("");
    expect(answer.length).toBeGreaterThan(0);
    // The mock echoes the question and grounds the answer in seeded metrics.
    expect(answer).toContain("How did revenue do?");
    expect(answer).toContain("$48,250");
    expect(answer).toContain("142 new customers");
    expect(answer).toContain("63 tickets");
    expect(answer).toContain("2 critical checkout issues");
  });

  it("never triggers an OpenAI call in mock mode", async () => {
    await collect(streamAnswer("org_acme", "anything"));
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("is deterministic for the same input", async () => {
    const a = (await collect(streamAnswer("org_acme", "q"))).join("");
    const b = (await collect(streamAnswer("org_acme", "q"))).join("");
    expect(a).toBe(b);
  });

  it("handles an empty question with a generic lead", async () => {
    const answer = (await collect(streamAnswer("org_acme", ""))).join("");
    expect(answer).toContain("Here's what the data shows.");
    expect(answer).toContain("$48,250");
  });

  it("cites the revenue delta as a signed percent", async () => {
    const answer = (await collect(streamAnswer("org_acme", "rev"))).join("");
    expect(answer).toContain("+18.2%");
  });

  it("stays grounded (no coverage) for an org with no seeded metrics", async () => {
    const answer = (
      await collect(streamAnswer("org_northwind", "revenue?"))
    ).join("");
    expect(answer).toContain("I don't have metrics that cover that question yet.");
  });
});

describe("streamAnswer — live path (mocked client)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  async function loadWithLiveClient(create: ReturnType<typeof vi.fn>) {
    vi.doMock("./client", () => ({
      OPENAI_MODEL: "gpt-4o-mini",
      hasOpenAI: () => true,
      getOpenAI: () => ({ chat: { completions: { create } } }),
    }));
    const mod = await import("./stream-insights");
    return mod.streamAnswer;
  }

  it("relays streamed token deltas from the model", async () => {
    async function* fakeStream() {
      yield { choices: [{ delta: { content: "Revenue " } }] };
      yield { choices: [{ delta: { content: "is " } }] };
      yield { choices: [{ delta: {} }] }; // no content -> skipped
      yield { choices: [{ delta: { content: "up." } }] };
    }
    const create = vi.fn().mockResolvedValue(fakeStream());
    const stream = await loadWithLiveClient(create);
    const answer = (await collect(stream("org_acme", "rev?"))).join("");
    expect(answer).toBe("Revenue is up.");
    expect(create).toHaveBeenCalledOnce();
  });

  it("degrades to the mock stream when the live call throws", async () => {
    const create = vi.fn().mockRejectedValue(new Error("boom"));
    const stream = await loadWithLiveClient(create);
    const answer = (await collect(stream("org_acme", "rev?"))).join("");
    expect(answer).toContain("$48,250");
  });
});
