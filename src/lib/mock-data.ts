/**
 * Seeded, deterministic mock data for Daily Pulse.
 *
 * All ids and timestamps are hard-coded (no randomness, no Date.now()) so the
 * UI renders identically on server and client and across reloads.
 *
 * Primary org: "Acme Inc." (slug "acme", Pacific tz). A second org ("Northwind")
 * exists to exercise multi-org support.
 */

import type {
  DeliveryPreferences,
  Insight,
  Integration,
  Metric,
  MetricSeries,
  NotificationConfig,
  Organization,
  RecommendedAction,
  Report,
  User,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Organizations                                                       */
/* ------------------------------------------------------------------ */

export const ORG_ACME_ID = "org_acme";
export const ORG_NORTHWIND_ID = "org_northwind";

export const organizations: Organization[] = [
  {
    id: ORG_ACME_ID,
    name: "Acme Inc.",
    slug: "acme",
    timezone: "America/Los_Angeles",
    reportTime: "08:00",
    accentColor: "#2563EB",
    logoUrl: null,
    createdAt: "2025-01-15T08:00:00.000Z",
  },
  {
    id: ORG_NORTHWIND_ID,
    name: "Northwind Trading",
    slug: "northwind",
    timezone: "America/New_York",
    reportTime: "07:30",
    accentColor: "#7C3AED",
    logoUrl: null,
    createdAt: "2025-03-02T12:00:00.000Z",
  },
];

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export const users: User[] = [
  {
    id: "user_alex",
    orgId: ORG_ACME_ID,
    name: "Alex Rivera",
    email: "alex@acme.com",
  },
];

/* ------------------------------------------------------------------ */
/* Dashboard metric cards (Acme, for Wednesday July 1 2026)            */
/* ------------------------------------------------------------------ */

export const metrics: Metric[] = [
  {
    id: "metric_revenue",
    orgId: ORG_ACME_ID,
    key: "revenue",
    label: "Yesterday revenue",
    date: "2026-07-01",
    value: 48250,
    previousValue: 40820,
    deltaPct: 18.2,
    format: "currency",
    source: "stripe",
  },
  {
    id: "metric_new_customers",
    orgId: ORG_ACME_ID,
    key: "new_customers",
    label: "New customers",
    date: "2026-07-01",
    value: 142,
    previousValue: 130,
    deltaPct: 9.2,
    format: "number",
    source: "hubspot",
  },
  {
    id: "metric_lost_customers",
    orgId: ORG_ACME_ID,
    key: "lost_customers",
    label: "Lost customers",
    date: "2026-07-01",
    value: 18,
    previousValue: 14,
    deltaPct: 28.6,
    format: "number",
    source: "stripe",
  },
  {
    id: "metric_support_tickets",
    orgId: ORG_ACME_ID,
    key: "support_tickets",
    label: "Support tickets",
    date: "2026-07-01",
    value: 63,
    previousValue: 73,
    deltaPct: -14,
    format: "number",
    source: "manual",
  },
  {
    id: "metric_critical_issues",
    orgId: ORG_ACME_ID,
    key: "critical_issues",
    label: "Critical issues",
    date: "2026-07-01",
    value: 2,
    previousValue: 0,
    deltaPct: null,
    format: "number",
    source: "github",
  },
];

/* ------------------------------------------------------------------ */
/* Time-series for the dashboard charts (Acme)                         */
/* ------------------------------------------------------------------ */

const revenuePoints = [
  { label: "Thu", date: "2026-06-25", value: 31200 },
  { label: "Fri", date: "2026-06-26", value: 35600 },
  { label: "Sat", date: "2026-06-27", value: 28900 },
  { label: "Sun", date: "2026-06-28", value: 26400 },
  { label: "Mon", date: "2026-06-29", value: 34100 },
  { label: "Tue", date: "2026-06-30", value: 40820 },
  { label: "Wed", date: "2026-07-01", value: 48250 },
];

const ordersPoints = [
  { label: "Thu", date: "2026-06-25", value: 214 },
  { label: "Fri", date: "2026-06-26", value: 243 },
  { label: "Sat", date: "2026-06-27", value: 198 },
  { label: "Sun", date: "2026-06-28", value: 176 },
  { label: "Mon", date: "2026-06-29", value: 231 },
  { label: "Tue", date: "2026-06-30", value: 268 },
  { label: "Wed", date: "2026-07-01", value: 312 },
];

const trafficPoints = [
  { label: "Thu", date: "2026-06-25", value: 19800 },
  { label: "Fri", date: "2026-06-26", value: 22100 },
  { label: "Sat", date: "2026-06-27", value: 17600 },
  { label: "Sun", date: "2026-06-28", value: 16200 },
  { label: "Mon", date: "2026-06-29", value: 20900 },
  { label: "Tue", date: "2026-06-30", value: 22770 },
  { label: "Wed", date: "2026-07-01", value: 21400 },
];

const supportPoints = [
  { label: "Thu", date: "2026-06-25", value: 58 },
  { label: "Fri", date: "2026-06-26", value: 61 },
  { label: "Sat", date: "2026-06-27", value: 44 },
  { label: "Sun", date: "2026-06-28", value: 39 },
  { label: "Mon", date: "2026-06-29", value: 55 },
  { label: "Tue", date: "2026-06-30", value: 73 },
  { label: "Wed", date: "2026-07-01", value: 63 },
];

const conversionPoints = [
  { label: "Thu", date: "2026-06-25", value: 3.2 },
  { label: "Fri", date: "2026-06-26", value: 3.5 },
  { label: "Sat", date: "2026-06-27", value: 3.1 },
  { label: "Sun", date: "2026-06-28", value: 3.0 },
  { label: "Mon", date: "2026-06-29", value: 3.3 },
  { label: "Tue", date: "2026-06-30", value: 3.4 },
  { label: "Wed", date: "2026-07-01", value: 3.8 },
];

export const metricSeries: MetricSeries[] = [
  {
    key: "revenue",
    label: "Revenue",
    format: "currency",
    total: 48250,
    deltaPct: 18.2,
    points: revenuePoints,
  },
  {
    key: "orders",
    label: "Orders",
    format: "number",
    total: 312,
    deltaPct: 16.4,
    points: ordersPoints,
  },
  {
    key: "visitors",
    label: "Traffic",
    format: "compact",
    total: 21400,
    deltaPct: -6.0,
    points: trafficPoints,
  },
  {
    key: "support_tickets",
    label: "Support tickets",
    format: "number",
    total: 63,
    deltaPct: -14,
    points: supportPoints,
  },
  {
    key: "conversion",
    label: "Conversion",
    format: "percent",
    total: 3.8,
    deltaPct: 11.8,
    points: conversionPoints,
  },
];

/* ------------------------------------------------------------------ */
/* Insights (Acme)                                                     */
/* ------------------------------------------------------------------ */

export const insights: Insight[] = [
  {
    id: "insight_revenue_up",
    orgId: ORG_ACME_ID,
    reportId: "report_jul_01",
    category: "win",
    sentiment: "positive",
    title: "Revenue increased 18%",
    body: "Yesterday's revenue hit $48.2k — the strongest single day this quarter, led by a spike in Pro plan upgrades.",
    confidence: 0.94,
    detectedAt: "2026-07-02T13:00:00.000Z",
  },
  {
    id: "insight_refunds_up",
    orgId: ORG_ACME_ID,
    reportId: "report_jul_01",
    category: "risk",
    sentiment: "watch",
    title: "Refund requests increased",
    body: "Refunds rose 32% following the June 24 pricing update. Most cite the removal of the legacy Starter tier.",
    confidence: 0.88,
    detectedAt: "2026-07-02T13:00:00.000Z",
  },
  {
    id: "insight_traffic_down",
    orgId: ORG_ACME_ID,
    reportId: "report_jul_01",
    category: "risk",
    sentiment: "negative",
    title: "Traffic decreased 6%",
    body: "Organic search sessions dipped overnight. A Google core update on June 30 is the likely cause.",
    confidence: 0.76,
    detectedAt: "2026-07-02T13:00:00.000Z",
  },
  {
    id: "insight_adoption",
    orgId: ORG_ACME_ID,
    reportId: "report_jul_01",
    category: "win",
    sentiment: "opportunity",
    title: "New feature adoption is strong",
    body: "The redesigned dashboard reached 41% adoption within 24 hours of launch — well above the 25% target.",
    confidence: 0.91,
    detectedAt: "2026-07-02T13:00:00.000Z",
  },
];

/* ------------------------------------------------------------------ */
/* Recommended actions (Acme)                                          */
/* ------------------------------------------------------------------ */

export const recommendedActions: RecommendedAction[] = [
  {
    id: "action_checkout_spike",
    orgId: ORG_ACME_ID,
    reportId: "report_jul_01",
    priority: "high",
    title: "Review the checkout error spike",
    body: "2 critical payment failures were detected overnight — investigate the Stripe webhook timeout.",
    ctaLabel: "Take action",
  },
  {
    id: "action_refund_trend",
    orgId: ORG_ACME_ID,
    reportId: "report_jul_01",
    priority: "high",
    title: "Get ahead of the refund trend",
    body: "Draft proactive comms for customers affected by the Starter tier removal on June 24.",
    ctaLabel: "Review",
  },
  {
    id: "action_recover_traffic",
    orgId: ORG_ACME_ID,
    reportId: "report_jul_01",
    priority: "medium",
    title: "Recover organic traffic",
    body: "Audit the pages hit by the June 30 core update and refresh your top three landing pages.",
    ctaLabel: "Review",
  },
  {
    id: "action_lean_dashboard",
    orgId: ORG_ACME_ID,
    reportId: "report_jul_01",
    priority: "low",
    title: "Lean into the new dashboard",
    body: "Adoption is beating targets — promote it inside onboarding and lifecycle emails.",
    ctaLabel: "Review",
  },
];

/* ------------------------------------------------------------------ */
/* Reports (Acme)                                                      */
/* ------------------------------------------------------------------ */

export const reports: Report[] = [
  {
    id: "report_jul_01",
    orgId: ORG_ACME_ID,
    period: "daily",
    title: "Daily Pulse — July 1",
    date: "2026-07-01",
    summary:
      "Strong day: revenue up 18% on record signups. 2 checkout issues flagged for review.",
    body: "Yesterday was a strong day. Revenue climbed 18.2% to $48,250, driven by 142 new customer signups — the highest single-day total this quarter. Churn stayed low with 18 cancellations, though 2 critical issues were flagged in checkout. Support volume dropped 14% as the new help center deflected common requests.",
    metrics: [
      { label: "Revenue", value: "$48.2k", deltaPct: 18.2 },
      { label: "New customers", value: "142", deltaPct: 9.2 },
      { label: "Tickets", value: "63", deltaPct: -14 },
    ],
    insightIds: [
      "insight_revenue_up",
      "insight_refunds_up",
      "insight_traffic_down",
      "insight_adoption",
    ],
    chips: [
      { label: "Revenue at quarter high", tone: "success" },
      { label: "Checkout errors up 3×", tone: "danger" },
      { label: "Signup rate +18%", tone: "accent" },
    ],
    highlights: [
      {
        text: "Refund requests are trending up — review the June pricing change.",
        tone: "warning",
        icon: "alert",
      },
      {
        text: "New dashboard feature hit 41% adoption in 24h.",
        tone: "accent",
        icon: "sparkles",
      },
      {
        text: "Traffic from organic search dipped 6% overnight.",
        tone: "danger",
        icon: "trending-down",
      },
    ],
    generatedAt: "2026-07-02T13:00:00.000Z",
    status: "ready",
  },
  {
    id: "report_jun_30",
    orgId: ORG_ACME_ID,
    period: "daily",
    title: "Daily Pulse — June 30",
    date: "2026-06-30",
    summary:
      "Steady growth. Refund requests ticked up slightly after the pricing change.",
    body: "A steady day of growth. Revenue reached $40,820 on 118 new signups. Refund requests ticked up slightly following the June 24 pricing change — worth watching over the next few days. Support tickets held near the weekly average.",
    metrics: [
      { label: "Revenue", value: "$40.8k", deltaPct: 8.1 },
      { label: "New customers", value: "118", deltaPct: 4.4 },
      { label: "Tickets", value: "72", deltaPct: 3.0 },
    ],
    insightIds: [],
    generatedAt: "2026-07-01T13:00:00.000Z",
    status: "ready",
  },
  {
    id: "report_jun_29",
    orgId: ORG_ACME_ID,
    period: "daily",
    title: "Daily Pulse — June 29",
    date: "2026-06-29",
    summary:
      "Quiet weekend close. Traffic held flat, conversion improved 0.3 pts.",
    body: "A quiet close to the weekend. Revenue came in at $34,100 with traffic holding flat versus Saturday. Conversion improved 0.3 points as returning visitors converted at a higher rate. No critical issues were detected.",
    metrics: [
      { label: "Revenue", value: "$34.1k", deltaPct: 2.0 },
      { label: "New customers", value: "96", deltaPct: -1.0 },
      { label: "Tickets", value: "61", deltaPct: -8.0 },
    ],
    insightIds: [],
    generatedAt: "2026-06-30T13:00:00.000Z",
    status: "ready",
  },
  {
    id: "report_weekly_jun_22_28",
    orgId: ORG_ACME_ID,
    period: "weekly",
    title: "Weekly digest — Jun 22–28",
    date: "2026-06-28",
    summary:
      "Best week this quarter. Revenue +12% WoW, driven by the new onboarding flow.",
    body: "The best week this quarter. Revenue grew 12% week-over-week to $268k, driven largely by the new onboarding flow that lifted activation. New customers reached 812 for the week, and support load stayed manageable at 430 tickets. Momentum heading into July looks strong.",
    metrics: [
      { label: "Revenue", value: "$268k", deltaPct: 12.0 },
      { label: "New customers", value: "812", deltaPct: 9.5 },
      { label: "Tickets", value: "430", deltaPct: -3.0 },
    ],
    insightIds: [],
    generatedAt: "2026-06-29T13:00:00.000Z",
    status: "ready",
  },
];

/* ------------------------------------------------------------------ */
/* Integrations (Acme)                                                 */
/* ------------------------------------------------------------------ */

export const integrations: Integration[] = [
  {
    id: "integration_stripe",
    orgId: ORG_ACME_ID,
    provider: "stripe",
    name: "Stripe",
    description: "Syncs payments, MRR and churn.",
    status: "connected",
    lastSyncedAt: "2026-07-02T15:48:00.000Z",
    config: {},
  },
  {
    id: "integration_hubspot",
    orgId: ORG_ACME_ID,
    provider: "hubspot",
    name: "HubSpot",
    description: "Syncs CRM contacts and deal pipeline.",
    status: "not_connected",
    lastSyncedAt: null,
    config: {},
  },
  {
    id: "integration_google_analytics",
    orgId: ORG_ACME_ID,
    provider: "google_analytics",
    name: "Google Analytics",
    description: "Syncs traffic, sessions and conversions.",
    status: "connected",
    lastSyncedAt: "2026-07-02T15:00:00.000Z",
    config: {},
  },
  {
    id: "integration_github",
    orgId: ORG_ACME_ID,
    provider: "github",
    name: "GitHub",
    description: "Syncs commits, PRs and deploy activity.",
    status: "connected",
    lastSyncedAt: "2026-07-02T16:00:00.000Z",
    config: {},
  },
  {
    id: "integration_supabase",
    orgId: ORG_ACME_ID,
    provider: "supabase",
    name: "Supabase",
    description: "Syncs product usage and events.",
    status: "not_connected",
    lastSyncedAt: null,
    config: {},
  },
  {
    id: "integration_shopify",
    orgId: ORG_ACME_ID,
    provider: "shopify",
    name: "Shopify",
    description: "Syncs orders, revenue and inventory.",
    status: "not_connected",
    lastSyncedAt: null,
    config: {},
  },
];

/* ------------------------------------------------------------------ */
/* Notification channels (Acme)                                        */
/* ------------------------------------------------------------------ */

export const notificationConfigs: NotificationConfig[] = [
  {
    id: "notif_telegram",
    orgId: ORG_ACME_ID,
    channel: "telegram",
    status: "connected",
    target: "@alex on Telegram",
    enabled: true,
  },
  {
    id: "notif_slack",
    orgId: ORG_ACME_ID,
    channel: "slack",
    status: "not_connected",
    target: null,
    enabled: false,
  },
  {
    id: "notif_email",
    orgId: ORG_ACME_ID,
    channel: "email",
    status: "connected",
    target: "alex@acme.com",
    enabled: true,
  },
];

/* ------------------------------------------------------------------ */
/* Delivery preferences (Acme)                                         */
/* ------------------------------------------------------------------ */

export const deliveryPreferences: DeliveryPreferences[] = [
  {
    orgId: ORG_ACME_ID,
    dailySummary: true,
    criticalAlerts: true,
    weeklyDigest: true,
    sendTime: "08:00",
  },
  {
    orgId: ORG_NORTHWIND_ID,
    dailySummary: true,
    criticalAlerts: false,
    weeklyDigest: true,
    sendTime: "07:30",
  },
];
