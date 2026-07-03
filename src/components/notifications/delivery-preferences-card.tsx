"use client";

import { AlarmClock } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import type { DeliveryPreferences } from "@/lib/types";

import type { DeliveryPreferencesInput } from "@/app/actions/notifications";

/** "08:00" -> "8:00 AM" (deterministic, no locale/Date dependency). */
export function formatSendTime(sendTime: string): string {
  const [rawH, rawM = "00"] = sendTime.split(":");
  const h24 = Number.parseInt(rawH ?? "0", 10);
  const minutes = rawM.padStart(2, "0");
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${minutes} ${period}`;
}

interface PreferenceRowProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  pending?: boolean;
}

function PreferenceRow({
  title,
  description,
  checked,
  onCheckedChange,
  pending,
}: PreferenceRowProps) {
  return (
    <div className="flex w-full flex-row items-center gap-4 border-t border-border px-5 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-[13px] text-muted-foreground">{description}</span>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={pending}
        aria-label={`Toggle ${title}`}
      />
    </div>
  );
}

export interface DeliveryPreferencesCardProps {
  preferences: DeliveryPreferences;
  onPatch: (patch: DeliveryPreferencesInput) => void;
  pending?: boolean;
}

/**
 * "Delivery preferences" card: header + rows for Daily summary, Critical
 * alerts, Weekly digest and a Send time value. Matches the design markup.
 */
export function DeliveryPreferencesCard({
  preferences,
  onPatch,
  pending = false,
}: DeliveryPreferencesCardProps) {
  return (
    <div className="flex w-full flex-col rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-1 px-5 pb-4 pt-5">
        <h2 className="text-base font-semibold leading-tight text-foreground">
          Delivery preferences
        </h2>
        <p className="text-[13px] text-muted-foreground">
          Control which reports you receive and when.
        </p>
      </div>

      <PreferenceRow
        title="Daily summary"
        description="A concise recap of yesterday's performance."
        checked={preferences.dailySummary}
        onCheckedChange={(v) => onPatch({ dailySummary: v })}
        pending={pending}
      />
      <PreferenceRow
        title="Critical alerts"
        description="Real-time pings when a key metric moves sharply."
        checked={preferences.criticalAlerts}
        onCheckedChange={(v) => onPatch({ criticalAlerts: v })}
        pending={pending}
      />
      <PreferenceRow
        title="Weekly digest"
        description="A rollup of trends every Monday morning."
        checked={preferences.weeklyDigest}
        onCheckedChange={(v) => onPatch({ weeklyDigest: v })}
        pending={pending}
      />

      <div className="flex w-full flex-row items-center gap-4 border-t border-border px-5 py-4">
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span className="text-sm font-medium text-foreground">Send time</span>
          <span className="text-[13px] text-muted-foreground">
            When your daily report lands in each channel.
          </span>
        </div>
        <div className="flex shrink-0 flex-row items-center gap-2 rounded-sm border border-input bg-card px-3.5 py-[9px]">
          <AlarmClock className="size-4 text-muted-foreground" />
          <span className="text-[13px] font-medium text-foreground">
            {formatSendTime(preferences.sendTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
