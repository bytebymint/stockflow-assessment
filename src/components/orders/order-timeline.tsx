import { Check, Circle, CircleX } from "lucide-react";

import type { OrderDetail } from "@/lib/orders/data";
import {
  orderStatusDetails,
  type OrderStatusValue,
} from "@/lib/orders/workflow";
import { cn } from "@/lib/utils";

const fulfilmentStages = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
] as const;

function formatTimelineDate(value: Date | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function OrderTimeline({ order }: { order: OrderDetail }) {
  const dates: Record<(typeof fulfilmentStages)[number], Date | null> = {
    PENDING: order.createdAt,
    CONFIRMED: order.confirmedAt,
    SHIPPED: order.shippedAt,
    DELIVERED: order.deliveredAt,
  };
  const attainedIndex = order.deliveredAt
    ? 3
    : order.shippedAt
      ? 2
      : order.confirmedAt
        ? 1
        : 0;
  const visibleStages =
    order.status === "CANCELLED"
      ? fulfilmentStages.slice(0, attainedIndex + 1)
      : fulfilmentStages;
  const timeline: Array<{
    status: OrderStatusValue;
    date: Date | null;
    completed: boolean;
    current: boolean;
  }> = visibleStages.map((status, index) => ({
    status,
    date: dates[status],
    completed: index <= attainedIndex,
    current: order.status === status,
  }));

  if (order.status === "CANCELLED") {
    timeline.push({
      status: "CANCELLED",
      date: order.cancelledAt,
      completed: true,
      current: true,
    });
  }

  return (
    <ol className="mt-5" aria-label="Order status timeline">
      {timeline.map((event, index) => {
        const isCancelled = event.status === "CANCELLED";
        const Icon = isCancelled ? CircleX : event.completed ? Check : Circle;
        const formattedDate = formatTimelineDate(event.date);

        return (
          <li
            key={event.status}
            className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 pb-5 last:pb-0"
            aria-current={event.current ? "step" : undefined}
          >
            {index < timeline.length - 1 ? (
              <span
                className={cn(
                  "absolute top-7 bottom-0 left-[0.9375rem] w-px",
                  event.completed ? "bg-primary/35" : "bg-border",
                )}
                aria-hidden="true"
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center rounded-full border",
                isCancelled
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : event.completed
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
              )}
              aria-hidden="true"
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-sm font-semibold">
                  {orderStatusDetails[event.status].label}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formattedDate ?? "Not reached"}
                </p>
              </div>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                {orderStatusDetails[event.status].description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
