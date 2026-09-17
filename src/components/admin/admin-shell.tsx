import type { ReactNode } from "react";
import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  Tags,
  UserRoundCheck,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import type { CurrentUser } from "@/lib/auth/session";
import {
  getUnreadNotificationCount,
  notificationBadge,
} from "@/lib/notifications/data";

const adminNavigation = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  {
    label: "Suppliers",
    href: "/admin/suppliers",
    icon: UserRoundCheck,
  },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
];

type AdminShellProps = {
  activeHref:
    | "/admin"
    | "/admin/categories"
    | "/admin/suppliers"
    | "/admin/orders"
    | "/notifications";
  children: ReactNode;
  unreadCount?: number;
  user: CurrentUser;
};

export async function AdminShell({
  activeHref,
  children,
  unreadCount,
  user,
}: AdminShellProps) {
  const resolvedUnreadCount =
    unreadCount ?? (await getUnreadNotificationCount(user.id));
  const badge = notificationBadge(resolvedUnreadCount);
  const navigation = [
    ...adminNavigation,
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
      roleLabel="Administrator"
      userName={user.name}
      userEmail={user.email}
    >
      {children}
    </AppShell>
  );
}
