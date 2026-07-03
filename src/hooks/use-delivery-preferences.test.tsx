import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Providers, makeTestQueryClient } from "@/test/render";
import { CURRENT_ORG_ID } from "@/lib/config";
import { queryKeys } from "@/lib/query-keys";
import {
  useDeliveryPreferences,
  useUpdateDeliveryPreferences,
} from "./use-delivery-preferences";

function wrapper() {
  const client = makeTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Providers client={client}>{children}</Providers>
  );
  return { client, Wrapper };
}

describe("useDeliveryPreferences", () => {
  it("resolves the seeded Acme delivery preferences", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useDeliveryPreferences(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      orgId: CURRENT_ORG_ID,
      dailySummary: true,
      criticalAlerts: true,
      weeklyDigest: true,
      sendTime: "08:00",
    });
  });
});

describe("useUpdateDeliveryPreferences", () => {
  it("patches preferences, sets the cache, and invalidates", async () => {
    const { client, Wrapper } = wrapper();
    const setSpy = vi.spyOn(client, "setQueryData");
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useUpdateDeliveryPreferences(), {
      wrapper: Wrapper,
    });

    const res = await result.current.mutateAsync({
      weeklyDigest: false,
      sendTime: "09:30",
    });

    // Optimistic merge over the seeded prefs.
    expect(res).toMatchObject({
      orgId: CURRENT_ORG_ID,
      dailySummary: true,
      criticalAlerts: true,
      weeklyDigest: false,
      sendTime: "09:30",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setSpy).toHaveBeenCalledWith(
      queryKeys.deliveryPreferences(CURRENT_ORG_ID),
      res,
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.deliveryPreferences(CURRENT_ORG_ID),
    });
  });
});
