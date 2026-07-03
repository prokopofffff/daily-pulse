"use client";

import { useState } from "react";
import { ArrowUpRight, Calendar, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const RANGES = [
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7", label: "Last 7 days" },
  { value: "last_30", label: "Last 30 days" },
  { value: "this_week", label: "This week" },
];

/**
 * Dashboard header actions: a "Yesterday" range dropdown and a "Share report"
 * primary button. Client-side only — the range is a local UI affordance.
 */
export function DashboardActions() {
  const [range, setRange] = useState("yesterday");
  const activeLabel =
    RANGES.find((r) => r.value === range)?.label ?? "Yesterday";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex flex-row items-center gap-2 rounded-[9px] border border-input bg-card px-[13px] py-[9px] text-[13px] font-medium text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring/50">
          <Calendar className="size-[15px] text-muted-foreground" />
          {activeLabel}
          <ChevronDown className="size-[14px] text-text-tertiary" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuRadioGroup value={range} onValueChange={setRange}>
            {RANGES.map((r) => (
              <DropdownMenuRadioItem key={r.value} value={r.value}>
                {r.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        type="button"
        onClick={() =>
          toast.success("Report shared", {
            description: "A link to yesterday's summary was copied to your clipboard.",
          })
        }
        className="flex flex-row items-center gap-[7px] rounded-[9px] bg-primary px-[14px] py-[9px] text-[13px] font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <ArrowUpRight className="size-[15px]" />
        Share report
      </button>
    </>
  );
}
