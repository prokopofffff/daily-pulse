import { PageHeader, PageShell } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Choose where your daily AI report and critical alerts get delivered."
      />
      <PageShell>
        <section className="flex w-full flex-col gap-4">
          <Skeleton className="h-3 w-32 rounded-full" />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex w-full flex-row items-center gap-4 rounded-lg border border-border bg-card p-5"
            >
              <Skeleton className="size-11 shrink-0 rounded-md" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-28 rounded-full" />
                <Skeleton className="h-3 w-40 rounded-full" />
              </div>
              <Skeleton className="h-[26px] w-11 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </section>

        <div className="flex w-full flex-col rounded-lg border border-border bg-card">
          <div className="flex flex-col gap-2 px-5 pb-4 pt-5">
            <Skeleton className="h-4 w-40 rounded-full" />
            <Skeleton className="h-3 w-56 rounded-full" />
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex w-full flex-row items-center gap-4 border-t border-border px-5 py-4"
            >
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-32 rounded-full" />
                <Skeleton className="h-3 w-48 rounded-full" />
              </div>
              <Skeleton className="h-[26px] w-11 rounded-full" />
            </div>
          ))}
        </div>
      </PageShell>
    </>
  );
}
