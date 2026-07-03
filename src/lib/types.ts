/**
 * Daily Pulse domain types — shared contract for all features.
 * Mirrors the Supabase schema in supabase/migrations.
 */

export type UUID = string;
export type ISODate = string;

export interface Organization {
  id: UUID;
  name: string;
  slug: string;
  timezone: string;
  reportTime: string; // "08:00"
  accentColor: string;
  logoUrl: string | null;
  createdAt: ISODate;
}

export interface User {
  id: UUID;
  orgId: UUID;
  name: string; // "Alex Rivera"
  email: string; // "alex@acme.com"
  /** Optional explicit initials; when absent, derive from `name`. */
  avatarInitials?: string;
  /** Optional explicit first name; when absent, derive from `name`. */
  firstName?: string;
}

export type MetricKey =
  | "revenue"
  | "new_customers"
  | "lost_customers"
  | "orders"
  | "visitors"
  | "conversion"
  | "support_tickets"
  | "critical_issues"
  | "errors";

export type MetricFormat = "currency" | "number" | "percent" | "compact";

export interface Metric {
  id: UUID;
  orgId: UUID;
  key: MetricKey;
  label: string;
  date: ISODate; // day the metric is for
  value: number;
  previousValue: number | null;
  deltaPct: number | null; // percentage change vs previous
  format: MetricFormat;
  source: IntegrationProvider | "manual" | "csv" | "webhook";
}

/** A point in a time-series used by charts. */
export interface MetricPoint {
  label: string; // e.g. "Mon"
  date: ISODate;
  value: number;
}

export interface MetricSeries {
  key: MetricKey;
  label: string;
  format: MetricFormat;
  total: number;
  deltaPct: number | null;
  points: MetricPoint[];
}

export type ReportPeriod = "daily" | "weekly" | "monthly";

export interface Report {
  id: UUID;
  orgId: UUID;
  period: ReportPeriod;
  title: string; // "Daily Pulse — July 1"
  date: ISODate; // period end / report day
  summary: string; // one-line summary
  body: string; // full AI narrative
  metrics: Array<{ label: string; value: string; deltaPct: number | null }>;
  insightIds: UUID[];
  generatedAt: ISODate;
  status: "generating" | "ready" | "failed";
  /** Optional headline chips for the AI summary card (e.g. "Revenue at quarter high"). */
  chips?: ReportChip[];
  /** Optional short AI-insight bullets shown alongside the summary. */
  highlights?: ReportHighlight[];
}

export type ReportChipTone = "success" | "danger" | "accent";

export interface ReportChip {
  label: string;
  tone: ReportChipTone;
}

export type ReportHighlightTone = "warning" | "accent" | "danger";
export type ReportHighlightIcon = "alert" | "sparkles" | "trending-down";

export interface ReportHighlight {
  text: string;
  tone: ReportHighlightTone;
  icon: ReportHighlightIcon;
}

export type InsightSentiment = "positive" | "watch" | "negative" | "opportunity";
export type InsightCategory =
  | "executive_summary"
  | "top_issue"
  | "recommendation"
  | "win"
  | "risk";

export interface Insight {
  id: UUID;
  orgId: UUID;
  reportId: UUID | null;
  category: InsightCategory;
  sentiment: InsightSentiment;
  title: string;
  body: string;
  confidence: number; // 0..1
  detectedAt: ISODate;
}

export type ActionPriority = "high" | "medium" | "low";

export interface RecommendedAction {
  id: UUID;
  orgId: UUID;
  reportId: UUID | null;
  priority: ActionPriority;
  title: string;
  body: string;
  ctaLabel: string; // "Take action" | "Review"
}

export type IntegrationProvider =
  | "stripe"
  | "google_analytics"
  | "github"
  | "supabase"
  | "hubspot"
  | "shopify";

export type IntegrationStatus = "connected" | "not_connected" | "error";

export interface Integration {
  id: UUID;
  orgId: UUID;
  provider: IntegrationProvider;
  name: string;
  description: string;
  status: IntegrationStatus;
  lastSyncedAt: ISODate | null;
  config: Record<string, unknown>;
}

export type NotificationChannel = "telegram" | "slack" | "email";

export interface NotificationConfig {
  id: UUID;
  orgId: UUID;
  channel: NotificationChannel;
  status: "connected" | "not_connected";
  target: string | null; // "@alex on Telegram"
  enabled: boolean;
}

export interface DeliveryPreferences {
  orgId: UUID;
  dailySummary: boolean;
  criticalAlerts: boolean;
  weeklyDigest: boolean;
  sendTime: string; // "08:00"
}

/** Structured JSON the OpenAI model must return when generating a report. */
export interface AIReportOutput {
  summary: string; // one-line
  body: string; // full narrative
  tags: string[]; // chips e.g. ["Revenue at quarter high"]
  insights: Array<{
    category: InsightCategory;
    sentiment: InsightSentiment;
    title: string;
    body: string;
    confidence: number;
  }>;
  actions: Array<{
    priority: ActionPriority;
    title: string;
    body: string;
    ctaLabel: string;
  }>;
}
