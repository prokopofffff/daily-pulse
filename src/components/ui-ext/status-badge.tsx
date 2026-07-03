import { cn } from "@/lib/utils";

export type StatusBadgeStatus = "connected" | "not_connected";

interface StatusBadgeProps {
  status: StatusBadgeStatus;
  /** Override the default "Connected" / "Not connected" text. */
  label?: string;
  /**
   * Extra classes on the outer pill. Used to reconcile the small padding
   * differences between the two call sites (integration card vs channel row)
   * so rendered output stays byte-for-byte identical.
   */
  className?: string;
}

/**
 * The green "Connected" (success tokens) / neutral "Not connected" (muted)
 * status pill shared by the integration card and the notification channel row.
 * A leading dot is shown only in the connected state.
 */
export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const isConnected = status === "connected";
  const text = label ?? (isConnected ? "Connected" : "Not connected");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        isConnected
          ? "bg-success-subtle text-success"
          : "bg-surface-subtle text-text-tertiary",
        className,
      )}
    >
      {isConnected ? <span className="size-1.5 rounded-full bg-success" /> : null}
      {text}
    </span>
  );
}
