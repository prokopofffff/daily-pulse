/**
 * Barrel export for the Daily Pulse data-access layer.
 *
 * Every function is async and returns typed domain data. In mock mode
 * (USE_MOCK) they read from the seeded mock data; otherwise they read from
 * Supabase, falling back to mock data when no Supabase client is configured.
 */

export { getOrganization, listOrganizations } from "./organizations";
export { getCurrentUser, getUser } from "./users";
export {
  getDashboardMetrics,
  getDashboardSeries,
  getMetricSeries,
} from "./metrics";
export {
  getReport,
  listReports,
  searchReports,
} from "./reports";
export { listInsights, listRecommendedActions } from "./insights";
export {
  getDeliveryPreferences,
  listIntegrations,
  listNotificationConfigs,
} from "./settings";
