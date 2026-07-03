"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useIntegrations } from "@/hooks/use-integrations";
import { CURRENT_ORG_ID } from "@/lib/config";
import type { Integration } from "@/lib/types";

import { CsvUploadCard } from "./csv-upload-card";
import { IntegrationCard } from "./integration-card";
import { WebhookCard } from "./webhook-card";

interface IntegrationsGridProps {
  initialData?: Integration[];
  orgId?: string;
}

const GRID_CLASS =
  "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";

/**
 * Responsive card grid of integration providers plus the CSV upload and webhook
 * ingestion cards. Reads via React Query (seeded from server-fetched
 * initialData) so mutations stay in sync without a refetch flash.
 */
export function IntegrationsGrid({
  initialData,
  orgId = CURRENT_ORG_ID,
}: IntegrationsGridProps) {
  const { data, isLoading, isError } = useIntegrations(orgId);
  const integrations = data ?? initialData ?? [];

  if (isLoading && integrations.length === 0) {
    return (
      <div className={GRID_CLASS}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[184px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError && integrations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <p className="text-sm font-medium text-foreground">
          Couldn&rsquo;t load integrations
        </p>
        <p className="text-sm text-muted-foreground">
          Refresh the page to try again.
        </p>
      </div>
    );
  }

  return (
    <div className={GRID_CLASS}>
      {integrations.map((integration) => (
        <IntegrationCard
          key={integration.id}
          integration={integration}
          orgId={orgId}
        />
      ))}
      <CsvUploadCard />
      <WebhookCard orgId={orgId} />
    </div>
  );
}
