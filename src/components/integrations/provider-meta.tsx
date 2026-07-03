import {
  ChartColumn,
  CreditCard,
  Database,
  GitBranch,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";

import { DEMO_NOW_ISO } from "@/lib/config";
import type { IntegrationProvider } from "@/lib/types";

/**
 * lucide icon per integration provider — matches the exact icons used in the
 * design markup (pages.html): Stripe=credit-card, HubSpot=users,
 * Google Analytics=chart-column, GitHub=github, Supabase=database,
 * Shopify=shopping-bag.
 */
export const PROVIDER_ICON: Record<IntegrationProvider, LucideIcon> = {
  stripe: CreditCard,
  hubspot: Users,
  google_analytics: ChartColumn,
  github: GitBranch,
  supabase: Database,
  shopify: ShoppingBag,
};

/**
 * Fixed reference "now" used to render relative sync times deterministically.
 * Chosen so the seeded timestamps read as the design copy:
 *   Stripe   15:48Z -> "12 min ago"
 *   GA       15:00Z -> "1 hour ago"
 *   GitHub   16:00Z -> "just now"
 */
export const SYNC_REFERENCE_NOW = DEMO_NOW_ISO;

/** Human-readable "Synced …" label relative to SYNC_REFERENCE_NOW. */
export function relativeSyncLabel(
  isoDate: string | null,
  now: string = SYNC_REFERENCE_NOW,
): string | null {
  if (!isoDate) return null;
  const then = new Date(isoDate).getTime();
  const ref = new Date(now).getTime();
  if (Number.isNaN(then) || Number.isNaN(ref)) return null;

  const diffMs = Math.max(0, ref - then);
  const min = Math.round(diffMs / 60000);

  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;

  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
