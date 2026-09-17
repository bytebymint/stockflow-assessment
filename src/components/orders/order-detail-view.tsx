import Link from "next/link";
import {
  ArrowLeft,
  Boxes,
  CalendarDays,
  ReceiptText,
  Store,
  UserRound,
} from "lucide-react";

import { ProductMedia } from "@/components/catalog/product-media";
import { OrderActionPanel } from "@/components/orders/order-action-panel";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { formatCartPrice } from "@/lib/cart";
import type { OrderDetail } from "@/lib/orders/data";
import type { OrderActorRole } from "@/lib/orders/workflow";

function formatOrderDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function OrderDetailView({
  order,
  role,
  backHref,
}: {
  order: OrderDetail;
  role: OrderActorRole;
  backHref: string;
}) {
  const unitCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <div className="min-w-0">
      <PageHeader
        eyebrow="Order detail"
        title={order.orderNumber}
        description={`Created ${formatOrderDate(order.createdAt)} · Checkout ${order.checkoutGroup.reference}`}
        actions={
          <Link
            href={backHref}
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            Back to orders
          </Link>
        }
      />

      <div className="mt-8 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="min-w-0 space-y-6">
          <section
            className="border-border/80 bg-card shadow-card rounded-2xl border p-5 sm:p-6"
            aria-labelledby="order-progress-title"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-primary text-xs font-bold tracking-[0.14em] uppercase">
                  Fulfilment progress
                </p>
                <h2
                  id="order-progress-title"
                  className="mt-2 text-xl font-bold"
                >
                  Status timeline
                </h2>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <OrderTimeline order={order} />
          </section>

          <section aria-labelledby="order-products-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-primary text-xs font-bold tracking-[0.14em] uppercase">
                  Reserved inventory
                </p>
                <h2
                  id="order-products-title"
                  className="mt-2 text-xl font-bold"
                >
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "product" : "products"}
                </h2>
              </div>
              <p className="text-muted-foreground text-sm">
                {unitCount} {unitCount === 1 ? "unit" : "units"}
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              {order.items.map((item) => (
                <article
                  key={item.id}
                  className="border-border/80 bg-card shadow-card flex min-w-0 gap-4 rounded-xl border p-3 sm:p-4"
                >
                  <ProductMedia
                    imageUrl={item.productImageUrlSnapshot}
                    imageAlt={item.productNameSnapshot}
                    productName={item.productNameSnapshot}
                    compact
                    className="size-20 shrink-0 rounded-lg sm:size-24"
                    sizes="96px"
                  />
                  <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-pretty">
                        {item.productNameSnapshot}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {item.quantity} ×{" "}
                        {formatCartPrice(item.unitPriceSnapshot)}
                      </p>
                    </div>
                    <p className="mt-3 shrink-0 font-mono font-bold tabular-nums sm:mt-0">
                      {formatCartPrice(item.lineTotal)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24">
          <OrderActionPanel
            orderId={order.id}
            orderNumber={order.orderNumber}
            status={order.status}
            role={role}
          />

          <section
            className="border-border/80 bg-card shadow-card rounded-2xl border p-5"
            aria-labelledby="order-summary-title"
          >
            <div className="flex items-center gap-2">
              <ReceiptText className="text-primary size-5" aria-hidden="true" />
              <h2 id="order-summary-title" className="font-semibold">
                Order summary
              </h2>
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                  <UserRound className="size-4" aria-hidden="true" />
                  Customer
                </dt>
                <dd className="mt-1 font-semibold">{order.customer.name}</dd>
                {role !== "CUSTOMER" ? (
                  <dd className="text-muted-foreground mt-0.5 text-xs break-all">
                    {order.customer.email}
                  </dd>
                ) : null}
              </div>
              <div>
                <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Store className="size-4" aria-hidden="true" />
                  Supplier
                </dt>
                <dd className="mt-1 font-semibold">{order.supplier.name}</dd>
                {role === "ADMIN" ? (
                  <dd className="text-muted-foreground mt-0.5 text-xs break-all">
                    {order.supplier.email}
                  </dd>
                ) : null}
              </div>
              <div>
                <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Last updated
                </dt>
                <dd className="mt-1 font-medium">
                  {formatOrderDate(order.updatedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Boxes className="size-4" aria-hidden="true" />
                  Reserved units
                </dt>
                <dd className="mt-1 font-medium">{unitCount}</dd>
              </div>
              <div className="border-border flex items-end justify-between gap-4 border-t pt-4">
                <dt className="font-semibold">Subtotal</dt>
                <dd className="font-mono text-xl font-bold tabular-nums">
                  {formatCartPrice(order.subtotal)}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
