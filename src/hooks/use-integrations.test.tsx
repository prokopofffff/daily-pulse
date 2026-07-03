import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Providers, makeTestQueryClient } from "@/test/render";
import { CURRENT_ORG_ID } from "@/lib/config";
import { queryKeys } from "@/lib/query-keys";
import type { Integration } from "@/lib/types";
import {
  useConnectIntegration,
  useDisconnectIntegration,
  useIntegrations,
  useSyncIntegration,
} from "./use-integrations";

function wrapper() {
  const client = makeTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Providers client={client}>{children}</Providers>
  );
  return { client, Wrapper };
}

describe("useIntegrations", () => {
  it("resolves the seeded Acme integrations", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useIntegrations(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const integrations = result.current.data!;
    expect(integrations).toHaveLength(6);

    const stripe = integrations.find((i) => i.provider === "stripe")!;
    expect(stripe.status).toBe("connected");
    expect(stripe.name).toBe("Stripe");

    const hubspot = integrations.find((i) => i.provider === "hubspot")!;
    expect(hubspot.status).toBe("not_connected");
    expect(hubspot.lastSyncedAt).toBeNull();
  });
});

describe("useConnectIntegration", () => {
  it("connects a provider, patches the cache, and invalidates", async () => {
    const { client, Wrapper } = wrapper();

    // Seed the integrations cache so setQueryData has something to patch.
    const { result: listResult } = renderHook(() => useIntegrations(), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(listResult.current.isSuccess).toBe(true));

    const setSpy = vi.spyOn(client, "setQueryData");
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useConnectIntegration(), {
      wrapper: Wrapper,
    });

    const res = await result.current.mutateAsync("hubspot");
    expect(res.provider).toBe("hubspot");
    expect(res.integration?.status).toBe("connected");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setSpy).toHaveBeenCalledWith(
      queryKeys.integrations(CURRENT_ORG_ID),
      expect.any(Function),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.integrations(CURRENT_ORG_ID),
    });

    // The optimistic setQueryData updater flips hubspot to connected.
    const updater = setSpy.mock.calls.find(
      ([key]) =>
        JSON.stringify(key) ===
        JSON.stringify(queryKeys.integrations(CURRENT_ORG_ID)),
    )?.[1] as (prev: Integration[]) => Integration[];
    const before = listResult.current.data!;
    const patched = updater(before);
    expect(
      patched.find((i) => i.provider === "hubspot")?.status,
    ).toBe("connected");
  });
});

describe("useDisconnectIntegration", () => {
  it("disconnects a connected provider", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useDisconnectIntegration(), {
      wrapper: Wrapper,
    });

    const res = await result.current.mutateAsync("stripe");
    expect(res.integration?.status).toBe("not_connected");
    expect(res.integration?.lastSyncedAt).toBeNull();
  });
});

describe("useSyncIntegration", () => {
  it("syncs a provider (mock no-op) and returns an updated lastSyncedAt", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useSyncIntegration(), {
      wrapper: Wrapper,
    });

    const res = await result.current.mutateAsync("stripe");
    expect(res.provider).toBe("stripe");
    expect(res.integration?.lastSyncedAt).toBe("2026-07-02T16:00:00.000Z");
  });
});
