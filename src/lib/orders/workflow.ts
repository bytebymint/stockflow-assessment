export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];
export type OrderActorRole = "ADMIN" | "SUPPLIER" | "CUSTOMER";

type OrderActor = {
  id: string;
  role: OrderActorRole;
  supplierStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
};

type OrderOwnership = { customerId: string; supplierId: string };

const validTransitions: Record<OrderStatusValue, OrderStatusValue[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function getAllowedOrderTransitions(
  status: OrderStatusValue,
  role: OrderActorRole,
) {
  if (role === "CUSTOMER") {
    return status === "PENDING" ? (["CANCELLED"] as OrderStatusValue[]) : [];
  }

  return validTransitions[status];
}

export function isAllowedOrderTransition(
  from: OrderStatusValue,
  to: OrderStatusValue,
  role: OrderActorRole,
) {
  return getAllowedOrderTransitions(from, role).includes(to);
}

export function canAccessOrder(actor: OrderActor, order: OrderOwnership) {
  return (
    actor.role === "ADMIN" ||
    (actor.role === "CUSTOMER" && order.customerId === actor.id) ||
    (actor.role === "SUPPLIER" &&
      actor.supplierStatus === "APPROVED" &&
      order.supplierId === actor.id)
  );
}

export const orderStatusDetails: Record<
  OrderStatusValue,
  { label: string; description: string }
> = {
  PENDING: {
    label: "Pending",
    description: "Waiting for the supplier to confirm the order.",
  },
  CONFIRMED: {
    label: "Confirmed",
    description: "The supplier accepted the order and is preparing it.",
  },
  SHIPPED: {
    label: "Shipped",
    description: "The order has left the supplier and is in transit.",
  },
  DELIVERED: {
    label: "Delivered",
    description: "The order has completed its fulfilment journey.",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "The order was cancelled and its reserved stock was restored.",
  },
};

export function transitionActionLabel(status: OrderStatusValue) {
  switch (status) {
    case "CONFIRMED":
      return "Confirm order";
    case "SHIPPED":
      return "Mark as shipped";
    case "DELIVERED":
      return "Mark as delivered";
    case "CANCELLED":
      return "Cancel order";
    default:
      return orderStatusDetails[status].label;
  }
}
