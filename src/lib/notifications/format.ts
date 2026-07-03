/**
 * Message formatting for notification channels.
 *
 * Renders a {@link Report} (or a critical {@link Insight}) into channel-shaped
 * payloads: Markdown (Telegram), Slack mrkdwn, plain text, and simple HTML
 * (email). Pure and deterministic — no I/O, no env access.
 */

import type { Insight, Report } from "@/lib/types";

/** A report rendered for every channel we support. */
export interface FormattedReport {
  /** Short subject line, e.g. email subject or push title. */
  subject: string;
  /** Telegram-flavoured Markdown (MarkdownV2-safe subset avoided; uses classic Markdown). */
  markdown: string;
  /** Slack "mrkdwn" body. */
  slack: string;
  /** Plain-text fallback. */
  text: string;
  /** Minimal HTML body for email. */
  html: string;
}

function metricLine(m: Report["metrics"][number]): { text: string; delta: string } {
  const delta =
    m.deltaPct == null
      ? ""
      : `${m.deltaPct >= 0 ? "▲" : "▼"} ${m.deltaPct >= 0 ? "+" : ""}${m.deltaPct}%`;
  return { text: `${m.label}: ${m.value}`, delta };
}

/** Render a report into every channel format. */
export function formatReport(report: Report): FormattedReport {
  const subject = report.title;
  const metrics = report.metrics.map(metricLine);

  const markdown = [
    `*${report.title}*`,
    "",
    report.summary,
    "",
    ...metrics.map((m) => `• ${m.text}${m.delta ? `  ${m.delta}` : ""}`),
    "",
    report.body,
  ]
    .join("\n")
    .trim();

  const slack = [
    `*${report.title}*`,
    report.summary,
    "",
    ...metrics.map((m) => `• ${m.text}${m.delta ? `   ${m.delta}` : ""}`),
    "",
    report.body,
  ]
    .join("\n")
    .trim();

  const text = [
    report.title,
    "".padEnd(report.title.length, "="),
    "",
    report.summary,
    "",
    ...metrics.map((m) => `- ${m.text}${m.delta ? `  (${m.delta})` : ""}`),
    "",
    report.body,
  ]
    .join("\n")
    .trim();

  const html = [
    `<h2 style="margin:0 0 8px;font-family:Inter,Arial,sans-serif;">${escapeHtml(report.title)}</h2>`,
    `<p style="margin:0 0 16px;color:#475569;font-family:Inter,Arial,sans-serif;">${escapeHtml(report.summary)}</p>`,
    `<ul style="margin:0 0 16px;padding-left:18px;font-family:Inter,Arial,sans-serif;">`,
    ...metrics.map(
      (m) =>
        `<li style="margin:0 0 4px;">${escapeHtml(m.text)}${
          m.delta ? ` <span style="color:#64748b;">${escapeHtml(m.delta)}</span>` : ""
        }</li>`,
    ),
    `</ul>`,
    `<p style="margin:0;color:#0f172a;font-family:Inter,Arial,sans-serif;line-height:1.5;">${escapeHtml(
      report.body,
    ).replace(/\n/g, "<br/>")}</p>`,
  ].join("");

  return { subject, markdown, slack, text, html };
}

/** A critical insight rendered for every channel we support. */
export interface FormattedAlert {
  subject: string;
  markdown: string;
  slack: string;
  text: string;
  html: string;
}

/** Render a critical insight into an alert message for every channel. */
export function formatCriticalAlert(insight: Insight): FormattedAlert {
  const subject = `Critical alert: ${insight.title}`;

  const markdown = [`🚨 *${insight.title}*`, "", insight.body].join("\n").trim();

  const slack = [`:rotating_light: *${insight.title}*`, insight.body].join("\n").trim();

  const text = [`[CRITICAL] ${insight.title}`, "", insight.body].join("\n").trim();

  const html = [
    `<h2 style="margin:0 0 8px;color:#dc2626;font-family:Inter,Arial,sans-serif;">🚨 ${escapeHtml(
      insight.title,
    )}</h2>`,
    `<p style="margin:0;color:#0f172a;font-family:Inter,Arial,sans-serif;line-height:1.5;">${escapeHtml(
      insight.body,
    )}</p>`,
  ].join("");

  return { subject, markdown, slack, text, html };
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
