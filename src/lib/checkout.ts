import "server-only";

import {
  NotificationType,
  Prisma,
  SupplierStatus,
  UserRole,
} from "@/generated/prisma/client";
import type {
  CheckoutIssue,
  CheckoutReceipt,
  CheckoutRequest,
} from "@/lib/checkout-contract";
import { getDatabase } from "@/lib/database";

const MAX_TRANSACTION_ATTEMPTS = 3;

type CheckoutRecord = {
  id: string;
  reference: string;
  customerId: string;
  createdAt: Date;
  orders: Array<{
    id: string;
    orderNumber: string;
    subtotal: Prisma.Decimal;
    supplier: { name: string };
    _count: { items: number };
  }>;
};

const checkoutReceiptSelection = {
  id: true,
  reference: true,
  customerId: true,
  createdAt: true,
  orders: {
    orderBy: { orderNumber: "asc" },
    select: {
      id: true,
      orderNumber: true,
      subtotal: true,
      supplier: { select: { name: true } },
      _count: { select: { items: true } },
    },
  },
} satisfies Prisma.CheckoutGroupSelect;

export class CheckoutConflictError extends Error {
  readonly issues: CheckoutIssue[];

  constructor(message: string, issues: CheckoutIssue[]) {
    super(message);
    this.name = "CheckoutConflictError";
    this.issues = issues;
  }
}

function checkoutReference(checkoutToken: string) {
  const compactToken = checkoutToken.replaceAll("-", "");
  const encodedToken = Buffer.from(compactToken, "hex").toString("base64url");

  return `SFCK-${encodedToken}`;
}

function orderNumber(reference: string, index: number) {
  return `${reference.replace("SFCK", "SFO")}-${String(index + 1).padStart(2, "0")}`;
}

function toReceipt(checkout: CheckoutRecord): CheckoutReceipt {
  const total = checkout.orders.reduce(
    (sum, order) => sum.plus(order.subtotal),
    new Prisma.Decimal(0),
  );

  return {
    id: checkout.id,
    reference: checkout.reference,
    createdAt: checkout.createdAt.toISOString(),
    itemCount: checkout.orders.reduce(
      (count, order) => count + order._count.items,
      0,
    ),
    orderCount: checkout.orders.length,
    total: total.toFixed(2),
    orders: checkout.orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      supplierName: order.supplier.name,
      subtotal: order.subtotal.toFixed(2),
      itemCount: order._count.items,
    })),
  };
}

async function findCheckoutReceipt(reference: string, customerId: string) {
  const checkout = await getDatabase().checkoutGroup.findFirst({
    where: { reference, customerId },
    select: checkoutReceiptSelection,
  });

  return checkout ? toReceipt(checkout) : null;
}

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

