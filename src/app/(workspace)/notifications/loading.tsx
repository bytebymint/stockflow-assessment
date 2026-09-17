import { NotificationPageSkeleton } from "@/components/notifications/notification-page-skeleton";

export default function NotificationsLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <NotificationPageSkeleton />
    </main>
  );
}
