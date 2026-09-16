"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ProductRetryButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {isPending ? (
        <LoaderCircle className="animate-spin" aria-hidden="true" />
      ) : (
        <RotateCcw aria-hidden="true" />
      )}
      {isPending ? "Retrying…" : "Retry"}
    </Button>
  );
}
