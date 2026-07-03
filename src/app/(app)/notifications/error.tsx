"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { PageHeader, PageShell } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function NotificationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Notifications page error:", error);
  }, [error]);

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Choose where your daily AI report and critical alerts get delivered."
      />
      <PageShell>
        <div className="flex w-full flex-col items-start gap-4 rounded-lg border border-border bg-card p-8">
          <div className="flex size-11 items-center justify-center rounded-md border border-border bg-danger-subtle">
            <AlertTriangle className="size-5 text-danger" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-foreground">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t load your notification settings. Please try again.
            </p>
          </div>
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        </div>
      </PageShell>
    </>
  );
}
