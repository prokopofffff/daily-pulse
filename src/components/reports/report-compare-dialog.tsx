"use client";

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

export interface ReportCompareDialogProps {
  reports: [Report, Report] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ReportColumn({ report }: { report: Report }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-row items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {report.title}
          </h3>
          <Badge variant="outline" className="font-semibold">
            {PERIOD_LABEL[report.period]}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatLongDate(report.date)}
        </span>
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-subtle p-4">
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

      <p className="text-[13px] leading-relaxed text-muted-foreground">
        {report.body}
      </p>
    </div>
  );
}

/** Side-by-side comparison of two selected reports. */
export function ReportCompareDialog({
  reports,
  open,
  onOpenChange,
}: ReportCompareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[760px] gap-0 p-0">
        {reports ? (
          <>
            <DialogHeader className="gap-1 border-b border-border p-6">
              <DialogTitle className="text-lg font-semibold text-foreground">
                Compare reports
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {reports[0].title} vs {reports[1].title}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-6 p-6 sm:flex-row">
              <ReportColumn report={reports[0]} />
              <div className="hidden w-px shrink-0 self-stretch bg-border sm:block" />
              <ReportColumn report={reports[1]} />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
