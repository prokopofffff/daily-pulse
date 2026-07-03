"use server";

/**
 * Server actions for integrations.
 *
 * Reads delegate to the data layer. Connect / disconnect / sync are optimistic
 * mock writes when USE_MOCK; the sync path calls into the Phase 3 integrations
 * lib. Returned Integration reflects the intended post-write state so callers
 * can optimistically update the cache.
 */

import { DEMO_NOW_ISO, USE_MOCK } from "@/lib/config";
import { listIntegrations } from "@/lib/data";
import type { Integration, IntegrationProvider } from "@/lib/types";
// Resolved in Phase 3.
import { syncIntegration } from "@/lib/integrations";

export async function listIntegrationsAction(
  orgId: string,
): Promise<Integration[]> {
  return listIntegrations(orgId);
}

async function findIntegration(
  orgId: string,
  provider: IntegrationProvider,
): Promise<Integration | null> {
  const all = await listIntegrations(orgId);
  return all.find((i) => i.provider === provider) ?? null;
}

export interface IntegrationMutationResult {
  provider: IntegrationProvider;
  integration: Integration | null;
}

/** Fetch the current integration and return it merged with an optimistic patch. */
async function patchIntegration(
  orgId: string,
  provider: IntegrationProvider,
  patch: Partial<Integration>,
): Promise<IntegrationMutationResult> {
  const current = await findIntegration(orgId, provider);
  return { provider, integration: current ? { ...current, ...patch } : null };
}

export async function connectIntegrationAction(
  orgId: string,
  provider: IntegrationProvider,
): Promise<IntegrationMutationResult> {
  return patchIntegration(orgId, provider, {
    status: "connected",
    lastSyncedAt: DEMO_NOW_ISO,
  });
}

export async function disconnectIntegrationAction(
  orgId: string,
  provider: IntegrationProvider,
): Promise<IntegrationMutationResult> {
  return patchIntegration(orgId, provider, {
    status: "not_connected",
    lastSyncedAt: null,
  });
}

export async function syncIntegrationAction(
  orgId: string,
  provider: IntegrationProvider,
): Promise<IntegrationMutationResult> {
  try {
    await syncIntegration(orgId, provider);
  } catch {
    if (!USE_MOCK) throw new Error(`Failed to sync ${provider}`);
  }
  return patchIntegration(orgId, provider, { lastSyncedAt: DEMO_NOW_ISO });
}
