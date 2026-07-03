import { PageHeader, PageShell } from "@/components/layout/page-header";
import { NotificationsView } from "@/components/notifications/notifications-view";

export const metadata = {
  title: "Notifications — Daily Pulse",
};

export default function NotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Choose where your daily AI report and critical alerts get delivered."
      />
      <PageShell>
        <NotificationsView />
      </PageShell>
    </>
  );
}
