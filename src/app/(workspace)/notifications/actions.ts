"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase } from "@/lib/database";

export type NotificationActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const notificationIdSchema = z.string().uuid();

function refreshNotificationView() {
  revalidatePath("/notifications");
}

export async function markNotificationRead(
  _previousState: NotificationActionState,
  formData: FormData,
): Promise<NotificationActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      status: "error",
      message: "Your session ended. Sign in again to update notifications.",
    };
  }

  const notificationId = notificationIdSchema.safeParse(
    formData.get("notificationId"),
  );

  if (!notificationId.success) {
    return {
      status: "error",
      message: "This notification is invalid. Refresh the page and try again.",
    };
  }

  try {
    const result = await getDatabase().notification.updateMany({
      where: {
        id: notificationId.data,
        userId: user.id,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    refreshNotificationView();

    return result.count === 1
      ? { status: "success", message: "Notification marked as read." }
      : {
          status: "success",
          message: "Notification was already read or is no longer available.",
        };
  } catch {
    return {
      status: "error",
      message: "The notification could not be updated. Please try again.",
    };
  }
}

export async function markAllNotificationsRead(
  _previousState: NotificationActionState,
  _formData: FormData,
): Promise<NotificationActionState> {
  void _previousState;
  void _formData;

  const user = await getCurrentUser();

  if (!user) {
    return {
      status: "error",
      message: "Your session ended. Sign in again to update notifications.",
    };
  }

  try {
    const result = await getDatabase().notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });

    refreshNotificationView();

    return {
      status: "success",
      message:
        result.count === 0
          ? "All notifications were already read."
          : `${result.count} ${result.count === 1 ? "notification" : "notifications"} marked as read.`,
    };
  } catch {
    return {
      status: "error",
      message: "Notifications could not be updated. Please try again.",
    };
  }
}
