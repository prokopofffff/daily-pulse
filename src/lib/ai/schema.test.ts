// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  aiReportOutputSchema,
  aiInsightSchema,
  aiActionSchema,
  insightCategorySchema,
  insightSentimentSchema,
  actionPrioritySchema,
  aiReportJsonSchema,
} from "./schema";
import type { AIReportOutput } from "@/lib/types";

/** A well-formed report that satisfies every constraint. */
function validReport(): AIReportOutput {
  return {
    summary: "Strong day: revenue up 18% on record signups.",
    body: "Revenue climbed to $48,250 driven by 142 new signups.",
    tags: ["Revenue at quarter high", "Checkout errors up 3×", "Signup rate +18%"],
    insights: [
      {
        category: "win",
        sentiment: "positive",
        title: "Revenue increased 18%",
        body: "Best single day this quarter.",
        confidence: 0.94,
      },
      {
        category: "risk",
        sentiment: "watch",
        title: "Refund requests increased",
        body: "Refunds rose 32%.",
        confidence: 0.88,
      },
    ],
    actions: [
      {
        priority: "high",
        title: "Review the checkout error spike",
        body: "Investigate the Stripe webhook timeout.",
        ctaLabel: "Take action",
      },
    ],
  };
}

describe("aiReportOutputSchema", () => {
  it("accepts a well-formed AIReportOutput", () => {
    const parsed = aiReportOutputSchema.safeParse(validReport());
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.summary).toContain("revenue");
      expect(parsed.data.insights).toHaveLength(2);
      expect(parsed.data.actions).toHaveLength(1);
    }
  });

  it("rejects a report missing required top-level keys", () => {
    const bad = { summary: "only a summary" };
    expect(aiReportOutputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an unknown category enum value", () => {
    const report = validReport();
    // @ts-expect-error deliberately invalid enum
    report.insights[0].category = "not_a_category";
    expect(aiReportOutputSchema.safeParse(report).success).toBe(false);
  });

  it("rejects an unknown sentiment enum value", () => {
    const report = validReport();
    // @ts-expect-error deliberately invalid enum
    report.insights[0].sentiment = "furious";
    expect(aiReportOutputSchema.safeParse(report).success).toBe(false);
  });

  it("rejects an invalid action priority", () => {
    const report = validReport();
    // @ts-expect-error deliberately invalid enum
    report.actions[0].priority = "urgent";
    expect(aiReportOutputSchema.safeParse(report).success).toBe(false);
  });

  it("rejects confidence outside the 0..1 range", () => {
    const tooHigh = validReport();
    tooHigh.insights[0].confidence = 1.5;
    expect(aiReportOutputSchema.safeParse(tooHigh).success).toBe(false);

    const tooLow = validReport();
    tooLow.insights[0].confidence = -0.1;
    expect(aiReportOutputSchema.safeParse(tooLow).success).toBe(false);
  });

  it("rejects wrong types (tags must be strings)", () => {
    const report = validReport() as unknown as { tags: unknown };
    report.tags = [1, 2, 3];
    expect(aiReportOutputSchema.safeParse(report).success).toBe(false);
  });

  it("rejects a malformed insight (missing confidence)", () => {
    const bad = {
      category: "win",
      sentiment: "positive",
      title: "t",
      body: "b",
    };
    expect(aiInsightSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a malformed action (missing ctaLabel)", () => {
    const bad = { priority: "high", title: "t", body: "b" };
    expect(aiActionSchema.safeParse(bad).success).toBe(false);
  });
});

describe("enum sub-schemas", () => {
  it("enumerate the expected category values", () => {
    for (const v of [
      "executive_summary",
      "top_issue",
      "recommendation",
      "win",
      "risk",
    ]) {
      expect(insightCategorySchema.safeParse(v).success).toBe(true);
    }
    expect(insightCategorySchema.safeParse("bogus").success).toBe(false);
  });

  it("enumerate the expected sentiment values", () => {
    for (const v of ["positive", "watch", "negative", "opportunity"]) {
      expect(insightSentimentSchema.safeParse(v).success).toBe(true);
    }
  });

  it("enumerate the expected priority values", () => {
    for (const v of ["high", "medium", "low"]) {
      expect(actionPrioritySchema.safeParse(v).success).toBe(true);
    }
  });
});

describe("aiReportJsonSchema", () => {
  it("is a strict OpenAI json_schema mirroring the zod shape", () => {
    expect(aiReportJsonSchema.name).toBe("daily_report");
    expect(aiReportJsonSchema.strict).toBe(true);
    expect(aiReportJsonSchema.schema.additionalProperties).toBe(false);
    expect(aiReportJsonSchema.schema.required).toEqual([
      "summary",
      "body",
      "tags",
      "insights",
      "actions",
    ]);
  });
});
