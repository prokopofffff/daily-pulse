"use client";

import { ArrowRight, ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAcknowledgeAction } from "@/hooks/use-insights";
import { cn } from "@/lib/utils";
import { PRIORITY_STYLES } from "@/lib/ui/tone";
import type { RecommendedAction } from "@/lib/types";

/**
 * CTA labels rendered with the filled (primary) button. Any other label uses
 * the outline variant. Derived from the stable `ctaLabel` field rather than a
 * fragile inline string comparison — behavior is identical to the previous
 * `ctaLabel.toLowerCase() === "take action"` check (priority alone can't drive
 * this: both current "high" actions differ, "Take action" vs "Review").
 */
const PRIMARY_CTA_LABELS = new Set(["take action"]);

function ctaVariant(ctaLabel: string): "default" | "outline" {
  return PRIMARY_CTA_LABELS.has(ctaLabel.toLowerCase()) ? "default" : "outline";
}

export interface RecommendedActionsProps {
  actions: RecommendedAction[];
  className?: string;
}

/**
 * Prioritized "Recommended actions" card: header + a list of rows, each with a
 * priority pill, title/body and a CTA button ("Take action" / "Review").
 */
export function RecommendedActions({
  actions,
  className,
}: RecommendedActionsProps) {
  const acknowledge = useAcknowledgeAction();

  return (
    <section
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-lg border border-border bg-card",
        className,
      )}
    >
      <div className="flex flex-row items-center gap-2.5 border-b border-border bg-surface-subtle px-[18px] py-4">
        <div className="flex size-[30px] shrink-0 items-center justify-center rounded-md bg-primary">
          <ListChecks className="size-[17px] text-primary-foreground" aria-hidden />
        </div>
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold leading-tight text-foreground">
            Recommended actions
          </h2>
          <p className="text-[12.5px] text-muted-foreground">
            Prioritized by the AI based on today&apos;s observations
          </p>
        </div>
      </div>

      <ul className="flex flex-col">
        {actions.map((action, index) => {
          const priority = PRIORITY_STYLES[action.priority];
          const variant = ctaVariant(action.ctaLabel);

          return (
            <li
              key={action.id}
              className={cn(
                "flex flex-row items-center gap-3.5 px-[18px] py-[15px]",
                index < actions.length - 1 && "border-b border-border",
              )}
            >
              <div className="w-[66px] shrink-0">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
                    priority.pill,
                  )}
                >
                  {priority.label}
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <h3 className="text-sm font-semibold text-foreground">
                  {action.title}
                </h3>
                <p className="text-[13px] leading-[19px] text-muted-foreground">
                  {action.body}
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant={variant}
                className="shrink-0"
                disabled={acknowledge.isPending}
                onClick={() => acknowledge.mutate(action.id)}
              >
                {action.ctaLabel}
                <ArrowRight aria-hidden />
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
