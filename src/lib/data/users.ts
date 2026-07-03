import { USE_MOCK } from "@/lib/config";
import { users } from "@/lib/mock-data";
import { getServerSupabase } from "@/lib/supabase/server";
import type { User } from "@/lib/types";

/** Fetch a single user by id. Returns null if not found. */
export async function getUser(id: string): Promise<User | null> {
  if (USE_MOCK) {
    return users.find((u) => u.id === id) ?? null;
  }

  const supabase = await getServerSupabase();
  if (!supabase) return users.find((u) => u.id === id) ?? null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return (data as User | null) ?? null;
}

/**
 * Fetch the current session user for an organization. In the single-tenant
 * demo this is the first (and only) seeded member of the org.
 */
export async function getCurrentUser(orgId: string): Promise<User | null> {
  if (USE_MOCK) {
    return users.find((u) => u.orgId === orgId) ?? null;
  }

  const supabase = await getServerSupabase();
  if (!supabase) return users.find((u) => u.orgId === orgId) ?? null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("org_id", orgId)
    .limit(1)
    .maybeSingle();

  return (data as User | null) ?? null;
}
