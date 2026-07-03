/**
 * streamAnswer — streaming Q&A over an org's data for the Insights
 * "Ask a question" panel.
 *
 * Returns an async iterable of text token chunks. Uses OpenAI streaming when a
 * key is configured; otherwise streams a deterministic, mocked answer grounded
 * in the seeded metrics. Both paths yield plain-text chunks so the caller can
 * pipe them straight to a text/plain HTTP stream.
 */

import { formatCompact, formatCurrency, formatPercent } from "@/lib/utils";
import { getDashboardMetrics } from "@/lib/data";
import type { Metric } from "@/lib/types";
import { getOpenAI, hasOpenAI, OPENAI_MODEL } from "./client";

const SYSTEM_PROMPT =
  "You are Daily Pulse, an AI executive analyst. Answer the user's question " +
  "about their business using ONLY the metrics provided. Be concise, " +
  "specific, and cite the numbers. If the metrics do not cover the question, " +
  "say so briefly.";

function formatMetricValue(metric: Metric): string {
  switch (metric.format) {
    case "currency":
      return formatCurrency(metric.value);
    case "percent":
      return formatPercent(metric.value);
    case "compact":
      return formatCompact(metric.value);
    default:
      return String(metric.value);
  }
}

function metricsContext(metrics: Metric[]): string {
  return metrics
    .map((m) => {
      const delta =
        m.deltaPct == null ? "" : ` (${m.deltaPct >= 0 ? "+" : ""}${m.deltaPct}%)`;
      return `- ${m.label}: ${formatMetricValue(m)}${delta}`;
    })
    .join("\n");
}

/**
 * Deterministic mock answer built from the seeded metrics. Streamed word by
 * word so the mock UX matches the live streaming experience.
 */
function buildMockAnswer(question: string, metrics: Metric[]): string {
  const byKey = new Map(metrics.map((m) => [m.key, m]));
  const revenue = byKey.get("revenue");
  const newCustomers = byKey.get("new_customers");
  const tickets = byKey.get("support_tickets");
  const critical = byKey.get("critical_issues");

  const q = question.trim();
  const lead = q ? `Here's what the data shows on "${q}". ` : "Here's what the data shows. ";

  const parts: string[] = [];
  if (revenue) {
    const d = revenue.deltaPct == null ? "" : ` (${formatPercent(revenue.deltaPct)})`;
    parts.push(
      `Revenue reached ${formatCurrency(revenue.value)}${d} yesterday — the strongest single day this quarter.`,
    );
  }
  if (newCustomers) {
    parts.push(
      `You added ${newCustomers.value} new customers, the highest single-day signup total in the period.`,
    );
  }
  if (tickets) {
    const d = tickets.deltaPct == null ? "" : ` (${formatPercent(tickets.deltaPct)})`;
    parts.push(`Support volume came in at ${tickets.value} tickets${d}.`);
  }
  if (critical && critical.value > 0) {
    parts.push(
      `Watch the ${critical.value} critical checkout issues flagged overnight — they need action.`,
    );
  }
  if (parts.length === 0) {
    parts.push("I don't have metrics that cover that question yet.");
  }

  return lead + parts.join(" ");
}

/** Split text into streamable word chunks (keeps trailing spaces). */
function toChunks(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [text];
}

async function* mockStream(question: string, metrics: Metric[]): AsyncIterable<string> {
  const answer = buildMockAnswer(question, metrics);
  for (const chunk of toChunks(answer)) {
    yield chunk;
  }
}

/**
 * Stream an answer to `question` for the given org as an async iterable of
 * text chunks. Falls back to a deterministic mock stream when OpenAI is
 * unavailable, and degrades to the mock if a live stream errors mid-flight.
 */
export async function* streamAnswer(
  orgId: string,
  question: string,
): AsyncIterable<string> {
  const metrics = await getDashboardMetrics(orgId);

  if (!hasOpenAI()) {
    yield* mockStream(question, metrics);
    return;
  }

  const client = getOpenAI();
  if (!client) {
    yield* mockStream(question, metrics);
    return;
  }

  try {
    const stream = await client.chat.completions.create({
      model: OPENAI_MODEL,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Metrics:\n${metricsContext(metrics)}\n\nQuestion: ${question}`,
        },
      ],
    });

    for await (const part of stream) {
      const token = part.choices[0]?.delta?.content;
      if (token) yield token;
    }
  } catch {
    yield* mockStream(question, metrics);
  }
}
