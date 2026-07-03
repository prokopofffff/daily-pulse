"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { PageHeader, PageShell } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Surface the error for debugging.
    console.error(error);
  }, [error]);

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your organization, workspace defaults and branding."
      />
      <PageShell>
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-danger-subtle text-danger">
            <AlertTriangle className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-foreground">
              Couldn&apos;t load settings
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Something went wrong while loading your organization settings.
              Please try again.
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
