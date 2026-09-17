import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
  tone?: "primary" | "info" | "warning" | "neutral";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    info: "bg-info-subtle text-info-foreground",
    warning: "bg-warning-subtle text-warning-foreground",
    neutral: "bg-muted text-muted-foreground",
  }[tone];

  return (
    <Card size="sm">
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-muted-foreground text-sm font-medium">{label}</p>
            <p className="mt-2 font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
              {value}
            </p>
          </div>
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              toneClass,
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
        </div>
        <p className="text-muted-foreground mt-3 text-xs leading-5">{helper}</p>
      </CardContent>
    </Card>
  );
}
