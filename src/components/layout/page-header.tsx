import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Right-aligned actions slot (buttons, dropdowns, etc.). */
  actions?: ReactNode;
  className?: string;
}

/**
 * White page header bar with a bottom border.
 * Title (text-2xl font-semibold) + optional subtitle, with a right-aligned
 * actions slot. Matches the design's top bar.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex w-full shrink-0 flex-row items-start justify-between gap-4 border-b border-border bg-card px-8 py-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-row items-center gap-2.5">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export interface PageShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * Scrollable page content region. Sits under a <PageHeader/>, painted on the
 * subtle surface with 32px padding and vertical rhythm between sections.
 */
export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto bg-surface-subtle p-8",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
        {children}
      </div>
    </div>
  );
}
