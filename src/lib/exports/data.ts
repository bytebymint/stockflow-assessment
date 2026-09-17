import "server-only";

import { OrderStatus, type Prisma } from "@/generated/prisma/client";
import type { CurrentUser } from "@/lib/auth/session";
import { getDatabase } from "@/lib/database";
import { dashboardWindow } from "@/lib/dashboard/range";
import type { ExportQuery } from "@/lib/exports/query";

function supplierScope(
  user: CurrentUser,
  requestedSupplierId: string | undefined,
) {
  return user.role === "SUPPLIER" ? user.id : requestedSupplierId;
}

export async function getOrderExportRows(
  user: CurrentUser,
  query: ExportQuery,
) {
  if (user.role === "CUSTOMER") return [];

  const { start, end } = dashboardWindow(query.range);
  const supplierId = supplierScope(user, query.supplierId);
  const where: Prisma.OrderWhereInput = {
    createdAt: { gte: start, lt: end },
    ...(query.status ? { status: query.status } : {}),
    ...(supplierId ? { supplierId } : {}),
  };

  return getDatabase().order.findMany({
    where,
    orderBy: [{ createdAt: "asc" }, { orderNumber: "asc" }],
    select: {
      orderNumber: true,
      status: true,
      subtotal: true,
      createdAt: true,
      checkoutGroup: { select: { reference: true } },
      customer: { select: { name: true, email: true } },
      supplier: { select: { name: true, email: true } },
      items: { select: { quantity: true } },
    },
  });
}

export async function getRevenueExportRows(
  user: CurrentUser,
  query: ExportQuery,
) {
  if (user.role === "CUSTOMER") return [];

  const { start, end } = dashboardWindow(query.range);
  const supplierId = supplierScope(user, query.supplierId);

  return getDatabase().order.findMany({
    where: {
      status: OrderStatus.DELIVERED,
      deliveredAt: { gte: start, lt: end },
      ...(supplierId ? { supplierId } : {}),
    },
    orderBy: [{ deliveredAt: "asc" }, { orderNumber: "asc" }],
    select: {
      orderNumber: true,
      subtotal: true,
      deliveredAt: true,
      customer: { select: { name: true, email: true } },
      supplier: { select: { name: true, email: true } },
    },
  });
}
