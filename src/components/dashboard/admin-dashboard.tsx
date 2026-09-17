import Link from "next/link";
import {
  ArrowRight,
  BadgePoundSterling,
  Boxes,
  ClipboardList,
  PackageCheck,
  Store,
  TriangleAlert,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

import {
  OrdersPerDayChart,
  RevenueBySupplierChart,
} from "@/components/dashboard/dashboard-charts";
import { DashboardRangeFilter } from "@/components/dashboard/dashboard-range-filter";
import { MetricCard } from "@/components/dashboard/metric-card";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCartPrice } from "@/lib/cart";
import type { AdminDashboardData } from "@/lib/dashboard/data";

export function AdminDashboard({
  adminName,
  data,
}: {
  adminName: string;
  data: AdminDashboardData;
}) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Platform operations"
        title={`Operational overview for ${adminName}`}
        description="Review catalogue health, supplier onboarding, order volume, and delivered revenue across StockFlow."
        actions={
          <DashboardRangeFilter activeRange={data.range} pathname="/admin" />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Boxes}
          label="Active products"
          value={String(data.metrics.activeProducts)}
          helper="Current catalogue products that are not archived."
        />
        <MetricCard
          icon={Store}
          label="Approved suppliers"
          value={String(data.metrics.approvedSuppliers)}
          helper="Suppliers currently allowed to list products."
          tone="info"
        />
        <MetricCard
          icon={ClipboardList}
          label="Orders created"
          value={String(data.metrics.orders)}
          helper={`${data.rangeStartLabel}–${data.rangeEndLabel}.`}
          tone="warning"
        />
        <MetricCard
          icon={BadgePoundSterling}
          label="Delivered revenue"
          value={formatCartPrice(data.metrics.deliveredRevenue)}
          helper={`${data.rangeStartLabel}–${data.rangeEndLabel}.`}
        />
      </div>

      <div className="grid min-w-0 gap-4 2xl:grid-cols-2">
        <OrdersPerDayChart
          data={data.ordersByDay}
          summary={data.orderSummary}
        />
        <RevenueBySupplierChart
          data={data.revenueBySupplier}
          summary={data.revenueSummary}
        />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low-stock overview</CardTitle>
            <CardDescription>
              Products at or below their supplier-defined alert threshold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.lowStockProducts.length === 0 ? (
              <EmptyState
                icon={PackageCheck}
                title="Platform inventory is healthy"
                description="No active products are currently at or below their alert threshold."
              />
            ) : (
              <ul className="divide-border divide-y">
                {data.lowStockProducts.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <TriangleAlert
                          className={
                            product.stock === 0
                              ? "text-destructive size-4 shrink-0"
                              : "text-warning-foreground size-4 shrink-0"
                          }
                          aria-hidden="true"
                        />
                        <p className="truncate font-semibold">{product.name}</p>
                      </div>
                      <p className="text-muted-foreground mt-1 truncate text-xs">
                        {product.supplierName}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono font-bold tabular-nums">
                        {product.stock}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        target {product.threshold}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Pending supplier approvals</CardTitle>
                <CardDescription className="mt-1">
                  Oldest applications waiting for an administrator decision.
                </CardDescription>
              </div>
              <StatusBadge
                label={`${data.pendingSupplierCount} pending`}
                variant={data.pendingSupplierCount > 0 ? "warning" : "neutral"}
              />
            </div>
          </CardHeader>
          <CardContent>
            {data.pendingSuppliers.length === 0 ? (
              <EmptyState
                icon={UserRoundCheck}
                title="No applications waiting"
                description="New supplier registrations will appear here for review."
              />
            ) : (
              <ul className="divide-border divide-y">
                {data.pendingSuppliers.map((supplier) => (
                  <li
                    key={supplier.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <UsersRound
                          className="text-warning-foreground size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <p className="truncate font-semibold">
                          {supplier.name}
                        </p>
                      </div>
                      <p
                        className="text-muted-foreground mt-1 truncate text-xs"
                        title={supplier.email}
                      >
                        {supplier.email} · applied {supplier.createdAtLabel}
                      </p>
                    </div>
                    <Link
                      href={`/admin/suppliers?status=PENDING&q=${encodeURIComponent(supplier.email)}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      Review
                      <ArrowRight data-icon="inline-end" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {data.pendingSupplierCount > data.pendingSuppliers.length ? (
              <Link
                href="/admin/suppliers?status=PENDING"
                className="text-primary mt-5 inline-flex min-h-11 items-center text-sm font-semibold hover:underline"
              >
                View all pending suppliers
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
