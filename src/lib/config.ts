/**
 * Runtime configuration for the data layer.
 *
 * USE_MOCK controls whether data-access functions read from the seeded
 * mock data (default) or from Supabase. Toggled via NEXT_PUBLIC_USE_MOCK_DATA.
 */

function readBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === "") return fallback;
  return value === "true" || value === "1";
}

/** When true, the app runs entirely on seeded mock data (no external calls). */
export const USE_MOCK = readBool(process.env.NEXT_PUBLIC_USE_MOCK_DATA, true);

/** The organization the current session operates on (single-tenant demo). */
export const CURRENT_ORG_ID = "org_acme";

/**
 * Fixed reference "now" for the demo. Seeded sync timestamps and optimistic
 * writes are all pinned to this instant so relative labels ("12 min ago") and
 * sync results render deterministically (no Date.now()). Single source of truth.
 */
export const DEMO_NOW_ISO = "2026-07-02T16:00:00.000Z";
