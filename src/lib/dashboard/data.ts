import "server-only";

import { unstable_cache } from "next/cache";

import {
  OrderStatus,
  SupplierStatus,
  UserRole,
} from "@/generated/prisma/client";
import {
  ADMIN_DASHBOARD_CACHE_TAG,
  supplierDashboardCacheTag,
} from "@/lib/cache/tags";
import { dashboardWindow, type DashboardRange } from "@/lib/dashboard/range";
import { getDatabase } from "@/lib/database";

const DASHBOARD_REVALIDATE_SECONDS = 60;

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function dateLabel(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(value);
}

function fullDateLabel(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

function orderDateLabel(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

async function querySupplierDashboardData(
  supplierId: string,
  range: DashboardRange,
) {
  const database = getDatabase();
  const { start, end } = dashboardWindow(range);

  const [products, pendingOrderCount, deliveredRevenue, recentOrders] =
    await Promise.all([
      database.product.findMany({
        where: { supplierId, archivedAt: null },
        select: {
          id: true,
          name: true,
          stock: true,
          lowStockThreshold: true,
          price: true,
        },
        orderBy: [{ stock: "asc" }, { name: "asc" }],
      }),
      database.order.count({
        where: { supplierId, status: OrderStatus.PENDING },
      }),
      database.order.aggregate({
        where: {
          supplierId,
          status: OrderStatus.DELIVERED,
          deliveredAt: { gte: start, lt: end },
        },
        _sum: { subtotal: true },
      }),
      database.order.findMany({
        where: { supplierId, createdAt: { gte: start, lt: end } },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          subtotal: true,
          createdAt: true,
          customer: { select: { name: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const lowStockProducts = products
    .filter((product) => product.stock <= product.lowStockThreshold)
    .slice(0, 6)
    .map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      threshold: product.lowStockThreshold,
      price: product.price.toFixed(2),
    }));

  return {
    range,
    rangeStartLabel: fullDateLabel(start),
    rangeEndLabel: fullDateLabel(new Date(end.getTime() - 1)),
    metrics: {
      activeProducts: products.length,
      stockUnits: products.reduce((total, product) => total + product.stock, 0),
      pendingOrders: pendingOrderCount,
      deliveredRevenue: deliveredRevenue._sum.subtotal?.toFixed(2) ?? "0.00",
    },
    lowStockProducts,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal.toFixed(2),
      customerName: order.customer.name,
      itemCount: order._count.items,
      createdAtLabel: orderDateLabel(order.createdAt),
    })),
  };
}

export function getSupplierDashboardData(
  supplierId: string,
  range: DashboardRange,
) {
  return unstable_cache(
    () => querySupplierDashboardData(supplierId, range),
    ["stockflow", "dashboard", "supplier", supplierId, String(range)],
    {
      revalidate: DASHBOARD_REVALIDATE_SECONDS,
      tags: [supplierDashboardCacheTag(supplierId)],
    },
  )();
}

export type SupplierDashboardData = Awaited<
  ReturnType<typeof getSupplierDashboardData>
>;

async function queryAdminDashboardData(range: DashboardRange) {
  const database = getDatabase();
  const { start, end } = dashboardWindow(range);

  const [
    activeProductCount,
    approvedSuppliers,
    orders,
    deliveredOrders,
    products,
    pendingSupplierCount,
    pendingSuppliers,
  ] = await Promise.all([
    database.product.count({ where: { archivedAt: null } }),
    database.user.findMany({
      where: {
        role: UserRole.SUPPLIER,
        supplierStatus: SupplierStatus.APPROVED,
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    database.order.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: { createdAt: true },
    }),
    database.order.findMany({
      where: {
        status: OrderStatus.DELIVERED,
        deliveredAt: { gte: start, lt: end },
      },
      select: {
        subtotal: true,
        supplier: { select: { id: true, name: true } },
      },
    }),
    database.product.findMany({
      where: { archivedAt: null },
      select: {
        id: true,
        name: true,
        stock: true,
        lowStockThreshold: true,
        supplier: { select: { name: true } },
      },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
    }),
    database.user.count({
      where: {
        role: UserRole.SUPPLIER,
        supplierStatus: SupplierStatus.PENDING,
      },
    }),
    database.user.findMany({
      where: {
        role: UserRole.SUPPLIER,
        supplierStatus: SupplierStatus.PENDING,
      },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
  ]);

  const ordersByDate = new Map<string, number>();
  for (const order of orders) {
    const key = dateKey(order.createdAt);
    ordersByDate.set(key, (ordersByDate.get(key) ?? 0) + 1);
  }

  const ordersByDay = Array.from({ length: range }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + index);
    const key = dateKey(date);

    return {
      date: key,
      label: dateLabel(date),
      orders: ordersByDate.get(key) ?? 0,
    };
  });

  const revenueGroups = new Map<
    string,
    { supplier: string; revenue: number; orderCount: number }
  >();

  for (const order of deliveredOrders) {
    const group = revenueGroups.get(order.supplier.id) ?? {
      supplier: order.supplier.name,
      revenue: 0,
      orderCount: 0,
    };
    group.revenue += order.subtotal.toNumber();
    group.orderCount += 1;
    revenueGroups.set(order.supplier.id, group);
  }

  const revenueBySupplier = Array.from(revenueGroups.values()).sort(
    (supplierA, supplierB) => supplierB.revenue - supplierA.revenue,
  );
  const deliveredRevenue = revenueBySupplier.reduce(
    (total, supplier) => total + supplier.revenue,
    0,
  );
  const busiestDay = ordersByDay.reduce<(typeof ordersByDay)[number] | null>(
    (busiest, day) => (!busiest || day.orders > busiest.orders ? day : busiest),
    null,
  );

  return {
    range,
    rangeStartLabel: fullDateLabel(start),
    rangeEndLabel: fullDateLabel(new Date(end.getTime() - 1)),
    metrics: {
      activeProducts: activeProductCount,
      approvedSuppliers: approvedSuppliers.length,
      orders: orders.length,
      deliveredRevenue: deliveredRevenue.toFixed(2),
    },
    orderSummary:
      orders.length === 0
        ? `No orders were created in the selected ${range}-day period.`
        : `${orders.length} ${orders.length === 1 ? "order was" : "orders were"} created. The busiest day was ${busiestDay?.label} with ${busiestDay?.orders} ${busiestDay?.orders === 1 ? "order" : "orders"}.`,
    revenueSummary:
      revenueBySupplier.length === 0
        ? `No delivered revenue was recorded in the selected ${range}-day period.`
        : `${revenueBySupplier.length} ${revenueBySupplier.length === 1 ? "supplier" : "suppliers"} generated delivered revenue. ${revenueBySupplier[0].supplier} led with £${revenueBySupplier[0].revenue.toFixed(2)}.`,
    ordersByDay,
    revenueBySupplier,
    lowStockProducts: products
      .filter((product) => product.stock <= product.lowStockThreshold)
      .slice(0, 8)
      .map((product) => ({
        id: product.id,
        name: product.name,
        supplierName: product.supplier.name,
        stock: product.stock,
        threshold: product.lowStockThreshold,
      })),
    pendingSupplierCount,
    exportSuppliers: approvedSuppliers,
    pendingSuppliers: pendingSuppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      email: supplier.email,
      createdAtLabel: fullDateLabel(supplier.createdAt),
    })),
  };
}

const getCachedAdminDashboardData = unstable_cache(
  queryAdminDashboardData,
  ["stockflow", "dashboard", "admin"],
  {
    revalidate: DASHBOARD_REVALIDATE_SECONDS,
    tags: [ADMIN_DASHBOARD_CACHE_TAG],
  },
);

export function getAdminDashboardData(range: DashboardRange) {
  return getCachedAdminDashboardData(range);
}

export type AdminDashboardData = Awaited<
  ReturnType<typeof getAdminDashboardData>
>;
