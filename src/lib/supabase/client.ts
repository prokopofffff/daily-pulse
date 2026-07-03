/**
 * Browser Supabase client.
 *
 * Returns a client only when the public env vars are present; otherwise returns
 * null so callers can fall back to mock data without throwing. This keeps the
 * app fully functional in mock mode with no Supabase project configured.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

export function getBrowserSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    cached = null;
    return cached;
  }

  cached = createBrowserClient(url, anonKey);
  return cached;
}
