// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// Observe channel routing by mocking the individual senders. Each returns a
// skipped success, matching real no-op behaviour under mock mode.
const { sendTelegram, sendSlack, sendEmail } = vi.hoisted(() => {
  type SendResult = { ok: boolean; skipped: boolean; error?: string };
  const skipped: SendResult = { ok: true, skipped: true };
  return {
    sendTelegram: vi.fn(
      async (arg: { markdown: string; chatId?: string }): Promise<SendResult> => {
        void arg;
        return skipped;
      },
    ),
    sendSlack: vi.fn(
      async (arg: { markdown: string; channel?: string }): Promise<SendResult> => {
        void arg;
        return skipped;
      },
    ),
    sendEmail: vi.fn(
      async (arg: {
        to: string;
        subject: string;
        html: string;
        text: string;
      }): Promise<SendResult> => {
        void arg;
        return skipped;
      },
    ),
  };
});

vi.mock("./telegram", () => ({ sendTelegram }));
vi.mock("./slack", () => ({ sendSlack }));
vi.mock("./email", () => ({ sendEmail }));

import { dispatchReport, sendCriticalAlert } from "./index";
import { reports, insights } from "@/lib/mock-data";
import { CURRENT_ORG_ID } from "@/lib/config";

const dailyReport = reports.find((r) => r.id === "report_jul_01")!;
const weeklyReport = reports.find((r) => r.id === "report_weekly_jun_22_28")!;
const alertInsight = insights.find((i) => i.id === "insight_refunds_up")!;

beforeEach(() => {
  sendTelegram.mockClear();
  sendSlack.mockClear();
  sendEmail.mockClear();
});

describe("dispatchReport", () => {
  it("sends only to connected+enabled channels (telegram + email, NOT slack)", async () => {
    const result = await dispatchReport(CURRENT_ORG_ID, dailyReport);

    expect(sendTelegram).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    // Slack is not_connected + disabled in the seeded configs.
    expect(sendSlack).not.toHaveBeenCalled();

    expect(result.ok).toBe(true);
    expect(result.results.map((r) => r.channel).sort()).toEqual(["email", "telegram"]);
    expect(result.results.every((r) => r.skipped)).toBe(true);
  });

  it("passes the seeded telegram target and formatted markdown to sendTelegram", async () => {
    await dispatchReport(CURRENT_ORG_ID, dailyReport);

    const arg = sendTelegram.mock.calls[0][0] as { markdown: string; chatId?: string };
    expect(arg.chatId).toBe("@alex on Telegram");
    expect(arg.markdown).toContain(dailyReport.title);
    expect(arg.markdown).toContain("Revenue: $48.2k");
  });

  it("passes the seeded email target and formatted subject/html/text to sendEmail", async () => {
    await dispatchReport(CURRENT_ORG_ID, dailyReport);

    const arg = sendEmail.mock.calls[0][0] as {
      to: string;
      subject: string;
      html: string;
      text: string;
    };
    expect(arg.to).toBe("alex@acme.com");
    expect(arg.subject).toBe(dailyReport.title);
    expect(arg.html).toContain("<h2");
    expect(arg.text).toContain(dailyReport.title);
  });

  it("still dispatches a weekly report (weeklyDigest enabled for Acme)", async () => {
    const result = await dispatchReport(CURRENT_ORG_ID, weeklyReport);
    expect(result.results.map((r) => r.channel).sort()).toEqual(["email", "telegram"]);
    expect(sendTelegram).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("sends nothing for an org with no notification configs (northwind)", async () => {
    const result = await dispatchReport("org_northwind", {
      ...dailyReport,
      orgId: "org_northwind",
    });
    expect(result.ok).toBe(true);
    expect(result.results).toHaveLength(0);
    expect(sendTelegram).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    expect(sendSlack).not.toHaveBeenCalled();
  });

  it("aggregates ok=false when a channel fails", async () => {
    sendEmail.mockResolvedValueOnce({ ok: false, skipped: false, error: "boom" });
    const result = await dispatchReport(CURRENT_ORG_ID, dailyReport);
    expect(result.ok).toBe(false);
    const email = result.results.find((r) => r.channel === "email");
    expect(email?.error).toBe("boom");
  });
});

describe("sendCriticalAlert", () => {
  it("sends the alert to connected+enabled channels when criticalAlerts is on (Acme)", async () => {
    const result = await sendCriticalAlert(CURRENT_ORG_ID, alertInsight);

    expect(sendTelegram).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendSlack).not.toHaveBeenCalled();

    expect(result.ok).toBe(true);
    expect(result.results.map((r) => r.channel).sort()).toEqual(["email", "telegram"]);

    const tgArg = sendTelegram.mock.calls[0][0] as { markdown: string };
    expect(tgArg.markdown).toContain("🚨");
    expect(tgArg.markdown).toContain(alertInsight.title);
  });

  it("suppresses alerts when the org has criticalAlerts disabled (northwind)", async () => {
    const result = await sendCriticalAlert("org_northwind", {
      ...alertInsight,
      orgId: "org_northwind",
    });
    expect(result.ok).toBe(true);
    expect(result.results).toHaveLength(0);
    expect(sendTelegram).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
