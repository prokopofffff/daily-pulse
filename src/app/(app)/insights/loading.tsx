import { PageHeader, PageShell } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsLoading() {
  return (
    <>
      <PageHeader
        title="Insights"
        subtitle="What the AI noticed in yesterday's data — ranked by impact."
        actions={<Skeleton className="h-9 w-[140px] rounded-md" />}
      />
      <PageShell>
        <div className="flex w-full flex-col gap-[22px]">
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-[18px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-[34px] rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-10 w-full" />
                <div className="flex items-center justify-between border-t border-border pt-2.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-[360px] w-full rounded-lg" />
        </div>
      </PageShell>
    </>
  );
}
