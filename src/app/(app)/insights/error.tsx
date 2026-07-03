"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

import { PageHeader, PageShell } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function InsightsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Insights page error:", error);
  }, [error]);

  return (
    <>
      <PageHeader
        title="Insights"
        subtitle="What the AI noticed in yesterday's data — ranked by impact."
      />
      <PageShell>
        <div className="flex w-full flex-col items-center gap-3 rounded-lg border border-border bg-card p-12 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-danger-subtle">
            <AlertTriangle className="size-5 text-danger" aria-hidden />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-foreground">
              Something went wrong
            </h2>
            <p className="text-[13.5px] text-muted-foreground">
              We couldn&apos;t load your insights. Please try again.
            </p>
          </div>
          <Button onClick={reset} variant="outline" size="sm">
            <RotateCw aria-hidden />
            Try again
          </Button>
        </div>
      </PageShell>
    </>
  );
}
