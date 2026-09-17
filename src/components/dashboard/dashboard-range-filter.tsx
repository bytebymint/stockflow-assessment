import Link from "next/link";
import { CalendarRange } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  DASHBOARD_RANGES,
  dashboardRangeLabel,
  type DashboardRange,
} from "@/lib/dashboard/range";
import { cn } from "@/lib/utils";

export function DashboardRangeFilter({
  activeRange,
  pathname,
}: {
  activeRange: DashboardRange;
  pathname: string;
}) {
  return (
    <div>
      <p className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.08em] uppercase">
        <CalendarRange className="size-4" aria-hidden="true" />
        Reporting period
      </p>
      <div className="flex flex-wrap gap-2" aria-label="Dashboard date range">
        {DASHBOARD_RANGES.map((range) => {
          const active = range === activeRange;

          return (
            <Link
              key={range}
              href={`${pathname}?range=${range}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                buttonVariants({
                  variant: active ? "default" : "outline",
                  size: "sm",
                }),
                "min-w-20",
              )}
            >
              {dashboardRangeLabel(range)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
