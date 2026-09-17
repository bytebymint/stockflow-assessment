"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase } from "@/lib/database";
import {
  canAccessOrder,
  isAllowedOrderTransition,
  ORDER_STATUSES,
  orderStatusDetails,
  type OrderStatusValue,
} from "@/lib/orders/workflow";

export type OrderTransitionState = {
  status: "idle" | "success" | "error";
  message?: string;
  refreshRequired?: boolean;
};

const transitionSchema = z.object({
  orderId: z.string().uuid(),
  expectedStatus: z.enum(ORDER_STATUSES),
  targetStatus: z.enum(ORDER_STATUSES),
});

const MAX_TRANSACTION_ATTEMPTS = 3;

function prismaErrorCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return null;
}

function transitionTimestamp(
  targetStatus: OrderStatusValue,
  now: Date,
): Prisma.OrderUpdateManyMutationInput {
  switch (targetStatus) {
    case "CONFIRMED":
      return { status: targetStatus, confirmedAt: now };
    case "SHIPPED":
      return { status: targetStatus, shippedAt: now };
    case "DELIVERED":
      return { status: targetStatus, deliveredAt: now };
    case "CANCELLED":
      return { status: targetStatus, cancelledAt: now, stockRestoredAt: now };
    default:
      return { status: targetStatus };
  }
}

function revalidateOrderViews(orderId: string) {
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/supplier/orders");
  revalidatePath(`/supplier/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account");
  revalidatePath("/supplier");
  revalidatePath("/admin");
}

export async function transitionOrder(
  _previousState: OrderTransitionState,
  formData: FormData,
): Promise<OrderTransitionState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      status: "error",
      message: "Your session ended. Sign in again before updating this order.",
    };
  }

  const parsedTransition = transitionSchema.safeParse({
    orderId: formData.get("orderId"),
    expectedStatus: formData.get("expectedStatus"),
    targetStatus: formData.get("targetStatus"),
  });

  if (!parsedTransition.success) {
    return {
      status: "error",
      message: "This order action is invalid. Refresh the page and try again.",
      refreshRequired: true,
    };
  }

  const { orderId, expectedStatus, targetStatus } = parsedTransition.data;
  const database = getDatabase();

  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt += 1) {
    try {
      const outcome = await database.$transaction(
        async (transaction) => {
          const order = await transaction.order.findUnique({
            where: { id: orderId },
            select: {
              status: true,
              customerId: true,
              supplierId: true,
              stockRestoredAt: true,
              items: { select: { productId: true, quantity: true } },
            },
          });

          if (!order) return "missing" as const;

          if (!canAccessOrder(user, order)) return "forbidden" as const;
          if (order.status !== expectedStatus) return "stale" as const;

          if (
            !isAllowedOrderTransition(expectedStatus, targetStatus, user.role)
          ) {
            return "invalid" as const;
          }

          const now = new Date();
          const update = await transaction.order.updateMany({
            where: {
              id: orderId,
              status: expectedStatus,
              ...(targetStatus === "CANCELLED"
                ? { stockRestoredAt: null }
                : {}),
            },
            data: transitionTimestamp(targetStatus, now),
          });

          if (update.count !== 1) return "stale" as const;

          if (targetStatus === "CANCELLED") {
            for (const item of order.items) {
              await transaction.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }

          return "updated" as const;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5_000,
          timeout: 10_000,
        },
      );

      if (outcome === "missing" || outcome === "forbidden") {
        return {
          status: "error",
          message: "This order is unavailable or you do not have access to it.",
        };
      }

      if (outcome === "stale") {
        return {
          status: "error",
          message:
            "This order changed before your action completed. The latest status is being loaded.",
          refreshRequired: true,
        };
      }

      if (outcome === "invalid") {
        return {
          status: "error",
          message: "That status change is not allowed for this order.",
          refreshRequired: true,
        };
      }

      revalidateOrderViews(orderId);
      return {
        status: "success",
        message: `Order marked ${orderStatusDetails[targetStatus].label.toLowerCase()}.`,
      };
    } catch (error) {
      if (
        prismaErrorCode(error) === "P2034" &&
        attempt < MAX_TRANSACTION_ATTEMPTS
      ) {
        continue;
      }

      return {
        status: "error",
        message:
          "The order could not be updated. No partial change was saved; please try again.",
        refreshRequired: true,
      };
    }
  }

  return {
    status: "error",
    message: "The order could not be updated after retrying.",
    refreshRequired: true,
  };
}
