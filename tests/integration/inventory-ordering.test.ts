import { randomUUID } from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/generated/prisma/client";
import { transitionOrder } from "@/app/(workspace)/order-actions";
import { CheckoutConflictError, createCheckout } from "@/lib/checkout";
import { getDatabase } from "@/lib/database";
import {
  createCategory,
  createCustomer,
  createProduct,
  createSupplier,
} from "./fixtures";

const authMocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: authMocks.getCurrentUser,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

function checkoutRequest(
  items: Array<{ productId: string; quantity: number; unitPrice: string }>,
) {
  return { checkoutToken: randomUUID(), items };
}

function cancellationForm(orderId: string) {
  const formData = new FormData();
  formData.set("orderId", orderId);
  formData.set("expectedStatus", "PENDING");
  formData.set("targetStatus", "CANCELLED");
  return formData;
}

describe("atomic checkout", () => {
  it("creates one order per supplier and decrements stock together", async () => {
    const database = getDatabase();
    const [customer, firstSupplier, secondSupplier, category] =
      await Promise.all([
        createCustomer(),
        createSupplier("first supplier"),
        createSupplier("second supplier"),
        createCategory(),
      ]);
    const [firstProduct, secondProduct] = await Promise.all([
      createProduct({
        categoryId: category.id,
        label: "First product",
        price: "12.50",
        stock: 5,
        supplierId: firstSupplier.id,
      }),
      createProduct({
        categoryId: category.id,
        label: "Second product",
        price: "7.25",
        stock: 3,
        supplierId: secondSupplier.id,
      }),
    ]);

    const receipt = await createCheckout(
      customer.id,
      checkoutRequest([
        {
          productId: firstProduct.id,
          quantity: 2,
          unitPrice: "12.50",
        },
        {
          productId: secondProduct.id,
          quantity: 1,
          unitPrice: "7.25",
        },
      ]),
    );

    expect(receipt.orderCount).toBe(2);
    expect(receipt.total).toBe("32.25");

    const checkout = await database.checkoutGroup.findUniqueOrThrow({
      where: { id: receipt.id },
      include: { orders: { include: { items: true } } },
    });
    expect(checkout.orders).toHaveLength(2);
    expect(checkout.orders.every((order) => order.items.length === 1)).toBe(
      true,
    );

    const products = await database.product.findMany({
      where: { id: { in: [firstProduct.id, secondProduct.id] } },
      orderBy: { name: "asc" },
    });
    expect(products.map((product) => product.stock)).toEqual([3, 2]);

    const firstOrderItem = checkout.orders
      .flatMap((order) => order.items)
      .find((item) => item.productId === firstProduct.id);
    expect(firstOrderItem?.productNameSnapshot).toBe("First product");
    expect(firstOrderItem?.unitPriceSnapshot.toFixed(2)).toBe("12.50");
  });

  it("rolls back every change when one product lacks stock", async () => {
    const database = getDatabase();
    const [customer, supplier, category] = await Promise.all([
      createCustomer(),
      createSupplier(),
      createCategory(),
    ]);
    const [availableProduct, constrainedProduct] = await Promise.all([
      createProduct({
        categoryId: category.id,
        label: "Available product",
        stock: 5,
        supplierId: supplier.id,
      }),
      createProduct({
        categoryId: category.id,
        label: "Constrained product",
        stock: 1,
        supplierId: supplier.id,
      }),
    ]);

    await expect(
      createCheckout(
        customer.id,
        checkoutRequest([
          {
            productId: availableProduct.id,
            quantity: 2,
            unitPrice: "10.00",
          },
          {
            productId: constrainedProduct.id,
            quantity: 2,
            unitPrice: "10.00",
          },
        ]),
      ),
    ).rejects.toBeInstanceOf(CheckoutConflictError);

    const [products, checkoutCount, orderCount] = await Promise.all([
      database.product.findMany({
        where: { id: { in: [availableProduct.id, constrainedProduct.id] } },
        orderBy: { name: "asc" },
      }),
      database.checkoutGroup.count(),
      database.order.count(),
    ]);
    expect(products.map((product) => product.stock)).toEqual([5, 1]);
    expect(checkoutCount).toBe(0);
    expect(orderCount).toBe(0);
  });

  it("allows only one simultaneous checkout to claim the last unit", async () => {
    const database = getDatabase();
    const [firstCustomer, secondCustomer, supplier, category] =
      await Promise.all([
        createCustomer("first customer"),
        createCustomer("second customer"),
        createSupplier(),
        createCategory(),
      ]);
    const product = await createProduct({
      categoryId: category.id,
      label: "Last unit product",
      stock: 1,
      supplierId: supplier.id,
    });
    const requestItem = {
      productId: product.id,
      quantity: 1,
      unitPrice: "10.00",
    };

    const results = await Promise.allSettled([
      createCheckout(firstCustomer.id, checkoutRequest([{ ...requestItem }])),
      createCheckout(secondCustomer.id, checkoutRequest([{ ...requestItem }])),
    ]);

    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    const rejected = results.find((result) => result.status === "rejected");
    expect(rejected).toMatchObject({
      status: "rejected",
      reason: expect.any(CheckoutConflictError),
    });

    const [storedProduct, orderCount, checkoutCount, minimumStock] =
      await Promise.all([
        database.product.findUniqueOrThrow({ where: { id: product.id } }),
        database.order.count(),
        database.checkoutGroup.count(),
        database.product.aggregate({ _min: { stock: true } }),
      ]);
    expect(storedProduct.stock).toBe(0);
    expect(minimumStock._min.stock).toBeGreaterThanOrEqual(0);
    expect(orderCount).toBe(1);
    expect(checkoutCount).toBe(1);
  });

  it("keeps the database stock constraint as a final safety net", async () => {
    const [supplier, category] = await Promise.all([
      createSupplier(),
      createCategory(),
    ]);

    await expect(
      createProduct({
        categoryId: category.id,
        label: "Invalid negative product",
        stock: -1,
        supplierId: supplier.id,
      }),
    ).rejects.toThrow();

    expect(await getDatabase().product.count()).toBe(0);
  });
});

