import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { StockFlowLogo } from "@/components/brand/stockflow-logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AppNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeLabel?: string;
};

type AppShellProps = {
  children: ReactNode;
  navigation: AppNavigationItem[];
  activeHref: string;
  roleLabel: string;
  userName: string;
  userEmail: string;
};

export function AppShell({
  children,
  navigation,
  activeHref,
  roleLabel,
  userName,
  userEmail,
}: AppShellProps) {
  return (
    <div className="bg-background min-h-dvh max-w-full min-w-0 overflow-x-hidden lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <a
        href="#workspace-content"
        className="bg-primary text-primary-foreground shadow-float fixed top-3 left-3 z-[100] -translate-y-20 rounded-lg px-4 py-3 text-sm font-semibold transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

      <aside className="border-sidebar-border bg-sidebar text-sidebar-foreground hidden min-h-dvh flex-col border-r px-4 py-5 lg:flex">
        <StockFlowLogo inverse />
        <Badge className="border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground mt-3 w-fit">
          {roleLabel}
        </Badge>

        <nav
          className="mt-8 flex flex-1 flex-col gap-1"
          aria-label={`${roleLabel} navigation`}
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === activeHref;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={
                  item.badgeLabel
                    ? `${item.label}, ${item.badgeLabel}`
                    : undefined
                }
                className={cn(
                  "focus-visible:ring-sidebar-ring/50 flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-200 focus-visible:ring-3 focus-visible:outline-none",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge ? (
                  <span
                    className="bg-sidebar-primary text-sidebar-primary-foreground ml-auto rounded-full px-2 py-0.5 text-xs font-bold"
                    aria-hidden="true"
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-sidebar-border space-y-2 border-t pt-4">
          <div className="flex min-h-11 items-center gap-3 px-2">
            <span className="bg-sidebar-primary text-sidebar-primary-foreground flex size-9 items-center justify-center rounded-full text-sm font-bold">
              {userName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">
                {userName}
              </span>
              <span
                className="text-sidebar-foreground/65 block truncate text-xs"
                title={userEmail}
              >
                {userEmail}
              </span>
            </span>
          </div>
          <SignOutButton inverse />
        </div>
      </aside>

      <div className="max-w-full min-w-0 overflow-x-hidden">
        <header className="border-border/70 bg-background/90 sticky top-0 z-30 flex h-16 min-w-0 items-center justify-between gap-3 border-b px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="lg:hidden">
            <StockFlowLogo />
          </div>
          <p className="text-muted-foreground hidden text-sm font-medium lg:block">
            {roleLabel} workspace
          </p>
          <div className="flex min-w-0 items-center gap-2 lg:hidden">
            <span className="text-muted-foreground max-w-36 truncate text-xs font-medium sm:max-w-64">
              {userName}
            </span>
            <SignOutButton compact />
          </div>
        </header>

        <main
          id="workspace-content"
          className="max-w-full min-w-0 overflow-x-hidden px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-8"
        >
          {children}
        </main>
      </div>

      <nav
        className="border-border bg-card/95 fixed inset-x-0 bottom-0 z-40 grid border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgb(15_23_42_/_0.08)] backdrop-blur-xl lg:hidden"
        style={{
          gridTemplateColumns: `repeat(${Math.min(navigation.length, 5)}, minmax(0, 1fr))`,
        }}
        aria-label={`${roleLabel} mobile navigation`}
      >
        {navigation.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = item.href === activeHref;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              aria-label={
                item.badgeLabel
                  ? `${item.label}, ${item.badgeLabel}`
                  : undefined
              }
              className={cn(
                "focus-visible:ring-ring/30 relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[0.68rem] font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none sm:text-xs",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="max-w-full truncate">{item.label}</span>
              {item.badge ? (
                <span
                  className="bg-primary text-primary-foreground absolute top-1.5 left-[calc(50%+0.4rem)] min-w-4 rounded-full px-1 text-center text-[0.625rem] leading-4"
                  aria-hidden="true"
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
