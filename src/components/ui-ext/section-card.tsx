import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SectionCardProps {
  /** Card title rendered in the header. Omit for a header-less card. */
  title?: ReactNode;
  /** Optional secondary text under the title. */
  description?: ReactNode;
  /** Right-aligned header slot (actions, badges, filters). */
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Extra classes for the header row. */
  headerClassName?: string;
  /** Extra classes for the body wrapper. */
  bodyClassName?: string;
  /** Remove default body padding (useful for tables / full-bleed content). */
  noBodyPadding?: boolean;
}

/**
 * Generic white surface card (bg-card, 1px border, rounded-lg) with an optional
 * header (title + right slot). The shared container used across pages.
 */
export function SectionCard({
  title,
  description,
  headerRight,
  children,
  className,
  headerClassName,
  bodyClassName,
  noBodyPadding = false,
}: SectionCardProps) {
  const hasHeader = title != null || description != null || headerRight != null;

  return (
    <section
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card",
        className,
      )}
    >
      {hasHeader ? (
        <div
          className={cn(
            "flex flex-row items-start justify-between gap-4 px-5 pt-5",
            !noBodyPadding && "pb-4",
            headerClassName,
          )}
        >
          <div className="flex min-w-0 flex-col gap-1">
            {title != null ? (
              <h2 className="text-base font-semibold leading-tight text-foreground">
                {title}
              </h2>
            ) : null}
            {description != null ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {headerRight != null ? (
            <div className="flex shrink-0 flex-row items-center gap-2">
              {headerRight}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={cn(!noBodyPadding && "p-5", hasHeader && !noBodyPadding && "pt-0", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
