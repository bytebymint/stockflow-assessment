"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function DashboardErrorState({ workspace }: { workspace: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <EmptyState
      icon={TriangleAlert}
      title={`${workspace} dashboard could not be loaded`}
      description="The operational data is temporarily unavailable. Retry the dashboard without leaving your workspace."
      className="py-16"
      action={
        <Button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => router.refresh())}
        >
          <RotateCcw data-icon="inline-start" aria-hidden="true" />
          {isPending ? "Retrying…" : "Retry dashboard"}
        </Button>
      }
    />
  );
}
