import {
  History,
  Sparkles,
  TrendingDown,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { listReports } from "@/lib/data";
import { CURRENT_ORG_ID } from "@/lib/config";
import { TONE_STYLES } from "@/lib/ui/tone";
import type {
  ReportChip,
  ReportChipTone,
  ReportHighlight,
  ReportHighlightIcon,
} from "@/lib/types";

/** Icon key on a highlight → the lucide icon it renders. */
const HIGHLIGHT_ICONS: Record<ReportHighlightIcon, LucideIcon> = {
  alert: TriangleAlert,
  sparkles: Sparkles,
  "trending-down": TrendingDown,
};

/** A chip's tinted background + dot-fill classes, sourced from the tone module. */
function chipStyle(tone: ReportChipTone): { bg: string; dot: string } {
  const { bg, fg } = TONE_STYLES[tone];
  // The dot is a solid fill of the tone's foreground color (`text-*` -> `bg-*`).
  return { bg, dot: fg.replace(/^text-/, "bg-") };
}

/**
 * AI Summary card: narrative recap + insight chips on the left, an "AI INSIGHTS"
 * mini-list on the right. Copy is sourced from the latest daily report
 * (body + chips + highlights) in the data layer.
 */
export async function AiSummaryCard({
  generatedLabel,
}: {
  generatedLabel: string;
}) {
  const reports = await listReports(CURRENT_ORG_ID, "daily");
  const report = reports[0];

  const chips: ReportChip[] = report?.chips ?? [];
  const highlights: ReportHighlight[] = report?.highlights ?? [];

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[16px] border border-border bg-card lg:flex-row">
      <div className="flex flex-1 flex-col gap-[14px] p-5">
        <div className="flex flex-row items-center gap-2.5">
          <div className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-accent">
            <Sparkles className="size-[17px] text-primary" />
          </div>
          <span className="text-base font-semibold text-foreground">
            AI Summary
          </span>
          <div className="flex-1" />
          <span className="inline-flex shrink-0 flex-row items-center gap-1.5 rounded-xl border border-border bg-surface-subtle px-[9px] py-1">
            <History className="size-3 text-text-tertiary" />
            <span className="text-[11.5px] font-medium text-muted-foreground">
              {generatedLabel}
            </span>
          </span>
        </div>

        <p className="text-[14px] leading-[22px] text-muted-foreground">
          {report?.body}
        </p>

        <div className="flex flex-row flex-wrap gap-2">
          {chips.map((chip) => {
            const s = chipStyle(chip.tone);
            return (
              <div
                key={chip.label}
                className={cn(
                  "flex w-fit flex-row items-center gap-1.5 rounded-sm px-[11px] py-1.5",
                  s.bg,
                )}
              >
                <span className={cn("size-[7px] shrink-0 rounded-full", s.dot)} />
                <span className="text-[12.5px] font-medium text-foreground">
                  {chip.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-0.5 border-border bg-surface-subtle p-4 lg:w-[340px] lg:shrink-0 lg:border-l">
        <span className="text-[12px] font-semibold tracking-[0.6px] text-text-tertiary">
          AI INSIGHTS
        </span>
        {highlights.map((row) => {
          const s = TONE_STYLES[row.tone];
          const Icon = HIGHLIGHT_ICONS[row.icon];
          return (
            <div key={row.text} className="flex flex-row gap-2.5 px-1 py-2.5">
              <div
                className={cn(
                  "flex size-[22px] shrink-0 items-center justify-center rounded-[7px]",
                  s.bg,
                )}
              >
                <Icon className={cn("size-[13px]", s.fg)} />
              </div>
              <p className="flex-1 text-[12.5px] leading-[18px] text-muted-foreground">
                {row.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
