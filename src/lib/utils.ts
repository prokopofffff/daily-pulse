import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { User } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** The user's first name (explicit `firstName`, else the first token of `name`). */
export function userFirstName(user: Pick<User, "name" | "firstName">): string {
  return user.firstName ?? user.name.trim().split(/\s+/)[0] ?? "";
}

/**
 * Two-letter avatar initials for a user. Uses explicit `avatarInitials` when
 * present, otherwise the first two letters of the first name
 * (e.g. "Alex Rivera" -> "AL").
 */
export function userInitials(
  user: Pick<User, "name" | "avatarInitials" | "firstName">,
): string {
  if (user.avatarInitials) return user.avatarInitials;
  const first = userFirstName(user);
  return first.slice(0, 2).toUpperCase();
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatPercent(value: number, signed = true) {
  const s = `${Math.abs(value).toFixed(1)}%`;
  if (!signed) return s;
  return `${value >= 0 ? "+" : "−"}${s}`;
}
