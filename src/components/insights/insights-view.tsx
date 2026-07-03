"use client";

import { AlertTriangle } from "lucide-react";

import { useInsights, useRecommendedActions } from "@/hooks/use-insights";
import { Skeleton } from "@/components/ui/skeleton";
import type { Insight, RecommendedAction } from "@/lib/types";

import { InsightCard } from "./insight-card";
import { RecommendedActions } from "./recommended-actions";

export interface InsightsViewProps {
  /** Server-fetched initial data used as React Query placeholder data. */
  initialInsights: Insight[];
  initialActions: RecommendedAction[];
}

/**
 * Client view for the Insights page. Reads live data via React Query (seeded
 * with the server-fetched initial data) and renders the insight grid plus the
 * recommended-actions card.
 */
export function InsightsView({
  initialInsights,
  initialActions,
}: InsightsViewProps) {
  const insightsQuery = useInsights();
  const actionsQuery = useRecommendedActions();

  const insights = insightsQuery.data ?? initialInsights;
  const actions = actionsQuery.data ?? initialActions;

  return (
    <div className="flex w-full flex-col gap-[22px]">
      <InsightGrid
        insights={insights}
        isLoading={insightsQuery.isLoading && insights.length === 0}
        isError={insightsQuery.isError && insights.length === 0}
      />

      {actionsQuery.isLoading && actions.length === 0 ? (
        <Skeleton className="h-[360px] w-full rounded-lg" />
      ) : (
        <RecommendedActions actions={actions} />
      )}
    </div>
  );
}

function InsightGrid({
  insights,
  isLoading,
  isError,
}: {
  insights: Insight[];
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[168px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-10 text-center">
        <AlertTriangle className="size-5 text-warning" aria-hidden />
        <p className="text-sm font-medium text-foreground">
          Couldn&apos;t load insights
        </p>
        <p className="text-[13px] text-muted-foreground">
          Please try again in a moment.
        </p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-10 text-center">
        <p className="text-sm font-medium text-foreground">No insights yet</p>
        <p className="text-[13px] text-muted-foreground">
          Your next daily report will surface what the AI notices.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
}
