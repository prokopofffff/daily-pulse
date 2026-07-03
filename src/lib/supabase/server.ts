/**
 * Server Supabase client (@supabase/ssr).
 *
 * Returns a client only when env vars are present; otherwise returns null so
 * server data-access functions can safely fall back to mock data. Cookie
 * handling degrades gracefully if `next/headers` is unavailable.
 */

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getServerSupabase(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  // Lazily import next/headers so this module is safe to import outside a
  // request scope (e.g. in scripts / tests).
  let cookieStore: {
    getAll: () => { name: string; value: string }[];
    set: (name: string, value: string, options?: unknown) => void;
  } | null = null;

  try {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    cookieStore = {
      getAll: () => store.getAll().map((c) => ({ name: c.name, value: c.value })),
      set: (name, value, options) => {
        try {
          store.set(name, value, options as never);
        } catch {
          // Called from a Server Component render — safe to ignore.
        }
      },
    };
  } catch {
    cookieStore = null;
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore ? cookieStore.getAll() : [];
      },
      setAll(cookiesToSet) {
        if (!cookieStore) return;
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}
