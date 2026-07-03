import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("getBrowserSupabase", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    // Ensure fresh module state so the internal `cached` value is reset.
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    vi.restoreAllMocks();
  });

  it("returns null (no throw) when env vars are absent", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { getBrowserSupabase } = await import("@/lib/supabase/client");
    expect(getBrowserSupabase()).toBeNull();
  });

  it("returns null when env vars are empty strings", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";

    const { getBrowserSupabase } = await import("@/lib/supabase/client");
    expect(getBrowserSupabase()).toBeNull();
  });

  it("caches the null result across calls", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { getBrowserSupabase } = await import("@/lib/supabase/client");
    const first = getBrowserSupabase();

    // Even if env later appears, the cached null is returned within the module.
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";

    expect(getBrowserSupabase()).toBe(first);
    expect(getBrowserSupabase()).toBeNull();
  });

  it("creates and caches a client when env vars are present", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    const fakeClient = { from: vi.fn() };
    const createBrowserClient = vi.fn(() => fakeClient);
    vi.doMock("@supabase/ssr", () => ({ createBrowserClient }));

    const { getBrowserSupabase } = await import("@/lib/supabase/client");
    const client = getBrowserSupabase();

    expect(client).toBe(fakeClient);
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
    );

    // Subsequent calls reuse the cached client (no re-creation).
    expect(getBrowserSupabase()).toBe(fakeClient);
    expect(createBrowserClient).toHaveBeenCalledTimes(1);
  });
});
