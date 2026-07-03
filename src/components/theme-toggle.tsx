"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

type ThemeValue = (typeof OPTIONS)[number]["value"];

/**
 * Light / Dark / System theme toggle backed by next-themes.
 *
 * - `variant="dropdown"` (default): an icon button that opens a menu.
 * - `variant="segmented"`: an inline 3-way segmented control (used by Settings).
 */
export function ThemeToggle({
  variant = "dropdown",
  className,
}: {
  variant?: "dropdown" | "segmented";
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  // Avoid a hydration mismatch: the resolved theme is only known on the client.
  // useSyncExternalStore returns the server snapshot (false) during SSR and the
  // client snapshot (true) after hydration — no setState-in-effect required.
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const current: ThemeValue = mounted ? ((theme as ThemeValue) ?? "system") : "system";

  if (variant === "segmented") {
    return (
      <div
        role="radiogroup"
        aria-label="Theme"
        className={cn(
          "inline-flex flex-row items-center gap-1 rounded-md border border-border bg-surface-subtle p-1",
          className,
        )}
      >
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = mounted && current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "flex flex-row items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={className}>
          <Sun className="size-[18px] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-[18px] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <DropdownMenuItem key={opt.value} onClick={() => setTheme(opt.value)}>
              <Icon className="size-4" />
              {opt.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
