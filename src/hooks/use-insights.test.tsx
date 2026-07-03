import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Providers, makeTestQueryClient } from "@/test/render";
import { CURRENT_ORG_ID } from "@/lib/config";
import { queryKeys } from "@/lib/query-keys";
import {
  useAcknowledgeAction,
  useInsights,
  useRecommendedActions,
} from "./use-insights";

function wrapper() {
  const client = makeTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Providers client={client}>{children}</Providers>
  );
  return { client, Wrapper };
}

describe("useInsights", () => {
  it("resolves seeded insights ranked by confidence desc", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useInsights(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const insights = result.current.data!;
    expect(insights).toHaveLength(4);
    // Highest confidence (0.94) first.
    expect(insights[0].id).toBe("insight_revenue_up");
    expect(insights[0].confidence).toBe(0.94);
    // Confidence is monotonically non-increasing.
    for (let i = 1; i < insights.length; i++) {
      expect(insights[i - 1].confidence).toBeGreaterThanOrEqual(
        insights[i].confidence,
      );
    }
  });
});

describe("useRecommendedActions", () => {
  it("resolves seeded actions ordered high -> low priority", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useRecommendedActions(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const actions = result.current.data!;
    expect(actions).toHaveLength(4);
    expect(actions[0].priority).toBe("high");
    expect(actions[actions.length - 1].priority).toBe("low");
    expect(actions[0].id).toBe("action_checkout_spike");
  });
});

describe("useAcknowledgeAction", () => {
  it("acknowledges an action and invalidates the actions key", async () => {
    const { client, Wrapper } = wrapper();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useAcknowledgeAction(), {
      wrapper: Wrapper,
    });

    const res = await result.current.mutateAsync("action_checkout_spike");
    expect(res).toEqual({
      actionId: "action_checkout_spike",
      acknowledged: true,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.recommendedActions(CURRENT_ORG_ID),
    });
  });
});
