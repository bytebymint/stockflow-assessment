import Link from "next/link";
import {
  ArrowRight,
  BadgePoundSterling,
  Boxes,
  Clock3,
  PackageCheck,
  PackageSearch,
  TriangleAlert,
} from "lucide-react";

import { DashboardRangeFilter } from "@/components/dashboard/dashboard-range-filter";
import { ExportReports } from "@/components/dashboard/export-reports";
import { MetricCard } from "@/components/dashboard/metric-card";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { formatCartPrice } from "@/lib/cart";
import type { SupplierDashboardData } from "@/lib/dashboard/data";
import { cn } from "@/lib/utils";

export function SupplierDashboard({
  data,
  supplierName,
}: {
  data: SupplierDashboardData;
  supplierName: string;
}) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Supplier operations"
        title={`Good to see you, ${supplierName}`}
        description="Monitor current inventory and fulfilment, with delivered revenue scoped to the selected reporting period."
        actions={
          <DashboardRangeFilter activeRange={data.range} pathname="/supplier" />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={PackageSearch}
          label="Active products"
          value={String(data.metrics.activeProducts)}
          helper="Current products available in your catalogue."
        />
        <MetricCard
          icon={Boxes}
          label="Units in stock"
          value={String(data.metrics.stockUnits)}
          helper="Current units across all active products."
          tone="info"
        />
        <MetricCard
          icon={Clock3}
          label="Pending orders"
          value={String(data.metrics.pendingOrders)}
          helper="Current orders waiting for confirmation."
          tone="warning"
        />
        <MetricCard
          icon={BadgePoundSterling}
          label="Delivered revenue"
          value={formatCartPrice(data.metrics.deliveredRevenue)}
          helper={`${data.rangeStartLabel}–${data.rangeEndLabel}.`}
        />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low-stock products</CardTitle>
            <CardDescription>
              Active products at or below their configured alert threshold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.lowStockProducts.length === 0 ? (
              <EmptyState
                icon={PackageCheck}
                title="Inventory is above target"
                description="No active product is currently at or below its low-stock threshold."
              />
            ) : (
              <ul className="divide-border divide-y">
                {data.lowStockProducts.map((product) => (
                  <li
                    key={product.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <TriangleAlert
                          className={cn(
                            "size-4 shrink-0",
                            product.stock === 0
                              ? "text-destructive"
                              : "text-warning-foreground",
                          )}
                          aria-hidden="true"
                        />
                        <p className="truncate font-semibold">{product.name}</p>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {product.stock} in stock · alert at {product.threshold}{" "}
                        · {formatCartPrice(product.price)} each
                      </p>
                    </div>
                    <Link
                      href={`/supplier/products/${product.id}/edit`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      Update stock
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>
              Latest orders created between {data.rangeStartLabel} and{" "}
              {data.rangeEndLabel}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length === 0 ? (
              <EmptyState
                icon={Clock3}
                title="No orders in this period"
                description="Choose a longer reporting period or wait for the next customer checkout."
              />
            ) : (
              <ul className="divide-border divide-y">
                {data.recentOrders.map((order) => (
                  <li
                    key={order.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-sm font-bold">
                          {order.orderNumber}
                        </p>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs leading-5">
                        {order.customerName} · {order.itemCount}{" "}
                        {order.itemCount === 1 ? "product" : "products"} ·{" "}
                        {order.createdAtLabel}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span className="font-mono font-semibold tabular-nums">
                        {formatCartPrice(order.subtotal)}
                      </span>
                      <Link
                        href={`/supplier/orders/${order.id}`}
                        aria-label={`View order ${order.orderNumber}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "icon-sm",
                        })}
                      >
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <ExportReports activeRange={data.range} role="SUPPLIER" />
    </div>
  );
}
