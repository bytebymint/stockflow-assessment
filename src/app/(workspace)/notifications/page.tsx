import type { Metadata } from "next";
import { Bell, Clock3 } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { CustomerShell } from "@/components/customer/customer-shell";
import { AppShell } from "@/components/layout/app-shell";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { SupplierShell } from "@/components/supplier/supplier-shell";
import { requireUser } from "@/lib/auth/session";
import {
  getNotificationsForUser,
  notificationBadge,
} from "@/lib/notifications/data";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Review order, inventory, and account activity in StockFlow.",
};

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getNotificationsForUser(user.id);
  const unreadCount = notifications.filter(
    (notification) => notification.readAt === null,
  ).length;
  const content = <NotificationCenter notifications={notifications} />;

  if (user.role === "ADMIN") {
    return (
      <AdminShell
        activeHref="/notifications"
        unreadCount={unreadCount}
        user={user}
      >
        {content}
      </AdminShell>
    );
  }

  if (user.role === "CUSTOMER") {
    return (
      <CustomerShell
        activeHref="/notifications"
        unreadCount={unreadCount}
        user={user}
      >
        {content}
      </CustomerShell>
    );
  }

  if (user.supplierStatus === "APPROVED") {
    return (
      <SupplierShell
        activeHref="/notifications"
        unreadCount={unreadCount}
        user={user}
      >
        {content}
      </SupplierShell>
    );
  }

  const badge = notificationBadge(unreadCount);

  return (
    <AppShell
      navigation={[
        { label: "Account status", href: "/supplier/status", icon: Clock3 },
        {
          label: "Notifications",
          href: "/notifications",
          icon: Bell,
          badge,
          badgeLabel: badge ? `${unreadCount} unread` : undefined,
        },
      ]}
      activeHref="/notifications"
      roleLabel="Supplier applicant"
      userName={user.name}
      userEmail={user.email}
    >
      {content}
    </AppShell>
  );
}
