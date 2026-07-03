"use client";

import { Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Report } from "@/lib/types";

import { ReportMetricChip } from "./report-metric-chip";
import { formatLongDate, isInvertedMetric, PERIOD_LABEL } from "./report-utils";

export interface ReportDetailDialogProps {
  report: Report | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Full report narrative shown when the user clicks "View" on a timeline row. */
export function ReportDetailDialog({
  report,
  open,
  onOpenChange,
}: ReportDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] gap-0 p-0">
        {report ? (
          <>
            <DialogHeader className="gap-2 border-b border-border p-6">
              <div className="flex flex-row items-center gap-2">
                <DialogTitle className="text-lg font-semibold text-foreground">
                  {report.title}
                </DialogTitle>
                <Badge variant="outline" className="font-semibold">
                  {PERIOD_LABEL[report.period]}
                </Badge>
              </div>
              <DialogDescription className="text-sm text-muted-foreground">
                {formatLongDate(report.date)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-5 p-6">
              <div className="flex flex-row flex-wrap gap-8 rounded-md border border-border bg-surface-subtle p-4">
                {report.metrics.map((m) => (
                  <ReportMetricChip
                    key={m.label}
                    label={m.label}
                    value={m.value}
                    deltaPct={m.deltaPct}
                    invert={isInvertedMetric(m.label)}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Sparkles aria-hidden className="size-3.5" />
                  AI summary
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {report.body}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
