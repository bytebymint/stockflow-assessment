import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  PackageCheck,
  Store,
  UserRound,
} from "lucide-react";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { formatCartPrice } from "@/lib/cart";
import type { OrderListEntry } from "@/lib/orders/data";
import type { OrderActorRole } from "@/lib/orders/workflow";
import { cn } from "@/lib/utils";

function formatOrderDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function OrdersList({
  orders,
  role,
  detailBasePath,
}: {
  orders: OrderListEntry[];
  role: OrderActorRole;
  detailBasePath: string;
}) {
  const copy = {
    CUSTOMER: {
      eyebrow: "Customer orders",
      title: "Track every supplier order",
      description:
        "Each supplier fulfils its own order, even when the products came from one checkout.",
    },
    SUPPLIER: {
      eyebrow: "Order fulfilment",
      title: "Manage assigned customer orders",
      description:
        "Confirm new orders, record shipment, and complete delivery using only the valid next step.",
    },
    ADMIN: {
      eyebrow: "Platform orders",
      title: "Monitor and manage every order",
      description:
        "Review fulfilment across customers and suppliers, with the same protected workflow rules.",
    },
  }[role];

  return (
    <div className="min-w-0">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders to show"
          description={
            role === "CUSTOMER"
              ? "Complete a checkout and its supplier orders will appear here."
              : "Assigned orders will appear here as soon as customers complete checkout."
          }
          className="mt-8 py-16"
          action={
            role === "CUSTOMER" ? (
              <Link href="/products" className={buttonVariants()}>
                Browse products
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {orders.map((order) => (
            <article
              key={order.id}
              className="border-border/80 bg-card shadow-card flex min-w-0 flex-col rounded-2xl border p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
                    Order
                  </p>
                  <h2 className="mt-1 truncate font-mono text-base font-bold">
                    {order.orderNumber}
                  </h2>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                {role === "ADMIN" ? (
                  <>
                    <div className="bg-muted/40 rounded-lg p-3">
                      <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                        <UserRound className="size-4" aria-hidden="true" />
                        Customer
                      </dt>
                      <dd className="mt-1 truncate font-semibold">
                        {order.customerName}
                      </dd>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3">
                      <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Store className="size-4" aria-hidden="true" />
                        Supplier
                      </dt>
                      <dd className="mt-1 truncate font-semibold">
                        {order.supplierName}
                      </dd>
                    </div>
                  </>
                ) : (
                  <div className="bg-muted/40 rounded-lg p-3 sm:col-span-2">
                    <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                      {role === "CUSTOMER" ? (
                        <Store className="size-4" aria-hidden="true" />
                      ) : (
                        <UserRound className="size-4" aria-hidden="true" />
                      )}
                      {role === "CUSTOMER" ? "Supplier" : "Customer"}
                    </dt>
                    <dd className="mt-1 truncate font-semibold">
                      {role === "CUSTOMER"
                        ? order.supplierName
                        : order.customerName}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    Created
                  </dt>
                  <dd className="mt-1 font-medium">
                    {formatOrderDate(order.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                    <PackageCheck className="size-4" aria-hidden="true" />
                    Reserved units
                  </dt>
                  <dd className="mt-1 font-medium">{order.unitCount}</dd>
                </div>
              </dl>

              <div className="border-border mt-5 flex flex-wrap items-end justify-between gap-4 border-t pt-4">
                <div>
                  <p className="text-muted-foreground text-xs">Subtotal</p>
                  <p className="mt-1 font-mono text-lg font-bold tabular-nums">
                    {formatCartPrice(order.subtotal)}
                  </p>
                </div>
                <Link
                  href={`${detailBasePath}/${order.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "group",
                  )}
                >
                  View order
                  <ArrowRight
                    className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
                    data-icon="inline-end"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
