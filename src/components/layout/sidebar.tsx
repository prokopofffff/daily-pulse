"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  FileText,
  Sparkles,
  Bell,
  Blocks,
  Settings,
  ChevronsUpDown,
  type LucideIcon,
} from "lucide-react";

import { cn, userInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { organizations, users } from "@/lib/mock-data";
import { CURRENT_ORG_ID } from "@/lib/config";
import type { Organization, User } from "@/lib/types";

/** Product name shown in the brand block (not tenant-specific). */
const BRAND_NAME = "Daily Pulse";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  org?: Organization | null;
  user?: User | null;
}

/** Seeded fallbacks so the component renders standalone (e.g. in tests). */
const fallbackOrg = organizations.find((o) => o.id === CURRENT_ORG_ID) ?? null;
const fallbackUser =
  users.find((u) => u.orgId === CURRENT_ORG_ID) ?? null;

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/integrations", label: "Integrations", icon: Blocks },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ org, user }: SidebarProps = {}) {
  const pathname = usePathname();

  const activeOrg = org ?? fallbackOrg;
  const activeUser = user ?? fallbackUser;
  const initials = activeUser ? userInitials(activeUser) : "";

  return (
    <aside className="hidden md:flex w-[248px] shrink-0 flex-col bg-sidebar border-r border-border min-h-screen">
      {/* Brand */}
      <div className="flex flex-row items-center gap-2.5 px-5 py-[22px]">
        <div className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-primary">
          <Activity className="size-[18px] text-primary-foreground" strokeWidth={2.25} />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold leading-none text-foreground">
            {BRAND_NAME}
          </span>
          <span className="mt-0.5 text-xs font-normal leading-none text-text-tertiary">
            {activeOrg?.name}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-row items-center gap-[11px] rounded-[9px] px-2.5 py-[9px] text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-text-secondary font-medium hover:bg-surface-hover hover:text-foreground",
              )}
            >
              <Icon
                className="size-[18px] shrink-0"
                strokeWidth={active ? 2.25 : 2}
              />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* User row */}
      <div className="flex flex-row items-center gap-2.5 border-t border-border px-4 pb-[18px] pt-3.5">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-px overflow-hidden">
          <span className="truncate text-[13px] font-semibold leading-none text-foreground">
            {activeUser?.name}
          </span>
          <span className="truncate text-[11px] font-normal leading-none text-text-tertiary">
            {activeUser?.email}
          </span>
        </div>
        <ChevronsUpDown className="size-[15px] shrink-0 text-text-tertiary" />
      </div>
    </aside>
  );
}
