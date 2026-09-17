import Link from "next/link";
import {
  Ban,
  BellOff,
  Box,
  ExternalLink,
  ShieldCheck,
  TriangleAlert,
  Truck,
  type LucideIcon,
} from "lucide-react";

import {
  MarkAllNotificationsReadButton,
  MarkNotificationReadButton,
} from "@/components/notifications/notification-actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import type { NotificationListEntry } from "@/lib/notifications/data";
import { cn } from "@/lib/utils";

const notificationPresentation: Record<
  NotificationListEntry["type"],
  { icon: LucideIcon; label: string; className: string }
> = {
  ORDER_CREATED: {
    icon: Box,
    label: "New order",
    className: "bg-info-subtle text-info-foreground",
  },
  ORDER_STATUS_CHANGED: {
    icon: Truck,
    label: "Order update",
    className: "bg-info-subtle text-info-foreground",
  },
  ORDER_CANCELLED: {
    icon: Ban,
    label: "Cancellation",
    className: "bg-destructive/10 text-destructive",
  },
  LOW_STOCK: {
    icon: TriangleAlert,
    label: "Low stock",
    className: "bg-warning-subtle text-warning-foreground",
  },
  SUPPLIER_STATUS_CHANGED: {
    icon: ShieldCheck,
    label: "Supplier status",
    className: "bg-success-subtle text-success-foreground",
  },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function internalHref(href: string | null) {
  return href?.startsWith("/") && !href.startsWith("//") ? href : null;
}

function NotificationCard({
  notification,
}: {
  notification: NotificationListEntry;
}) {
  const presentation = notificationPresentation[notification.type];
  const Icon = presentation.icon;
  const href = internalHref(notification.href);
  const unread = notification.readAt === null;

  return (
    <li
      className={cn(
        "border-border/80 bg-card shadow-card rounded-2xl border p-4 sm:p-5",
        unread && "border-primary/25 ring-primary/10 ring-1",
      )}
    >
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            presentation.className,
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{presentation.label}</Badge>
            {unread ? (
              <Badge className="bg-primary text-primary-foreground">
                Unread
              </Badge>
            ) : (
              <span className="text-muted-foreground text-xs">Read</span>
            )}
          </div>

          <h2 className="text-foreground mt-3 text-base leading-6 font-semibold sm:text-lg">
            {notification.title}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {notification.message}
          </p>
          <p className="text-muted-foreground mt-3 text-xs">
            <time dateTime={notification.createdAt.toISOString()}>
              {formatDate(notification.createdAt)}
            </time>
          </p>

          <div className="mt-4 flex flex-wrap items-start gap-2">
            {href ? (
              <Link
                href={href}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                View details
                <ExternalLink data-icon="inline-end" aria-hidden="true" />
              </Link>
            ) : null}
            {unread ? (
              <MarkNotificationReadButton notificationId={notification.id} />
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}

export function NotificationCenter({
  notifications,
}: {
  notifications: NotificationListEntry[];
}) {
  const unread = notifications.filter(
    (notification) => notification.readAt === null,
  );
  const read = notifications.filter(
    (notification) => notification.readAt !== null,
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-7">
      <PageHeader
        eyebrow="Activity inbox"
        title="Notifications"
        description="Keep track of order activity, inventory warnings, and account updates in one place."
        actions={<MarkAllNotificationsReadButton unreadCount={unread.length} />}
      />

      <p className="text-muted-foreground text-sm" aria-live="polite">
        {unread.length === 0
          ? "You have no unread notifications."
          : `${unread.length} unread ${unread.length === 1 ? "notification" : "notifications"}.`}
      </p>

      {notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="No notifications yet"
          description="Order activity, stock warnings, and account updates will appear here when they need your attention."
        />
      ) : (
        <div className="space-y-8">
          {unread.length > 0 ? (
            <section aria-labelledby="unread-notifications-title">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2
                  id="unread-notifications-title"
                  className="text-base font-semibold"
                >
                  Unread
                </h2>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {unread.length}
                </span>
              </div>
              <ol className="space-y-3">
                {unread.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </ol>
            </section>
          ) : null}

          {read.length > 0 ? (
            <section aria-labelledby="earlier-notifications-title">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2
                  id="earlier-notifications-title"
                  className="text-base font-semibold"
                >
                  Earlier
                </h2>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {read.length}
                </span>
              </div>
              <ol className="space-y-3">
                {read.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </ol>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
