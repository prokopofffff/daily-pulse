import { PageHeader, PageShell } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="AI-generated summaries, delivered to your inbox every morning at 6:00 AM."
      />
      <PageShell>
        <div className="flex flex-col gap-6">
          {/* Controls row */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-9 w-[220px] rounded-[10px]" />
            <div className="flex flex-row items-center gap-2.5">
              <Skeleton className="h-9 w-[200px]" />
              <Skeleton className="h-8 w-[130px]" />
              <Skeleton className="h-8 w-[110px]" />
            </div>
          </div>

          {/* Timeline rows */}
          <div className="flex flex-col gap-[22px]">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-row items-start gap-4">
                <div className="flex w-[56px] shrink-0 flex-col items-end gap-1.5 py-1">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="w-4 shrink-0">
                  <Skeleton className="size-[11px] rounded-full" />
                </div>
                <Skeleton className="h-[124px] flex-1 rounded-[14px]" />
              </div>
            ))}
          </div>
        </div>
      </PageShell>
    </>
  );
}
