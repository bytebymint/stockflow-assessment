"use client";

import { BellRing, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function NotificationsErrorState({ reset }: { reset: () => void }) {
  return (
    <EmptyState
      icon={BellRing}
      title="Notifications could not be loaded"
      description="There was a problem reaching your activity inbox. Try again without leaving this page."
      action={
        <Button type="button" onClick={reset}>
          <RotateCcw data-icon="inline-start" aria-hidden="true" />
          Try again
        </Button>
      }
    />
  );
}
