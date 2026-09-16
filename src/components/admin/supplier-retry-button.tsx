"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SupplierRetryButton() {
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
        <RefreshCw aria-hidden="true" />
      )}
      {isPending ? "Retrying…" : "Retry"}
    </Button>
  );
}
