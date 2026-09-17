import { describe, expect, it } from "vitest";

import {
  canAccessOrder,
  getAllowedOrderTransitions,
  isAllowedOrderTransition,
  ORDER_STATUSES,
  type OrderActorRole,
  type OrderStatusValue,
} from "@/lib/orders/workflow";

const expectedTransitions: Record<
  OrderActorRole,
  Record<OrderStatusValue, OrderStatusValue[]>
> = {
  ADMIN: {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
  },
  SUPPLIER: {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
  },
  CUSTOMER: {
    PENDING: ["CANCELLED"],
    CONFIRMED: [],
    SHIPPED: [],
    DELIVERED: [],
    CANCELLED: [],
  },
};

describe("order transition policy", () => {
  it.each(["ADMIN", "SUPPLIER", "CUSTOMER"] satisfies OrderActorRole[])(
    "exposes only valid %s actions",
    (role) => {
      for (const status of ORDER_STATUSES) {
        expect(getAllowedOrderTransitions(status, role)).toEqual(
          expectedTransitions[role][status],
        );

        for (const target of ORDER_STATUSES) {
          expect(isAllowedOrderTransition(status, target, role)).toBe(
            expectedTransitions[role][status].includes(target),
          );
        }
      }
    },
  );

  it("never allows shipped or delivered orders to be cancelled", () => {
    for (const role of [
      "ADMIN",
      "SUPPLIER",
      "CUSTOMER",
    ] satisfies OrderActorRole[]) {
      expect(isAllowedOrderTransition("SHIPPED", "CANCELLED", role)).toBe(
        false,
      );
      expect(isAllowedOrderTransition("DELIVERED", "CANCELLED", role)).toBe(
        false,
      );
    }
  });
});

describe("order access policy", () => {
  const order = { customerId: "customer-1", supplierId: "supplier-1" };

  it("allows administrators to access any order", () => {
    expect(canAccessOrder({ id: "admin-1", role: "ADMIN" }, order)).toBe(true);
  });

  it("limits customers to their own orders", () => {
    expect(canAccessOrder({ id: "customer-1", role: "CUSTOMER" }, order)).toBe(
      true,
    );
    expect(canAccessOrder({ id: "customer-2", role: "CUSTOMER" }, order)).toBe(
      false,
    );
  });

  it("limits approved suppliers to their assigned orders", () => {
    expect(
      canAccessOrder(
        {
          id: "supplier-1",
          role: "SUPPLIER",
          supplierStatus: "APPROVED",
        },
        order,
      ),
    ).toBe(true);
    expect(
      canAccessOrder(
        {
          id: "supplier-2",
          role: "SUPPLIER",
          supplierStatus: "APPROVED",
        },
        order,
      ),
    ).toBe(false);
    expect(
      canAccessOrder(
        {
          id: "supplier-1",
          role: "SUPPLIER",
          supplierStatus: "PENDING",
        },
        order,
      ),
    ).toBe(false);
  });
});
