"use server";

/**
 * Server actions for organization / settings.
 *
 * Reads delegate to the data layer. Updating org settings is an optimistic
 * mock merge when USE_MOCK (no persistence yet).
 */

import { getOrganization, listOrganizations } from "@/lib/data";
import type { Organization } from "@/lib/types";

export async function getOrganizationAction(
  orgId: string,
): Promise<Organization | null> {
  return getOrganization(orgId);
}

export async function listOrganizationsAction(): Promise<Organization[]> {
  return listOrganizations();
}

export interface OrganizationSettingsInput {
  name?: string;
  slug?: string;
  timezone?: string;
  reportTime?: string;
  accentColor?: string;
  logoUrl?: string | null;
}

/** Patch organization settings; optimistic merge in mock mode. */
export async function updateOrganizationAction(
  orgId: string,
  patch: OrganizationSettingsInput,
): Promise<Organization | null> {
  const current = await getOrganization(orgId);
  if (!current) return null;
  return { ...current, ...patch };
}
