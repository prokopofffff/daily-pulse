"use client";

import * as React from "react";
import { AlarmClock, Upload } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { CURRENT_ORG_ID } from "@/lib/config";
import type { Organization } from "@/lib/types";
import { useUpdateOrganization } from "@/hooks/use-organization";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TIMEZONES = [
  { value: "America/Los_Angeles", label: "(GMT-08:00) Pacific Time" },
  { value: "America/Denver", label: "(GMT-07:00) Mountain Time" },
  { value: "America/Chicago", label: "(GMT-06:00) Central Time" },
  { value: "America/New_York", label: "(GMT-05:00) Eastern Time" },
  { value: "Etc/UTC", label: "(GMT+00:00) UTC" },
  { value: "Europe/London", label: "(GMT+00:00) London" },
  { value: "Europe/Berlin", label: "(GMT+01:00) Central European Time" },
  { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo" },
] as const;

const ACCENT_SWATCHES = [
  { value: "#2563EB", label: "Blue" },
  { value: "#0F0F10", label: "Black" },
  { value: "#16A34A", label: "Green" },
  { value: "#D97706", label: "Amber" },
  { value: "#DC2626", label: "Red" },
] as const;

/** Field wrapper: bordered pill-style control matching the design inputs. */
function SettingsRow({
  label,
  description,
  children,
  className,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t border-border p-6 first:border-t-0 md:flex-row md:gap-12",
        className,
      )}
    >
      <div className="flex w-full shrink-0 flex-col gap-1 md:w-60">
        <div className="text-[15px] font-semibold leading-none text-foreground">
          {label}
        </div>
        <p className="text-[13px] leading-[18px] text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4">{children}</div>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-[13px] font-medium text-muted-foreground"
    >
      {children}
    </Label>
  );
}

export interface SettingsFormProps {
  organization: Organization;
}

interface FormState {
  name: string;
  slug: string;
  timezone: string;
  reportTime: string;
  accentColor: string;
}

function toFormState(org: Organization): FormState {
  return {
    name: org.name,
    slug: org.slug,
    timezone: org.timezone,
    reportTime: org.reportTime,
    accentColor: org.accentColor,
  };
}

export function SettingsForm({ organization }: SettingsFormProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Single source of truth for the form. `form` is seeded from the org prop and
  // re-synced whenever the underlying org changes (e.g. after a successful
  // save) by tracking the last org we synced against. Adjusting state during
  // render is React's recommended alternative to an effect for deriving state
  // from props (avoids a cascading re-render).
  const [form, setForm] = React.useState<FormState>(() =>
    toFormState(organization),
  );
  const [syncedOrg, setSyncedOrg] = React.useState(organization);
  if (syncedOrg !== organization) {
    setSyncedOrg(organization);
    setForm(toFormState(organization));
  }

  const { mutate, isPending } = useUpdateOrganization(CURRENT_ORG_ID);

  const dirty =
    form.name !== syncedOrg.name ||
    form.slug !== syncedOrg.slug ||
    form.timezone !== syncedOrg.timezone ||
    form.reportTime !== syncedOrg.reportTime ||
    form.accentColor !== syncedOrg.accentColor;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    setForm(toFormState(syncedOrg));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty || isPending) return;
    mutate(
      {
        name: form.name.trim(),
        slug: form.slug.trim(),
        timezone: form.timezone,
        reportTime: form.reportTime,
        accentColor: form.accentColor,
      },
      {
        onSuccess: () => toast.success("Settings saved"),
        onError: () => toast.error("Could not save settings. Try again."),
      },
    );
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      toast.success(`Selected ${file.name}`);
    }
    // Reset so the same file can be re-selected.
    event.target.value = "";
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      <div className="flex flex-col rounded-lg border border-border bg-card">
        {/* Organization */}
        <SettingsRow
          label="Organization"
          description="Your company name and public workspace address."
        >
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="org-name">Organization name</FieldLabel>
            <Input
              id="org-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Acme Inc."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="org-slug">Workspace URL</FieldLabel>
            <div className="flex h-9 w-full items-center rounded-md border border-input bg-transparent pl-3 text-sm shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30">
              <span className="shrink-0 select-none text-text-tertiary">
                dailypulse.app/
              </span>
              <input
                id="org-slug"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="acme"
                className="h-full min-w-0 flex-1 bg-transparent pr-3 text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </SettingsRow>

        {/* Timezone */}
        <SettingsRow
          label="Timezone"
          description="Reports and alerts are scheduled in this timezone."
        >
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="org-timezone">Timezone</FieldLabel>
            <select
              id="org-timezone"
              value={form.timezone}
              onChange={(e) => set("timezone", e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </SettingsRow>

        {/* Daily report time */}
        <SettingsRow
          label="Daily report time"
          description="When your AI summary is generated each morning."
        >
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="org-report-time">Report time</FieldLabel>
            <div className="relative">
              <Input
                id="org-report-time"
                type="time"
                value={form.reportTime}
                onChange={(e) => set("reportTime", e.target.value)}
                className="pr-9"
              />
              <AlarmClock
                aria-hidden
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary"
              />
            </div>
          </div>
        </SettingsRow>

        {/* Theme */}
        <SettingsRow
          label="Theme"
          description="Choose how Daily Pulse looks for your account."
        >
          <ThemeToggle variant="segmented" />
        </SettingsRow>

        {/* Branding */}
        <SettingsRow
          label="Branding"
          description="Add your logo and pick the accent used across reports."
        >
          <div className="flex flex-row items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex size-16 shrink-0 items-center justify-center rounded-md border border-input bg-surface-subtle transition-colors hover:bg-surface-hover"
              aria-label="Upload logo"
            >
              <Upload className="size-5 text-text-tertiary" />
            </button>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="text-sm font-medium text-foreground">
                Upload logo
              </div>
              <div className="text-xs text-text-tertiary">
                PNG or SVG, up to 1MB
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.svg,image/png,image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose file
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel>Accent color</FieldLabel>
            <div
              role="radiogroup"
              aria-label="Accent color"
              className="flex flex-row items-center gap-3"
            >
              {ACCENT_SWATCHES.map((swatch) => {
                const active = form.accentColor === swatch.value;
                return (
                  <button
                    key={swatch.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={swatch.label}
                    onClick={() => set("accentColor", swatch.value)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border-2 transition-colors",
                      active ? "border-primary" : "border-transparent",
                    )}
                  >
                    <span
                      className="size-[22px] rounded-full"
                      style={{ backgroundColor: swatch.value }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </SettingsRow>
      </div>

      {/* Footer actions */}
      <div className="flex flex-row items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={!dirty || isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!dirty || isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
