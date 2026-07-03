/**
 * Zod schema for the structured JSON the model must return when generating a
 * daily report. Mirrors `AIReportOutput` in @/lib/types and is used both for
 * runtime validation (parse the model output) and to build the JSON schema
 * passed to OpenAI via response_format.
 */

import { z } from "zod";
import type { AIReportOutput } from "@/lib/types";

export const insightCategorySchema = z.enum([
  "executive_summary",
  "top_issue",
  "recommendation",
  "win",
  "risk",
]);

export const insightSentimentSchema = z.enum([
  "positive",
  "watch",
  "negative",
  "opportunity",
]);

export const actionPrioritySchema = z.enum(["high", "medium", "low"]);

export const aiInsightSchema = z.object({
  category: insightCategorySchema,
  sentiment: insightSentimentSchema,
  title: z.string(),
  body: z.string(),
  confidence: z.number().min(0).max(1),
});

export const aiActionSchema = z.object({
  priority: actionPrioritySchema,
  title: z.string(),
  body: z.string(),
  ctaLabel: z.string(),
});

export const aiReportOutputSchema = z.object({
  summary: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  insights: z.array(aiInsightSchema),
  actions: z.array(aiActionSchema),
});

// Compile-time guarantee that the schema stays in sync with the domain type.
type _Assert = z.infer<typeof aiReportOutputSchema> extends AIReportOutput
  ? AIReportOutput extends z.infer<typeof aiReportOutputSchema>
    ? true
    : never
  : never;
const _assert: _Assert = true;
void _assert;

/**
 * JSON Schema for OpenAI structured outputs (response_format: json_schema).
 * `additionalProperties: false` + all keys required per OpenAI's strict mode.
 */
export const aiReportJsonSchema = {
  name: "daily_report",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["summary", "body", "tags", "insights", "actions"],
    properties: {
      summary: { type: "string" },
      body: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      insights: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["category", "sentiment", "title", "body", "confidence"],
          properties: {
            category: {
              type: "string",
              enum: [
                "executive_summary",
                "top_issue",
                "recommendation",
                "win",
                "risk",
              ],
            },
            sentiment: {
              type: "string",
              enum: ["positive", "watch", "negative", "opportunity"],
            },
            title: { type: "string" },
            body: { type: "string" },
            confidence: { type: "number" },
          },
        },
      },
      actions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["priority", "title", "body", "ctaLabel"],
          properties: {
            priority: { type: "string", enum: ["high", "medium", "low"] },
            title: { type: "string" },
            body: { type: "string" },
            ctaLabel: { type: "string" },
          },
        },
      },
    },
  },
} as const;
