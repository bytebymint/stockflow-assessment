import "server-only";

import { cache } from "react";

import { getDatabase } from "@/lib/database";

export const getUnreadNotificationCount = cache(async (userId: string) => {
  return getDatabase().notification.count({
    where: { userId, readAt: null },
  });
});

export async function getNotificationsForUser(userId: string) {
  return getDatabase().notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      href: true,
      readAt: true,
      createdAt: true,
    },
  });
}

export type NotificationListEntry = Awaited<
  ReturnType<typeof getNotificationsForUser>
>[number];

export function notificationBadge(count: number) {
  if (count <= 0) return undefined;
  return count > 99 ? "99+" : String(count);
}
