// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("getServerSupabase", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    vi.restoreAllMocks();
  });

  it("resolves to null (no throw) when env vars are absent", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { getServerSupabase } = await import("@/lib/supabase/server");
    await expect(getServerSupabase()).resolves.toBeNull();
  });

  it("resolves to null when env vars are empty strings", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";

    const { getServerSupabase } = await import("@/lib/supabase/server");
    await expect(getServerSupabase()).resolves.toBeNull();
  });

  it("does not import next/headers when env is absent", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const createServerClient = vi.fn();
    vi.doMock("@supabase/ssr", () => ({ createServerClient }));

    const { getServerSupabase } = await import("@/lib/supabase/server");
    expect(await getServerSupabase()).toBeNull();
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("creates a client when env vars are present, degrading gracefully without next/headers", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    const fakeClient = { from: vi.fn() };
    type CookieOptions = {
      cookies: {
        getAll: () => { name: string; value: string }[];
        setAll: (cookies: { name: string; value: string }[]) => void;
      };
    };
    const createServerClient = vi.fn(
      (url: string, key: string, opts: CookieOptions) => {
        void url;
        void key;
        void opts;
        return fakeClient;
      },
    );
    vi.doMock("@supabase/ssr", () => ({ createServerClient }));
    // Force the next/headers import to fail (outside a request scope).
    vi.doMock("next/headers", () => {
      throw new Error("next/headers unavailable outside request scope");
    });

    const { getServerSupabase } = await import("@/lib/supabase/server");
    const client = await getServerSupabase();

    expect(client).toBe(fakeClient);
    expect(createServerClient).toHaveBeenCalledTimes(1);
    const [url, key, opts] = createServerClient.mock.calls[0];
    expect(url).toBe("https://example.supabase.co");
    expect(key).toBe("anon-key");

    // Cookie adapter falls back to empty list and is a no-op setter when
    // next/headers is unavailable.
    expect(opts.cookies.getAll()).toEqual([]);
    expect(() => opts.cookies.setAll([{ name: "a", value: "b" }])).not.toThrow();
  });
});
