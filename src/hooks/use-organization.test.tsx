import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Providers, makeTestQueryClient } from "@/test/render";
import { CURRENT_ORG_ID } from "@/lib/config";
import { queryKeys } from "@/lib/query-keys";
import {
  useOrganization,
  useOrganizations,
  useUpdateOrganization,
} from "./use-organization";

function wrapper() {
  const client = makeTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Providers client={client}>{children}</Providers>
  );
  return { client, Wrapper };
}

describe("useOrganization", () => {
  it("resolves the seeded current org (Acme)", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useOrganization(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.id).toBe(CURRENT_ORG_ID);
    expect(result.current.data?.name).toBe("Acme Inc.");
    expect(result.current.data?.slug).toBe("acme");
    expect(result.current.data?.timezone).toBe("America/Los_Angeles");
    expect(result.current.data?.reportTime).toBe("08:00");
  });

  it("resolves null for an unknown org id", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useOrganization("org_missing"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe("useOrganizations", () => {
  it("resolves both seeded orgs", async () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useOrganizations(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const orgs = result.current.data!;
    expect(orgs).toHaveLength(2);
    expect(orgs.map((o) => o.slug)).toEqual(["acme", "northwind"]);
  });
});

describe("useUpdateOrganization", () => {
  it("patches the org, sets the cache, and invalidates both keys", async () => {
    const { client, Wrapper } = wrapper();
    const setSpy = vi.spyOn(client, "setQueryData");
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useUpdateOrganization(), {
      wrapper: Wrapper,
    });

    const res = await result.current.mutateAsync({ name: "Acme Corp." });

    expect(res).toMatchObject({
      id: CURRENT_ORG_ID,
      name: "Acme Corp.",
      slug: "acme",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setSpy).toHaveBeenCalledWith(
      queryKeys.organization(CURRENT_ORG_ID),
      res,
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.organization(CURRENT_ORG_ID),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.organizations(),
    });
  });
});
