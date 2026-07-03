import { PageHeader, PageShell } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <>
      <PageHeader
        title="Good morning, Alex."
        subtitle="Here's how Acme performed yesterday — Wednesday, July 1"
        actions={
          <>
            <Skeleton className="h-9 w-[120px] rounded-[9px]" />
            <Skeleton className="h-9 w-[130px] rounded-[9px]" />
          </>
        }
      />
      <PageShell>
        {/* Metric cards */}
        <div className="flex w-full flex-row flex-wrap gap-[14px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex min-w-[160px] flex-1 flex-col gap-3 rounded-[14px] border border-border bg-card p-4"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-5 w-16 rounded-xl" />
            </div>
          ))}
        </div>

        {/* AI Summary */}
        <div className="flex w-full flex-col overflow-hidden rounded-[16px] border border-border bg-card lg:flex-row">
          <div className="flex flex-1 flex-col gap-[14px] p-5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-[30px] rounded-[9px]" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[80%]" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-40 rounded-sm" />
              <Skeleton className="h-7 w-36 rounded-sm" />
              <Skeleton className="h-7 w-28 rounded-sm" />
            </div>
          </div>
          <div className="flex flex-col gap-3 border-border bg-surface-subtle p-4 lg:w-[340px] lg:shrink-0 lg:border-l">
            <Skeleton className="h-3 w-24" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>

        {/* Charts row 1 */}
        <div className="flex w-full flex-col gap-[14px] lg:h-[236px] lg:flex-row">
          <Skeleton className="h-[236px] flex-1 rounded-[14px] lg:h-full" />
          <Skeleton className="h-[236px] rounded-[14px] lg:h-full lg:w-[320px] lg:shrink-0" />
        </div>

        {/* Charts row 2 */}
        <div className="grid w-full grid-cols-1 gap-[14px] md:grid-cols-3 lg:h-[236px]">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[220px] rounded-[14px] lg:h-full" />
          ))}
        </div>
      </PageShell>
    </>
  );
}
