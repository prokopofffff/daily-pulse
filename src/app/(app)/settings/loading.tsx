import { PageHeader, PageShell } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";

function RowSkeleton() {
  return (
    <div className="flex flex-col gap-4 border-t border-border p-6 first:border-t-0 md:flex-row md:gap-12">
      <div className="flex w-full shrink-0 flex-col gap-2 md:w-60">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your organization, workspace defaults and branding."
      />
      <PageShell>
        <div className="flex flex-col gap-7">
          <div className="flex flex-col rounded-lg border border-border bg-card">
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </div>
          <div className="flex flex-row items-center justify-end gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </PageShell>
    </>
  );
}