describe("cancellation stock restoration", () => {
  it("restores stock exactly once under simultaneous and repeated requests", async () => {
    const database = getDatabase();
    const [customer, supplier, category] = await Promise.all([
      createCustomer(),
      createSupplier(),
      createCategory(),
    ]);
    const product = await createProduct({
      categoryId: category.id,
      label: "Cancellation product",
      stock: 2,
      supplierId: supplier.id,
    });
    const receipt = await createCheckout(
      customer.id,
      checkoutRequest([
        { productId: product.id, quantity: 1, unitPrice: "10.00" },
      ]),
    );
    const orderId = receipt.orders[0].id;

    authMocks.getCurrentUser.mockResolvedValue({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      role: UserRole.CUSTOMER,
      supplierStatus: null,
    });

    const outcomes = await Promise.all([
      transitionOrder({ status: "idle" }, cancellationForm(orderId)),
      transitionOrder({ status: "idle" }, cancellationForm(orderId)),
    ]);

    expect(
      outcomes.filter((outcome) => outcome.status === "success"),
    ).toHaveLength(1);
    expect(
      outcomes.filter((outcome) => outcome.status === "error"),
    ).toHaveLength(1);

    const [cancelledOrder, restoredProduct] = await Promise.all([
      database.order.findUniqueOrThrow({ where: { id: orderId } }),
      database.product.findUniqueOrThrow({ where: { id: product.id } }),
    ]);
    expect(cancelledOrder.status).toBe("CANCELLED");
    expect(cancelledOrder.stockRestoredAt).not.toBeNull();
    expect(restoredProduct.stock).toBe(2);

    const restoredAt = cancelledOrder.stockRestoredAt?.toISOString();
    const repeatedOutcome = await transitionOrder(
      { status: "idle" },
      cancellationForm(orderId),
    );
    const [repeatedOrder, repeatedProduct] = await Promise.all([
      database.order.findUniqueOrThrow({ where: { id: orderId } }),
      database.product.findUniqueOrThrow({ where: { id: product.id } }),
    ]);

    expect(repeatedOutcome.status).toBe("error");
    expect(repeatedProduct.stock).toBe(2);
    expect(repeatedOrder.stockRestoredAt?.toISOString()).toBe(restoredAt);
  });
});
