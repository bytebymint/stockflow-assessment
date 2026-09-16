import Link from "next/link";

import { StockFlowLogo } from "@/components/brand/stockflow-logo";

export function PublicFooter() {
  return (
    <footer className="border-border/70 bg-card border-t">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <StockFlowLogo />
          <p className="text-muted-foreground mt-2 text-sm">
            Inventory clarity from shelf to delivery.
          </p>
        </div>
        <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
          <Link
            className="hover:text-foreground inline-flex min-h-11 items-center"
            href="#platform"
          >
            Platform
          </Link>
          <Link
            className="hover:text-foreground inline-flex min-h-11 items-center"
            href="#workflow"
          >
            Workflow
          </Link>
          <Link
            className="hover:text-foreground inline-flex min-h-11 items-center"
            href="/ui-preview"
          >
            UI preview
          </Link>
        </div>
      </div>
    </footer>
  );
}
