import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Providers, makeTestQueryClient } from "@/test/render";
import { CURRENT_ORG_ID } from "@/lib/config";
import { queryKeys } from "@/lib/query-keys";
import type { NotificationConfig } from "@/lib/types";
import {
  useConnectNotificationChannel,
  useDisconnectNotificationChannel,
  useNotifications,
  useToggleNotificationChannel,
} from "./use-notifications";

function wrapper() {
  const client = makeTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Providers client={client}>{children}</Providers>
  );
  return { client, Wrapper };
}

describe("useNotifications", () => {
  it("resolves the seeded Acme notification channels", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useNotifications(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const configs = result.current.data!;
    expect(configs).toHaveLength(3);

    const telegram = configs.find((c) => c.channel === "telegram")!;
    expect(telegram.status).toBe("connected");
    expect(telegram.target).toBe("@alex on Telegram");
    expect(telegram.enabled).toBe(true);

    const slack = configs.find((c) => c.channel === "slack")!;
    expect(slack.status).toBe("not_connected");
    expect(slack.enabled).toBe(false);

    const email = configs.find((c) => c.channel === "email")!;
    expect(email.target).toBe("alex@acme.com");
  });
});

describe("useToggleNotificationChannel", () => {
  it("toggles enabled, patches the cache, and invalidates", async () => {
    const { client, Wrapper } = wrapper();

    const { result: listResult } = renderHook(() => useNotifications(), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(listResult.current.isSuccess).toBe(true));

    const setSpy = vi.spyOn(client, "setQueryData");
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useToggleNotificationChannel(), {
      wrapper: Wrapper,
    });

    const res = await result.current.mutateAsync({
      channel: "telegram",
      enabled: false,
    });
    expect(res.config?.enabled).toBe(false);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setSpy).toHaveBeenCalledWith(
      queryKeys.notifications(CURRENT_ORG_ID),
      expect.any(Function),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.notifications(CURRENT_ORG_ID),
    });

    // The optimistic setQueryData updater flips telegram to disabled.
    const updater = setSpy.mock.calls.find(
      ([key]) =>
        JSON.stringify(key) ===
        JSON.stringify(queryKeys.notifications(CURRENT_ORG_ID)),
    )?.[1] as (prev: NotificationConfig[]) => NotificationConfig[];
    const patched = updater(listResult.current.data!);
    expect(
      patched.find((c) => c.channel === "telegram")?.enabled,
    ).toBe(false);
  });
});

describe("useConnectNotificationChannel", () => {
  it("connects a channel and sets its target", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useConnectNotificationChannel(), {
      wrapper: Wrapper,
    });

    const res = await result.current.mutateAsync({
      channel: "slack",
      target: "#executives",
    });
    expect(res.config?.status).toBe("connected");
    expect(res.config?.enabled).toBe(true);
    expect(res.config?.target).toBe("#executives");
  });
});

describe("useDisconnectNotificationChannel", () => {
  it("disconnects a channel", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useDisconnectNotificationChannel(), {
      wrapper: Wrapper,
    });

    const res = await result.current.mutateAsync("telegram");
    expect(res.config?.status).toBe("not_connected");
    expect(res.config?.enabled).toBe(false);
  });
});
