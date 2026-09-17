import type { ReactNode } from "react";
import { Bell, ClipboardList, UserRound } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import type { CurrentUser } from "@/lib/auth/session";
import {
  getUnreadNotificationCount,
  notificationBadge,
} from "@/lib/notifications/data";

const customerNavigation = [
  { label: "Account", href: "/account", icon: UserRound },
  { label: "Orders", href: "/orders", icon: ClipboardList },
];

type CustomerShellProps = {
  activeHref: "/account" | "/orders" | "/notifications";
  children: ReactNode;
  unreadCount?: number;
  user: CurrentUser;
};

export async function CustomerShell({
  activeHref,
  children,
  unreadCount,
  user,
}: CustomerShellProps) {
  const resolvedUnreadCount =
    unreadCount ?? (await getUnreadNotificationCount(user.id));
  const badge = notificationBadge(resolvedUnreadCount);
  const navigation = [
    ...customerNavigation,
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge,
      badgeLabel: badge ? `${resolvedUnreadCount} unread` : undefined,
    },
  ];

  return (
    <AppShell
      navigation={navigation}
      activeHref={activeHref}
      roleLabel="Customer"
      userName={user.name}
      userEmail={user.email}
    >
      {children}
    </AppShell>
  );
}
