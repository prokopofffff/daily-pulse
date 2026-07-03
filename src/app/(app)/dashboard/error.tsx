"use client";

import { useEffect } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";

import { PageHeader, PageShell } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <PageHeader
        title="Good morning, Alex."
        subtitle="Here's how Acme performed yesterday — Wednesday, July 1"
      />
      <PageShell>
        <div className="flex w-full flex-col items-center justify-center gap-4 rounded-[16px] border border-border bg-card px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-danger-subtle">
            <TriangleAlert className="size-6 text-danger" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-foreground">
              We couldn&apos;t load your dashboard
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Something went wrong while fetching yesterday&apos;s summary.
              Please try again.
            </p>
          </div>
          <Button onClick={reset} variant="outline" size="sm">
            <RotateCw className="size-4" />
            Try again
          </Button>
        </div>
      </PageShell>
    </>
  );
}
