"use client";

import { useActionState, useEffect } from "react";
import { Check, CheckCheck, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import {
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationActionState,
} from "@/app/(workspace)/notifications/actions";
import { Button } from "@/components/ui/button";

const initialState: NotificationActionState = { status: "idle" };

function useActionFeedback(state: NotificationActionState) {
  useEffect(() => {
    if (!state.message) return;

    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);
}

export function MarkNotificationReadButton({
  notificationId,
}: {
  notificationId: string;
}) {
  const [state, formAction, pending] = useActionState(
    markNotificationRead,
    initialState,
  );
  useActionFeedback(state);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="notificationId" value={notificationId} />
        <Button type="submit" variant="ghost" size="sm" disabled={pending}>
          {pending ? (
            <LoaderCircle
              className="animate-spin motion-reduce:animate-none"
              data-icon="inline-start"
              aria-hidden="true"
            />
          ) : (
            <Check data-icon="inline-start" aria-hidden="true" />
          )}
          {pending ? "Marking…" : "Mark read"}
        </Button>
      </form>
      {state.status === "error" && state.message ? (
        <p className="text-destructive mt-1 max-w-52 text-xs" role="alert">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

export function MarkAllNotificationsReadButton({
  unreadCount,
}: {
  unreadCount: number;
}) {
  const [state, formAction, pending] = useActionState(
    markAllNotificationsRead,
    initialState,
  );
  useActionFeedback(state);

  return (
    <div>
      <form action={formAction}>
        <Button
          type="submit"
          variant="outline"
          disabled={pending || unreadCount === 0}
        >
          {pending ? (
            <LoaderCircle
              className="animate-spin motion-reduce:animate-none"
              data-icon="inline-start"
              aria-hidden="true"
            />
          ) : (
            <CheckCheck data-icon="inline-start" aria-hidden="true" />
          )}
          {pending ? "Marking all…" : "Mark all as read"}
        </Button>
      </form>
      {state.status === "error" && state.message ? (
        <p className="text-destructive mt-1 max-w-64 text-xs" role="alert">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
