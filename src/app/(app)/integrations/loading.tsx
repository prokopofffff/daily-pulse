import { PageHeader, PageShell } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";

/** Route-level loading fallback: header + a grid of card skeletons. */
export default function IntegrationsLoading() {
  return (
    <>
      <PageHeader
        title="Integrations"
        subtitle="Connect your data sources so Daily Pulse can summarize what matters."
      />
      <PageShell>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[184px] w-full rounded-lg" />
          ))}
        </div>
      </PageShell>
    </>
  );
}
