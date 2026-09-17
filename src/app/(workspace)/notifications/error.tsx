"use client";

import { NotificationsErrorState } from "@/components/notifications/notifications-error-state";

export default function NotificationsError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <NotificationsErrorState reset={reset} />
    </main>
  );
}
