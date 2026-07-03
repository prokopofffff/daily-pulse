import { PageHeader, PageShell } from "@/components/layout/page-header";
import {
  getCurrentUser,
  getDashboardMetrics,
  getDashboardSeries,
  getOrganization,
} from "@/lib/data";
import { CURRENT_ORG_ID } from "@/lib/config";
import { userFirstName } from "@/lib/utils";

import { AiSummaryCard } from "./ai-summary-card";
import { ChartsSection } from "./charts-section";
import { DashboardActions } from "./dashboard-actions";
import { MetricsRow } from "./metrics-row";

/** Short org name for the subtitle: the first word of the org name ("Acme Inc." -> "Acme"). */
function shortOrgName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export default async function DashboardPage() {
  const [metrics, series, org, user] = await Promise.all([
    getDashboardMetrics(CURRENT_ORG_ID),
    getDashboardSeries(CURRENT_ORG_ID),
    getOrganization(CURRENT_ORG_ID),
    getCurrentUser(CURRENT_ORG_ID),
  ]);

  const firstName = user ? userFirstName(user) : "";
  const orgLabel = org ? shortOrgName(org.name) : "";

  return (
    <>
      <PageHeader
        title={`Good morning, ${firstName}.`}
        subtitle={`Here's how ${orgLabel} performed yesterday — Wednesday, July 1`}
        actions={<DashboardActions />}
      />
      <PageShell>
        <MetricsRow metrics={metrics} />
        <AiSummaryCard generatedLabel="Generated 6:00 AM" />
        <ChartsSection series={series} />
      </PageShell>
    </>
  );
}
