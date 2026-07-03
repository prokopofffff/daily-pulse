import { PageHeader, PageShell } from "@/components/layout/page-header";
import { IntegrationsGrid } from "@/components/integrations/integrations-grid";
import { CURRENT_ORG_ID } from "@/lib/config";
import { listIntegrations } from "@/lib/data";

export const metadata = {
  title: "Integrations · Daily Pulse",
};

/**
 * Integrations page. Server-fetches the provider list and hands it to the
 * client grid as initial data so mutations stay in sync via React Query.
 */
export default async function IntegrationsPage() {
  const integrations = await listIntegrations(CURRENT_ORG_ID);

  return (
    <>
      <PageHeader
        title="Integrations"
        subtitle="Connect your data sources so Daily Pulse can summarize what matters."
      />
      <PageShell>
        <IntegrationsGrid initialData={integrations} orgId={CURRENT_ORG_ID} />
      </PageShell>
    </>
  );
}
