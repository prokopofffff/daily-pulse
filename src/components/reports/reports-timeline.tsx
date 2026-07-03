"use client";

import { useState } from "react";
import { ArrowRight, Check, GitCompareArrows, Loader2, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenerateReport, useReportSearch, useReports } from "@/hooks/use-reports";
import type { Report, ReportPeriod } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ReportCompareDialog } from "./report-compare-dialog";
import { ReportDetailDialog } from "./report-detail-dialog";
import { ReportMetricChip } from "./report-metric-chip";
import {
  formatDow,
  formatShortDate,
  isInvertedMetric,
  PERIOD_LABEL,
} from "./report-utils";

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export interface ReportsTimelineProps {
  initialReports: Report[];
}

export function ReportsTimeline({ initialReports }: ReportsTimelineProps) {
  const [period, setPeriod] = useState<ReportPeriod>("daily");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Report | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [comparePair, setComparePair] = useState<[Report, Report] | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  const trimmed = query.trim();
  const searching = trimmed.length > 0;

  const listQuery = useReports(period, undefined);
  const searchQuery = useReportSearch(trimmed, undefined);

  const reports: Report[] = searching
    ? (searchQuery.data ?? [])
    : (listQuery.data ?? (period === "daily" ? initialReports.filter((r) => r.period === "daily") : []));

  const generate = useGenerateReport();

  function handleView(report: Report) {
    setDetail(report);
    setDetailOpen(true);
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  function openCompare() {
    const [a, b] = selected;
    const byId = new Map(reports.map((r) => [r.id, r]));
    const ra = byId.get(a);
    const rb = byId.get(b);
    if (ra && rb) {
      setComparePair([ra, rb]);
      setCompareOpen(true);
    }
  }

  function exitCompare() {
    setCompareMode(false);
    setSelected([]);
  }

  async function handleGenerate() {
    if (generate.isPending) return;
    try {
      const result = await generate.mutateAsync();
      toast.success("Report generated", {
        description: result.dispatched
          ? "Your new daily report was created and delivered."
          : "Your new daily report was created.",
      });
    } catch {
      toast.error("Couldn't generate report", {
        description: "Something went wrong. Please try again.",
      });
    }
  }

  const isLoading = searching ? searchQuery.isPending : listQuery.isPending;
  const isEmpty = !isLoading && reports.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Controls row: tabs + search + compare + new report */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs
          value={period}
          onValueChange={(v) => {
            setPeriod(v as ReportPeriod);
            setQuery("");
            exitCompare();
          }}
        >
          <TabsList>
            {PERIODS.map((p) => (
              <TabsTrigger key={p.value} value={p.value}>
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-row items-center gap-2.5">
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-text-tertiary"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reports"
              aria-label="Search reports"
              className="h-9 w-[200px] pl-8"
            />
          </div>

          {compareMode ? (
            <>
              <Button
                variant="default"
                size="sm"
                disabled={selected.length !== 2}
                onClick={openCompare}
              >
                Compare ({selected.length}/2)
              </Button>
              <Button variant="ghost" size="sm" onClick={exitCompare}>
                <X aria-hidden />
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompareMode(true)}
            >
              <GitCompareArrows aria-hidden />
              Compare days
            </Button>
          )}

          <Button size="sm" onClick={handleGenerate} disabled={generate.isPending}>
            {generate.isPending ? (
              <Loader2 aria-hidden className="animate-spin" />
            ) : (
              <Plus aria-hidden />
            )}
            New report
          </Button>
        </div>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <TimelineLoading />
      ) : isEmpty ? (
        <EmptyState searching={searching} period={period} />
      ) : (
        <div className="flex flex-col">
          {reports.map((report, i) => {
            const isSelected = selected.includes(report.id);
            const isLast = i === reports.length - 1;
            return (
              <div
                key={report.id}
                className="flex flex-row items-start gap-4 pb-[22px] last:pb-0"
              >
                {/* Date column */}
                <div className="flex w-[56px] shrink-0 flex-col items-end gap-px py-1">
                  <span className="text-[15px] font-bold text-foreground">
                    {formatShortDate(report.date)}
                  </span>
                  <span className="text-xs font-medium text-text-tertiary">
                    {formatDow(report.date)}
                  </span>
                </div>

                {/* Timeline marker */}
                <div className="flex w-4 shrink-0 flex-col items-center self-stretch">
                  <div
                    className={cn(
                      "size-[11px] shrink-0 rounded-full border-2 bg-card",
                      isSelected ? "border-primary" : "border-border-strong",
                    )}
                  />
                  {!isLast ? (
                    <div className="w-0.5 flex-1 bg-border" />
                  ) : null}
                </div>

                {/* Card */}
                <button
                  type="button"
                  onClick={
                    compareMode
                      ? () => toggleSelected(report.id)
                      : () => handleView(report)
                  }
                  className={cn(
                    "flex flex-1 flex-col items-start gap-3 rounded-[14px] border bg-card p-[18px] text-left transition-colors",
                    compareMode
                      ? "cursor-pointer hover:border-border-strong"
                      : "hover:border-border-strong",
                    isSelected
                      ? "border-primary ring-1 ring-primary/40"
                      : "border-border",
                  )}
                >
                  <div className="flex w-full flex-row items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-row items-center gap-2.5">
                      {compareMode ? (
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-[5px] border",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border-strong bg-card",
                          )}
                        >
                          {isSelected ? (
                            <Check aria-hidden className="size-3" />
                          ) : null}
                        </span>
                      ) : null}
                      <span className="truncate text-[15px] font-semibold text-foreground">
                        {report.title}
                      </span>
                      <Badge variant="outline" className="shrink-0 font-semibold">
                        {PERIOD_LABEL[report.period]}
                      </Badge>
                    </div>

                    {!compareMode ? (
                      <span className="flex shrink-0 flex-row items-center gap-1.5 rounded-sm border border-border-strong px-3 py-1.5 text-[12.5px] font-medium text-foreground">
                        View
                        <ArrowRight aria-hidden className="size-[13px] text-muted-foreground" />
                      </span>
                    ) : null}
                  </div>

                  <p className="w-full text-[13.5px] leading-5 text-muted-foreground">
                    {report.summary}
                  </p>

                  <div className="flex w-full flex-row flex-wrap gap-5 border-t border-border pt-2.5">
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
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ReportDetailDialog
        report={detail}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <ReportCompareDialog
        reports={comparePair}
        open={compareOpen}
        onOpenChange={setCompareOpen}
      />
    </div>
  );
}

function TimelineLoading() {
  return (
    <div className="flex flex-col gap-[22px]">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-row items-start gap-4">
          <div className="flex w-[56px] shrink-0 flex-col items-end gap-1.5 py-1">
            <div className="h-4 w-10 animate-pulse rounded bg-muted" />
            <div className="h-3 w-8 animate-pulse rounded bg-muted" />
          </div>
          <div className="w-4 shrink-0">
            <div className="size-[11px] rounded-full bg-muted" />
          </div>
          <div className="h-[124px] flex-1 animate-pulse rounded-[14px] bg-muted" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  searching,
  period,
}: {
  searching: boolean;
  period: ReportPeriod;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-border bg-card px-6 py-16 text-center">
      <p className="text-sm font-semibold text-foreground">
        {searching ? "No matching reports" : `No ${period} reports yet`}
      </p>
      <p className="max-w-[320px] text-[13px] text-muted-foreground">
        {searching
          ? "Try a different search term or clear the search."
          : "Reports are generated automatically each morning at 6:00 AM, or create one now with New report."}
      </p>
    </div>
  );
}
