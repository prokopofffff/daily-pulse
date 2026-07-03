import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentUser, getOrganization } from "@/lib/data";
import { CURRENT_ORG_ID } from "@/lib/config";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [org, user] = await Promise.all([
    getOrganization(CURRENT_ORG_ID),
    getCurrentUser(CURRENT_ORG_ID),
  ]);

  return (
    <div className="flex min-h-screen flex-row bg-background">
      <Sidebar org={org} user={user} />
      <main className="flex min-h-screen min-w-0 flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
