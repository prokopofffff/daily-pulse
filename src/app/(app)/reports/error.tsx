"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { PageHeader, PageShell } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function ReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Reports page error:", error);
  }, [error]);

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="AI-generated summaries, delivered to your inbox every morning at 6:00 AM."
      />
      <PageShell>
        <div className="flex flex-col items-center justify-center gap-3 rounded-[14px] border border-border bg-card px-6 py-16 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-danger-subtle text-danger">
            <AlertTriangle aria-hidden className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">
              Couldn&apos;t load your reports
            </p>
            <p className="max-w-[360px] text-[13px] text-muted-foreground">
              Something went wrong while loading your report timeline. Please try
              again.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            Try again
          </Button>
        </div>
      </PageShell>
    </>
  );
}
