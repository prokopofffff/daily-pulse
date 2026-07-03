import { USE_MOCK } from "@/lib/config";
import { organizations } from "@/lib/mock-data";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Organization } from "@/lib/types";

/** Fetch a single organization by id. Returns null if not found. */
export async function getOrganization(
  orgId: string,
): Promise<Organization | null> {
  if (USE_MOCK) {
    return organizations.find((o) => o.id === orgId) ?? null;
  }

  const supabase = await getServerSupabase();
  if (!supabase) return organizations.find((o) => o.id === orgId) ?? null;

  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .maybeSingle();

  return (data as Organization | null) ?? null;
}

/** List all organizations the current user can access. */
export async function listOrganizations(): Promise<Organization[]> {
  if (USE_MOCK) return organizations;

  const supabase = await getServerSupabase();
  if (!supabase) return organizations;

  const { data } = await supabase
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: true });

  return (data as Organization[] | null) ?? [];
}
