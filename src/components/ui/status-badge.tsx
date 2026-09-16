import {
  CircleCheck,
  CircleX,
  Clock3,
  Info,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const variants = {
  success: {
    icon: CircleCheck,
    className: "border-success/20 bg-success-subtle text-success-foreground",
  },
  warning: {
    icon: TriangleAlert,
    className: "border-warning/20 bg-warning-subtle text-warning-foreground",
  },
  info: {
    icon: Info,
    className: "border-info/20 bg-info-subtle text-info-foreground",
  },
  neutral: {
    icon: Clock3,
    className: "border-border bg-muted text-muted-foreground",
  },
  destructive: {
    icon: CircleX,
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
} as const;

type StatusBadgeProps = {
  label: string;
  variant?: keyof typeof variants;
  className?: string;
};

export function StatusBadge({
  label,
  variant = "neutral",
  className,
}: StatusBadgeProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("h-6 gap-1.5 px-2.5", config.className, className)}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </Badge>
  );
}
