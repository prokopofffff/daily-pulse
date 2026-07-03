import { notFound } from "next/navigation";

import { PageHeader, PageShell } from "@/components/layout/page-header";
import { CURRENT_ORG_ID } from "@/lib/config";
import { getOrganization } from "@/lib/data";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const organization = await getOrganization(CURRENT_ORG_ID);

  if (!organization) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your organization, workspace defaults and branding."
      />
      <PageShell>
        <SettingsForm organization={organization} />
      </PageShell>
    </>
  );
}
