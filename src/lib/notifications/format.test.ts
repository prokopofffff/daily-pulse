// @vitest-environment node
import { describe, it, expect } from "vitest";

import { formatReport, formatCriticalAlert } from "./format";
import { reports, insights } from "@/lib/mock-data";

const dailyReport = reports.find((r) => r.id === "report_jul_01")!;
const weeklyReport = reports.find((r) => r.id === "report_weekly_jun_22_28")!;
const revenueInsight = insights.find((i) => i.id === "insight_revenue_up")!;

describe("formatReport", () => {
  it("renders every channel into a non-empty message", () => {
    const f = formatReport(dailyReport);
    expect(f.subject.length).toBeGreaterThan(0);
    expect(f.markdown.length).toBeGreaterThan(0);
    expect(f.slack.length).toBeGreaterThan(0);
    expect(f.text.length).toBeGreaterThan(0);
    expect(f.html.length).toBeGreaterThan(0);
  });

  it("uses the report title as the subject", () => {
    const f = formatReport(dailyReport);
    expect(f.subject).toBe("Daily Pulse — July 1");
  });

  it("includes the title, summary and body across text formats", () => {
    const f = formatReport(dailyReport);
    for (const body of [f.markdown, f.slack, f.text]) {
      expect(body).toContain(dailyReport.title);
      expect(body).toContain(dailyReport.summary);
      expect(body).toContain(dailyReport.body);
    }
  });

  it("includes key seeded metric figures with deltas", () => {
    const f = formatReport(dailyReport);
    // Revenue metric: label, value and its +18.2% delta.
    expect(f.markdown).toContain("Revenue: $48.2k");
    expect(f.markdown).toContain("▲ +18.2%");
    // A negative delta renders with the down arrow and no plus sign.
    expect(f.markdown).toContain("Tickets: 63");
    expect(f.markdown).toContain("▼ -14%");
  });

  it("renders slack mrkdwn with bold title and metric bullets", () => {
    const f = formatReport(dailyReport);
    expect(f.slack).toContain(`*${dailyReport.title}*`);
    expect(f.slack).toContain("• New customers: 142");
    expect(f.slack).toContain("+9.2%");
  });

  it("renders the text fallback with an underline rule", () => {
    const f = formatReport(dailyReport);
    const rule = "".padEnd(dailyReport.title.length, "=");
    expect(f.text).toContain(rule);
    expect(f.text).toContain("- Revenue: $48.2k  (▲ +18.2%)");
  });

  it("renders html with heading and metric list", () => {
    const f = formatReport(dailyReport);
    expect(f.html).toContain("<h2");
    expect(f.html).toContain("<ul");
    expect(f.html).toContain("<li");
    expect(f.html).toContain("Revenue: $48.2k");
  });

  it("escapes html-significant characters in the body", () => {
    const f = formatReport({
      ...dailyReport,
      title: "A & B <script>",
      summary: "1 < 2 & 3",
      body: 'quote " and apostrophe \'',
    });
    expect(f.html).toContain("A &amp; B &lt;script&gt;");
    expect(f.html).toContain("1 &lt; 2 &amp; 3");
    expect(f.html).toContain("&quot;");
    expect(f.html).toContain("&#39;");
    // Escaping must not leak raw tags.
    expect(f.html).not.toContain("<script>");
  });

  it("converts newlines in the body to <br/> in html", () => {
    const f = formatReport({ ...dailyReport, body: "line one\nline two" });
    expect(f.html).toContain("line one<br/>line two");
  });

  it("omits the delta segment when deltaPct is null", () => {
    const f = formatReport({
      ...dailyReport,
      metrics: [{ label: "Churn", value: "1.2%", deltaPct: null }],
    });
    expect(f.markdown).toContain("• Churn: 1.2%");
    expect(f.markdown).not.toContain("▲");
    expect(f.markdown).not.toContain("▼");
  });

  it("handles a weekly report", () => {
    const f = formatReport(weeklyReport);
    expect(f.subject).toBe("Weekly digest — Jun 22–28");
    expect(f.markdown).toContain("Revenue: $268k");
  });
});

describe("formatCriticalAlert", () => {
  it("renders a non-empty alert for every channel", () => {
    const f = formatCriticalAlert(revenueInsight);
    expect(f.markdown.length).toBeGreaterThan(0);
    expect(f.slack.length).toBeGreaterThan(0);
    expect(f.text.length).toBeGreaterThan(0);
    expect(f.html.length).toBeGreaterThan(0);
  });

  it("prefixes the subject and marks the message as critical", () => {
    const f = formatCriticalAlert(revenueInsight);
    expect(f.subject).toBe(`Critical alert: ${revenueInsight.title}`);
    expect(f.markdown).toContain("🚨");
    expect(f.markdown).toContain(revenueInsight.title);
    expect(f.markdown).toContain(revenueInsight.body);
    expect(f.slack).toContain(":rotating_light:");
    expect(f.text).toContain("[CRITICAL]");
    expect(f.html).toContain("#dc2626");
  });

  it("escapes html in the alert body", () => {
    const f = formatCriticalAlert({ ...revenueInsight, title: "<b>x</b>" });
    expect(f.html).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(f.html).not.toContain("<b>x</b>");
  });
});
