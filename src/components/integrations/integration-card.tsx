"use client";

import { Loader2, Plug, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/ui-ext/status-badge";
import { Button } from "@/components/ui/button";
import {
  useConnectIntegration,
  useDisconnectIntegration,
  useSyncIntegration,
} from "@/hooks/use-integrations";
import { CURRENT_ORG_ID } from "@/lib/config";
import type { Integration } from "@/lib/types";
import { cn } from "@/lib/utils";

import { PROVIDER_ICON, relativeSyncLabel } from "./provider-meta";

interface IntegrationCardProps {
  integration: Integration;
  orgId?: string;
}

/**
 * A single provider card in the integrations grid. Connected providers show a
 * green status badge + relative sync time + Manage/Sync controls; disconnected
 * providers show a full-width Connect button. All mutations go through the
 * React Query hooks (optimistic).
 */
export function IntegrationCard({
  integration,
  orgId = CURRENT_ORG_ID,
}: IntegrationCardProps) {
  const Icon = PROVIDER_ICON[integration.provider];
  const isConnected = integration.status === "connected";
  const syncLabel = relativeSyncLabel(integration.lastSyncedAt);

  const connect = useConnectIntegration(orgId);
  const disconnect = useDisconnectIntegration(orgId);
  const sync = useSyncIntegration(orgId);

  const connecting = connect.isPending;
  const syncing = sync.isPending;
  const disconnecting = disconnect.isPending;

  function handleConnect() {
    connect.mutate(integration.provider, {
      onSuccess: () => toast.success(`${integration.name} connected`),
      onError: () => toast.error(`Couldn't connect ${integration.name}`),
    });
  }

  function handleSync() {
    sync.mutate(integration.provider, {
      onSuccess: () => toast.success(`${integration.name} synced`),
      onError: () => toast.error(`Couldn't sync ${integration.name}`),
    });
  }

  function handleDisconnect() {
    disconnect.mutate(integration.provider, {
      onSuccess: () => toast.success(`${integration.name} disconnected`),
      onError: () => toast.error(`Couldn't disconnect ${integration.name}`),
    });
  }

  return (
    <div className="flex min-h-[184px] flex-col justify-between gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-row items-start justify-between gap-2">
          <div className="flex size-11 items-center justify-center rounded-md border border-border bg-surface-subtle">
            <Icon className="size-[22px] text-foreground" strokeWidth={1.75} />
          </div>
          {isConnected ? <StatusBadge status="connected" /> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-semibold leading-none text-foreground">
            {integration.name}
          </p>
          <p className="text-[13px] leading-[18px] text-muted-foreground">
            {integration.description}
          </p>
        </div>
      </div>

      {isConnected ? (
        <div className="flex flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs text-text-tertiary transition-colors hover:text-foreground disabled:opacity-60",
            )}
            title="Sync now"
          >
            <RefreshCw
              className={cn("size-[13px]", syncing && "animate-spin")}
            />
            {syncing ? "Syncing…" : syncLabel ? `Synced ${syncLabel}` : "Sync now"}
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={disconnecting}
          >
            {disconnecting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            Manage
          </Button>
        </div>
      ) : (
        <Button className="w-full" onClick={handleConnect} disabled={connecting}>
          {connecting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Plug className="size-3.5" />
          )}
          Connect
        </Button>
      )}
    </div>
  );
}
