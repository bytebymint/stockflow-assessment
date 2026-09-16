import Link from "next/link";
import { ArrowLeft, PackageX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProductNotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="border-border bg-card shadow-card w-full rounded-2xl border p-6 text-center sm:p-10">
        <span className="bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-xl">
          <PackageX className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Product not available
        </h1>
        <p className="text-muted-foreground mx-auto mt-2 max-w-lg leading-7">
          This product does not exist, has been archived, or belongs to a
          supplier that is not publicly approved.
        </p>
        <Link href="/products" className={cn(buttonVariants(), "mt-6")}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          Back to catalog
        </Link>
      </div>
    </main>
  );
}
