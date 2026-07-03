// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateDailyReport, buildMockReport } from "./generate-report";
import { aiReportOutputSchema } from "./schema";
import { getDashboardMetrics } from "@/lib/data";

// Guard against any accidental network call: the OpenAI module is mocked so a
// real client can never be constructed or invoked during these tests.
const createSpy = vi.fn();
vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: createSpy } };
  },
}));

beforeEach(() => {
  createSpy.mockReset();
});

describe("buildMockReport", () => {
  it("produces a schema-valid deterministic report", async () => {
    const metrics = await getDashboardMetrics("org_acme");
    const report = buildMockReport(metrics);
    expect(aiReportOutputSchema.safeParse(report).success).toBe(true);
  });

  it("grounds the copy in the seeded org_acme metrics", async () => {
    const metrics = await getDashboardMetrics("org_acme");
    const report = buildMockReport(metrics);

    expect(report.summary).toContain("revenue up 18%");
    expect(report.body).toContain("$48,250");
    expect(report.body).toContain("142 new customer signups");
    expect(report.tags).toEqual([
      "Revenue at quarter high",
      "Checkout errors up 3×",
      "Signup rate +18%",
    ]);
  });

  it("is fully deterministic (stable across calls)", async () => {
    const metrics = await getDashboardMetrics("org_acme");
    expect(buildMockReport(metrics)).toEqual(buildMockReport(metrics));
  });

  it("includes ranked insights and prioritized actions", async () => {
    const metrics = await getDashboardMetrics("org_acme");
    const report = buildMockReport(metrics);
    expect(report.insights.length).toBeGreaterThanOrEqual(1);
    expect(report.actions.length).toBeGreaterThanOrEqual(1);
    expect(report.actions[0].priority).toBe("high");
    for (const i of report.insights) {
      expect(i.confidence).toBeGreaterThanOrEqual(0);
      expect(i.confidence).toBeLessThanOrEqual(1);
    }
  });
});

describe("generateDailyReport — mock / no-key mode", () => {
  it("returns a schema-valid report without any OpenAI call", async () => {
    const report = await generateDailyReport("org_acme");
    expect(aiReportOutputSchema.safeParse(report).success).toBe(true);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("matches buildMockReport for the same seeded org", async () => {
    const metrics = await getDashboardMetrics("org_acme");
    const report = await generateDailyReport("org_acme");
    expect(report).toEqual(buildMockReport(metrics));
  });

  it("returns the deterministic seeded summary/body for org_acme", async () => {
    const report = await generateDailyReport("org_acme");
    expect(report.summary).toBe(
      "Strong day: revenue up 18% on record signups. 2 checkout issues flagged for review.",
    );
    expect(report.body).toContain("$48,250");
  });
});

describe("generateDailyReport — live path (mocked client)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  async function loadWithLiveClient(create: ReturnType<typeof vi.fn>) {
    vi.doMock("./client", () => ({
      OPENAI_MODEL: "gpt-4o-mini",
      hasOpenAI: () => true,
      getOpenAI: () => ({ chat: { completions: { create } } }),
    }));
    const mod = await import("./generate-report");
    return mod.generateDailyReport;
  }

  it("parses and returns a valid model response", async () => {
    const good = {
      summary: "s",
      body: "b",
      tags: ["a"],
      insights: [
        {
          category: "win",
          sentiment: "positive",
          title: "t",
          body: "b",
          confidence: 0.5,
        },
      ],
      actions: [
        { priority: "high", title: "t", body: "b", ctaLabel: "Review" },
      ],
    };
    const create = vi.fn().mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(good) } }],
    });
    const gen = await loadWithLiveClient(create);
    const report = await gen("org_acme");
    expect(report.summary).toBe("s");
    expect(create).toHaveBeenCalledOnce();
  });

  it("degrades to the mock when the model returns malformed JSON output", async () => {
    const create = vi.fn().mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ summary: "only" }) } }],
    });
    const gen = await loadWithLiveClient(create);
    const report = await gen("org_acme");
    expect(report.summary).toContain("revenue up 18%");
  });

  it("degrades to the mock when the live call throws", async () => {
    const create = vi.fn().mockRejectedValue(new Error("network down"));
    const gen = await loadWithLiveClient(create);
    const report = await gen("org_acme");
    expect(aiReportOutputSchema.safeParse(report).success).toBe(true);
    expect(report.body).toContain("$48,250");
  });
});
