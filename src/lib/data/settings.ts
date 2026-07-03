import { USE_MOCK } from "@/lib/config";
import {
  deliveryPreferences,
  integrations,
  notificationConfigs,
} from "@/lib/mock-data";
import { getServerSupabase } from "@/lib/supabase/server";
import type {
  DeliveryPreferences,
  Integration,
  NotificationConfig,
} from "@/lib/types";

/** Data-source integrations for an org (Stripe, GA, GitHub, …). */
export async function listIntegrations(
  orgId: string,
): Promise<Integration[]> {
  if (USE_MOCK) return integrations.filter((i) => i.orgId === orgId);

  const supabase = await getServerSupabase();
  if (!supabase) return integrations.filter((i) => i.orgId === orgId);

  const { data } = await supabase
    .from("integrations")
    .select("*")
    .eq("org_id", orgId);

  return (data as Integration[] | null) ?? [];
}

/** Notification channels (Telegram, Slack, Email) for an org. */
export async function listNotificationConfigs(
  orgId: string,
): Promise<NotificationConfig[]> {
  if (USE_MOCK) return notificationConfigs.filter((n) => n.orgId === orgId);

  const supabase = await getServerSupabase();
  if (!supabase) return notificationConfigs.filter((n) => n.orgId === orgId);

  const { data } = await supabase
    .from("notification_configs")
    .select("*")
    .eq("org_id", orgId);

  return (data as NotificationConfig[] | null) ?? [];
}

/** Delivery preferences (which reports, and when) for an org. */
export async function getDeliveryPreferences(
  orgId: string,
): Promise<DeliveryPreferences | null> {
  if (USE_MOCK) {
    return deliveryPreferences.find((p) => p.orgId === orgId) ?? null;
  }

  const supabase = await getServerSupabase();
  if (!supabase) {
    return deliveryPreferences.find((p) => p.orgId === orgId) ?? null;
  }

  const { data } = await supabase
    .from("delivery_preferences")
    .select("*")
    .eq("org_id", orgId)
    .maybeSingle();

  return (data as DeliveryPreferences | null) ?? null;
}
