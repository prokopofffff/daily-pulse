import { PageHeader, PageShell } from "@/components/layout/page-header";
import { AskQuestion } from "@/components/insights/ask-question";
import { InsightsView } from "@/components/insights/insights-view";
import { CURRENT_ORG_ID } from "@/lib/config";
import { listInsights, listRecommendedActions } from "@/lib/data";

export default async function InsightsPage() {
  const [insights, actions] = await Promise.all([
    listInsights(CURRENT_ORG_ID),
    listRecommendedActions(CURRENT_ORG_ID),
  ]);

  return (
    <>
      <PageHeader
        title="Insights"
        subtitle="What the AI noticed in yesterday's data — ranked by impact."
        actions={<AskQuestion />}
      />
      <PageShell>
        <InsightsView initialInsights={insights} initialActions={actions} />
      </PageShell>
    </>
  );
}
