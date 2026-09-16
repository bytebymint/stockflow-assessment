"use client";

import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProductsError({ reset }: { reset: () => void }) {
  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="border-border bg-card shadow-card w-full rounded-2xl border p-6 text-center sm:p-10">
        <span className="bg-destructive/10 text-destructive mx-auto flex size-12 items-center justify-center rounded-xl">
          <TriangleAlert className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          The catalog could not be loaded
        </h1>
        <p className="text-muted-foreground mx-auto mt-2 max-w-lg leading-7">
          Product availability is temporarily unavailable. Retry the request or
          return to the StockFlow home page.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>
            <RefreshCw data-icon="inline-start" aria-hidden="true" />
            Retry catalog
          </Button>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
