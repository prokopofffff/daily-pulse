import { PageHeader, PageShell } from "@/components/layout/page-header";
import { ReportsTimeline } from "@/components/reports/reports-timeline";
import { CURRENT_ORG_ID } from "@/lib/config";
import { listReports } from "@/lib/data";

export default async function ReportsPage() {
  const initialReports = await listReports(CURRENT_ORG_ID);

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="AI-generated summaries, delivered to your inbox every morning at 6:00 AM."
      />
      <PageShell>
        <ReportsTimeline initialReports={initialReports} />
      </PageShell>
    </>
  );
}
