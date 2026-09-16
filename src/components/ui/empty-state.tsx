import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border bg-muted/35 flex flex-col items-center rounded-xl border border-dashed px-6 py-10 text-center",
        className,
      )}
    >
      <span className="bg-accent text-accent-foreground flex size-12 items-center justify-center rounded-xl">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h2 className="text-foreground mt-4 text-base font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm leading-6">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
