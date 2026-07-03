"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Route error boundary for the Integrations page. */
export default function IntegrationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Integrations page error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center bg-surface-subtle p-8">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-card p-10 text-center">
        <div className="flex size-11 items-center justify-center rounded-md bg-danger-subtle">
          <AlertTriangle className="size-[22px] text-danger" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground">
            We couldn&rsquo;t load your integrations. Please try again.
          </p>
        </div>
        <Button variant="outline" onClick={reset}>
          <RotateCw className="size-3.5" />
          Try again
        </Button>
      </div>
    </div>
  );
}
