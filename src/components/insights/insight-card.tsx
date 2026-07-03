import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { SENTIMENT_STYLES } from "@/lib/ui/tone";
import type { Insight } from "@/lib/types";

export interface InsightCardProps {
  insight: Insight;
  className?: string;
}

/**
 * Single AI observation card: sentiment tag, confidence, title, body,
 * detection source and an Explore link. Matches the Insights design.
 */
export function InsightCard({ insight, className }: InsightCardProps) {
  const style = SENTIMENT_STYLES[insight.sentiment];
  const Icon = style.icon;
  const confidence = Math.round(insight.confidence * 100);

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-card p-[18px]",
        className,
      )}
    >
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row items-center gap-2.5">
          <div
            className={cn(
              "flex size-[34px] shrink-0 items-center justify-center rounded-md",
              style.tile,
            )}
          >
            <Icon className={cn("size-[18px]", style.text)} aria-hidden />
          </div>
          <span
            className={cn(
              "rounded-full px-[9px] py-1 text-[11.5px] font-semibold",
              style.tile,
              style.text,
            )}
          >
            {style.label}
          </span>
        </div>
        <span className="whitespace-nowrap text-[11.5px] font-medium text-text-tertiary">
          {confidence}% confidence
        </span>
      </div>

      <h3 className="text-[17px] font-semibold leading-snug text-foreground">
        {insight.title}
      </h3>
      <p className="text-[13.5px] leading-5 text-muted-foreground">
        {insight.body}
      </p>

      <div className="mt-1 flex flex-row items-center justify-between border-t border-border pt-2.5">
        <span className="text-xs text-text-tertiary">
          Detected 6:00 AM · Daily Pulse AI
        </span>
        <button
          type="button"
          className="flex flex-row items-center gap-[5px] text-[12.5px] font-semibold text-primary transition-colors hover:text-accent-hover"
        >
          Explore
          <ArrowRight className="size-[13px]" aria-hidden />
        </button>
      </div>
    </article>
  );
}
