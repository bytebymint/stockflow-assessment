import Link from "next/link";
import { Boxes } from "lucide-react";

import { cn } from "@/lib/utils";

type StockFlowLogoProps = {
  className?: string;
  inverse?: boolean;
  href?: string;
};

export function StockFlowLogo({
  className,
  inverse = false,
  href = "/",
}: StockFlowLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "focus-visible:ring-ring/40 inline-flex min-h-11 items-center gap-2 rounded-lg text-base font-bold tracking-tight focus-visible:ring-3 focus-visible:outline-none",
        inverse ? "text-white" : "text-foreground",
        className,
      )}
      aria-label="StockFlow home"
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          inverse
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "bg-primary text-primary-foreground",
        )}
        aria-hidden="true"
      >
        <Boxes className="size-5" strokeWidth={2} />
      </span>
      <span className="min-w-0 truncate">StockFlow</span>
    </Link>
  );
}
