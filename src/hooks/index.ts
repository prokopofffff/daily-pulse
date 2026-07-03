/**
 * Barrel export for Daily Pulse React Query hooks.
 */

export {
  useDashboard,
  useDashboardMetrics,
  useDashboardSeries,
  useMetricSeries,
} from "./use-dashboard";
export {
  useGenerateReport,
  useReport,
  useReports,
  useReportSearch,
} from "./use-reports";
export {
  useAcknowledgeAction,
  useInsights,
  useRecommendedActions,
} from "./use-insights";
export {
  useConnectIntegration,
  useDisconnectIntegration,
  useIntegrations,
  useSyncIntegration,
} from "./use-integrations";
export {
  useConnectNotificationChannel,
  useDisconnectNotificationChannel,
  useNotifications,
  useToggleNotificationChannel,
} from "./use-notifications";
export {
  useDeliveryPreferences,
  useUpdateDeliveryPreferences,
} from "./use-delivery-preferences";
export {
  useOrganization,
  useOrganizations,
  useUpdateOrganization,
} from "./use-organization";