export async function createCheckout(
  customerId: string,
  request: CheckoutRequest,
): Promise<CheckoutReceipt> {
  const database = getDatabase();
  const reference = checkoutReference(request.checkoutToken);

  const previousReceipt = await findCheckoutReceipt(reference, customerId);
  if (previousReceipt) return previousReceipt;

  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt += 1) {
    try {
      const checkout = await database.$transaction(
        async (transaction) => {
          const existingCheckout = await transaction.checkoutGroup.findUnique({
            where: { reference },
            select: checkoutReceiptSelection,
          });

          if (existingCheckout) {
            if (existingCheckout.customerId !== customerId) {
              throw new Error("Checkout reference collision.");
            }

            return existingCheckout;
          }

          const products = await transaction.product.findMany({
            where: {
              id: { in: request.items.map((item) => item.productId) },
            },
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
              lowStockThreshold: true,
              imageUrl: true,
              archivedAt: true,
              supplier: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  supplierStatus: true,
                },
              },
            },
          });
          const productsById = new Map(
            products.map((product) => [product.id, product]),
          );
          const issues: CheckoutIssue[] = [];

          for (const item of request.items) {
            const product = productsById.get(item.productId);

            if (!product) {
              issues.push({
                productId: item.productId,
                code: "PRODUCT_MISSING",
                message: "A product in your cart no longer exists.",
              });
              continue;
            }

            if (product.archivedAt) {
              issues.push({
                productId: item.productId,
                code: "PRODUCT_ARCHIVED",
                message: `${product.name} has been archived.`,
              });
            }

            if (
              product.supplier.role !== UserRole.SUPPLIER ||
              product.supplier.supplierStatus !== SupplierStatus.APPROVED
            ) {
              issues.push({
                productId: item.productId,
                code: "SUPPLIER_UNAVAILABLE",
                message: `${product.name} is not available from an approved supplier.`,
              });
            }

            if (product.stock === 0) {
              issues.push({
                productId: item.productId,
                code: "OUT_OF_STOCK",
                message: `${product.name} is out of stock.`,
              });
            } else if (product.stock < item.quantity) {
              issues.push({
                productId: item.productId,
                code: "INSUFFICIENT_STOCK",
                message: `${product.name} has only ${product.stock} ${product.stock === 1 ? "unit" : "units"} available.`,
              });
            }

            if (product.price.toFixed(2) !== item.unitPrice) {
              issues.push({
                productId: item.productId,
                code: "PRICE_CHANGED",
                message: `${product.name} has a new price. Review your cart before retrying.`,
              });
            }
          }

          if (issues.length > 0) {
            throw new CheckoutConflictError(
              "Your cart changed before checkout. No order was created.",
              issues,
            );
          }

          const createdCheckout = await transaction.checkoutGroup.create({
            data: { reference, customerId },
            select: { id: true },
          });

          for (const item of request.items) {
            const product = productsById.get(item.productId);
            if (!product) continue;

            const update = await transaction.product.updateMany({
              where: {
                id: product.id,
                archivedAt: null,
                stock: { gte: item.quantity },
                supplier: {
                  is: {
                    role: UserRole.SUPPLIER,
                    supplierStatus: SupplierStatus.APPROVED,
                  },
                },
              },
              data: { stock: { decrement: item.quantity } },
            });

            if (update.count !== 1) {
              throw new CheckoutConflictError(
                "Stock changed before checkout. No order was created.",
                [
                  {
                    productId: item.productId,
                    code: "INSUFFICIENT_STOCK",
                    message: `${product.name} no longer has enough stock.`,
                  },
                ],
              );
            }
          }

          const supplierGroups = new Map<
            string,
            Array<{
              requestItem: CheckoutRequest["items"][number];
              product: (typeof products)[number];
            }>
          >();

          for (const requestItem of request.items) {
            const product = productsById.get(requestItem.productId);
            if (!product) continue;

            const supplierItems = supplierGroups.get(product.supplier.id) ?? [];
            supplierItems.push({ requestItem, product });
            supplierGroups.set(product.supplier.id, supplierItems);
          }

          const orderedGroups = Array.from(supplierGroups.entries()).sort(
            ([supplierA], [supplierB]) => supplierA.localeCompare(supplierB),
          );

          for (const [index, [supplierId, items]] of orderedGroups.entries()) {
            const subtotal = items.reduce(
              (sum, { requestItem, product }) =>
                sum.plus(product.price.mul(requestItem.quantity)),
              new Prisma.Decimal(0),
            );

            await transaction.order.create({
              data: {
                orderNumber: orderNumber(reference, index),
                checkoutGroupId: createdCheckout.id,
                customerId,
                supplierId,
                subtotal,
                items: {
                  create: items.map(({ requestItem, product }) => ({
                    productId: product.id,
                    productNameSnapshot: product.name,
                    productImageUrlSnapshot: product.imageUrl,
                    unitPriceSnapshot: product.price,
                    quantity: requestItem.quantity,
                    lineTotal: product.price.mul(requestItem.quantity),
                  })),
                },
              },
            });
          }

          for (const item of request.items) {
            const product = productsById.get(item.productId);
            if (!product) continue;

            const remainingStock = product.stock - item.quantity;
            if (remainingStock > product.lowStockThreshold) continue;

            const href = `/supplier/products/${product.id}/edit`;
            const unreadNotification = await transaction.notification.findFirst(
              {
                where: {
                  userId: product.supplier.id,
                  type: NotificationType.LOW_STOCK,
                  readAt: null,
                  href,
                },
                select: { id: true },
              },
            );

            if (!unreadNotification) {
              await transaction.notification.create({
                data: {
                  userId: product.supplier.id,
                  type: NotificationType.LOW_STOCK,
                  title: `Low stock: ${product.name}`,
                  message: `${remainingStock} ${remainingStock === 1 ? "unit remains" : "units remain"}; your alert threshold is ${product.lowStockThreshold}.`,
                  href,
                },
              });
            }
          }

          const completedCheckout = await transaction.checkoutGroup.findUnique({
            where: { id: createdCheckout.id },
            select: checkoutReceiptSelection,
          });

          if (!completedCheckout) {
            throw new Error("Checkout receipt could not be created.");
          }

          return completedCheckout;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5_000,
          timeout: 10_000,
        },
      );

      return toReceipt(checkout);
    } catch (error) {
      if (error instanceof CheckoutConflictError) throw error;

      const errorCode = prismaErrorCode(error);

      if (errorCode === "P2002") {
        const receipt = await findCheckoutReceipt(reference, customerId);
        if (receipt) return receipt;
      }

      if (errorCode === "P2034" && attempt < MAX_TRANSACTION_ATTEMPTS) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Checkout could not be completed after retrying.");
}

export async function getCheckoutReceipt(
  customerId: string,
  reference: string,
) {
  return findCheckoutReceipt(reference, customerId);
}
