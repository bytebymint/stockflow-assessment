import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import type { CurrentUser } from "@/lib/auth/session";
import { getDatabase } from "@/lib/database";
import type { OrderStatusValue } from "@/lib/orders/workflow";

function orderScope(user: CurrentUser): Prisma.OrderWhereInput {
  if (user.role === "CUSTOMER") return { customerId: user.id };
  if (user.role === "SUPPLIER") return { supplierId: user.id };
  return {};
}

export async function getOrdersForUser(user: CurrentUser) {
  const orders = await getDatabase().order.findMany({
    where: orderScope(user),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      subtotal: true,
      createdAt: true,
      checkoutGroup: { select: { reference: true } },
      customer: { select: { name: true } },
      supplier: { select: { name: true } },
      items: { select: { quantity: true } },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status as OrderStatusValue,
    subtotal: order.subtotal.toFixed(2),
    createdAt: order.createdAt,
    checkoutReference: order.checkoutGroup.reference,
    customerName: order.customer.name,
    supplierName: order.supplier.name,
    unitCount: order.items.reduce((total, item) => total + item.quantity, 0),
  }));
}

export type OrderListEntry = Awaited<
  ReturnType<typeof getOrdersForUser>
>[number];

export async function getOrderForUser(user: CurrentUser, orderId: string) {
  if (!z.string().uuid().safeParse(orderId).success) return null;

  const order = await getDatabase().order.findFirst({
    where: { id: orderId, ...orderScope(user) },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      subtotal: true,
      confirmedAt: true,
      shippedAt: true,
      deliveredAt: true,
      cancelledAt: true,
      stockRestoredAt: true,
      createdAt: true,
      updatedAt: true,
      checkoutGroup: { select: { reference: true } },
      customer: { select: { id: true, name: true, email: true } },
      supplier: { select: { id: true, name: true, email: true } },
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          productId: true,
          productNameSnapshot: true,
          productImageUrlSnapshot: true,
          unitPriceSnapshot: true,
          quantity: true,
          lineTotal: true,
        },
      },
    },
  });

  if (!order) return null;

  return {
    ...order,
    status: order.status as OrderStatusValue,
    subtotal: order.subtotal.toFixed(2),
    items: order.items.map((item) => ({
      ...item,
      unitPriceSnapshot: item.unitPriceSnapshot.toFixed(2),
      lineTotal: item.lineTotal.toFixed(2),
    })),
  };
}

export type OrderDetail = NonNullable<
  Awaited<ReturnType<typeof getOrderForUser>>
>;
