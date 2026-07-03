/**
 * Centralized tone / color mappings.
 *
 * These maps were previously duplicated inline across the insight, action and
 * metric components. They are the single source of truth for the Tailwind
 * class strings that translate a domain enum (insight sentiment, action
 * priority, a metric's success/danger direction, or a generic "tone") into
 * the badge / dot / chip / pill classes used by the UI.
 *
 * IMPORTANT: the class strings here are load-bearing — they must stay
 * byte-identical to the rendered output the components produced before this
 * module existed. Do not "tidy" the strings.
 */

import type { LucideIcon } from "lucide-react";
import {
  Receipt,
  Rocket,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import type { ActionPriority, InsightSentiment } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Insight sentiment                                                   */
/* ------------------------------------------------------------------ */

export interface SentimentStyle {
  label: string;
  icon: LucideIcon;
  /** icon tile + tag background */
  tile: string;
  /** tag text + icon color */
  text: string;
}

/** Insight sentiment → badge/dot/tile classes for `InsightCard`. */
export const SENTIMENT_STYLES: Record<InsightSentiment, SentimentStyle> = {
  positive: {
    label: "Positive",
    icon: TrendingUp,
    tile: "bg-success-subtle",
    text: "text-success",
  },
  watch: {
    label: "Watch",
    icon: Receipt,
    tile: "bg-warning-subtle",
    text: "text-warning",
  },
  negative: {
    label: "Negative",
    icon: TrendingDown,
    tile: "bg-danger-subtle",
    text: "text-danger",
  },
  opportunity: {
    label: "Opportunity",
    icon: Rocket,
    tile: "bg-accent",
    text: "text-primary",
  },
};

/* ------------------------------------------------------------------ */
/* Action priority                                                     */
/* ------------------------------------------------------------------ */

export interface PriorityStyle {
  label: string;
  /** priority pill background + text */
  pill: string;
}

/** Action priority → pill classes for `RecommendedActions`. */
export const PRIORITY_STYLES: Record<ActionPriority, PriorityStyle> = {
  high: {
    label: "High",
    pill: "bg-danger-subtle text-danger",
  },
  medium: {
    label: "Medium",
    pill: "bg-warning-subtle text-warning",
  },
  low: {
    label: "Low",
    pill: "bg-surface-subtle text-muted-foreground",
  },
};

/* ------------------------------------------------------------------ */
/* Generic tone                                                        */
/* ------------------------------------------------------------------ */

/**
 * A generic semantic tone. Not every surface uses every tone, but the class
 * strings for a given tone are consistent wherever it appears.
 */
export type Tone = "success" | "danger" | "accent" | "warning" | "neutral";

export interface ToneStyle {
  /** subtle/tinted background for the chip or tile */
  bg: string;
  /** solid foreground: dot fill or icon/text color */
  fg: string;
}

/**
 * Generic tone → chip classes.
 *
 * `bg` is the tinted background; `fg` is the accent color used for a dot fill
 * (`bg-*`) or icon/text (`text-*`). Consumers pick whichever channel they
 * need. Kept in sync with the duplicated maps in the dashboard chip / insight
 * rows.
 */
export const TONE_STYLES: Record<Tone, ToneStyle> = {
  success: { bg: "bg-success-subtle", fg: "text-success" },
  danger: { bg: "bg-danger-subtle", fg: "text-danger" },
  accent: { bg: "bg-accent", fg: "text-primary" },
  warning: { bg: "bg-warning-subtle", fg: "text-warning" },
  neutral: { bg: "bg-surface-subtle", fg: "text-muted-foreground" },
};

/**
 * The two-tone success/danger pair used by delta pills.
 *
 * `positive` → success classes, otherwise danger classes. Returns the exact
 * `bg-* text-*` string `MetricDelta` renders.
 */
export function deltaToneClasses(positive: boolean): string {
  return positive
    ? "bg-success-subtle text-success"
    : "bg-danger-subtle text-danger";
}
