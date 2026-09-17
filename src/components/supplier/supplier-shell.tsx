import type { ReactNode } from "react";
import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  PackageSearch,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import type { CurrentUser } from "@/lib/auth/session";
import {
  getUnreadNotificationCount,
  notificationBadge,
} from "@/lib/notifications/data";

const supplierNavigation = [
  { label: "Overview", href: "/supplier", icon: LayoutDashboard },
  { label: "Products", href: "/supplier/products", icon: PackageSearch },
  { label: "Orders", href: "/supplier/orders", icon: ClipboardList },
];

type SupplierShellProps = {
  activeHref:
    "/supplier" | "/supplier/products" | "/supplier/orders" | "/notifications";
  children: ReactNode;
  unreadCount?: number;
  user: CurrentUser;
};

export async function SupplierShell({
  activeHref,
  children,
  unreadCount,
  user,
}: SupplierShellProps) {
  const resolvedUnreadCount =
    unreadCount ?? (await getUnreadNotificationCount(user.id));
  const badge = notificationBadge(resolvedUnreadCount);
  const navigation = [
    ...supplierNavigation,
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
      roleLabel="Supplier"
      userName={user.name}
      userEmail={user.email}
    >
      {children}
    </AppShell>
  );
}
