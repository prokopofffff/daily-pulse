"use client";

import { useState } from "react";
import { Check, Copy, Webhook } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CURRENT_ORG_ID } from "@/lib/config";

interface WebhookCardProps {
  orgId?: string;
}

/**
 * Webhook ingestion card — surfaces the org-scoped POST endpoint that external
 * systems can push events to, with a one-click copy affordance.
 */
export function WebhookCard({ orgId = CURRENT_ORG_ID }: WebhookCardProps) {
  const endpoint = `https://api.dailypulse.app/v1/ingest/${orgId}`;
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(endpoint);
      setCopied(true);
      toast.success("Endpoint copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy endpoint");
    }
  }

  return (
    <div className="flex min-h-[184px] flex-col justify-between gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-row items-start justify-between gap-2">
          <div className="flex size-11 items-center justify-center rounded-md border border-border bg-surface-subtle">
            <Webhook className="size-[22px] text-foreground" strokeWidth={1.75} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-semibold leading-none text-foreground">
            Webhook ingestion
          </p>
          <p className="text-[13px] leading-[18px] text-muted-foreground">
            POST your events to this endpoint to feed Daily Pulse.
          </p>
        </div>
      </div>

      <div className="flex flex-row items-center gap-2 rounded-sm border border-border bg-surface-subtle p-1 pl-2.5">
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-text-secondary">
          {endpoint}
        </code>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={copy}
          aria-label="Copy endpoint URL"
        >
          {copied ? (
            <Check className="size-3.5 text-success" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
