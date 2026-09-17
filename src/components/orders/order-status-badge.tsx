import { StatusBadge } from "@/components/ui/status-badge";
import {
  orderStatusDetails,
  type OrderStatusValue,
} from "@/lib/orders/workflow";

const statusVariants: Record<
  OrderStatusValue,
  "warning" | "info" | "success" | "destructive"
> = {
  PENDING: "warning",
  CONFIRMED: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatusValue }) {
  return (
    <StatusBadge
      label={orderStatusDetails[status].label}
      variant={statusVariants[status]}
    />
  );
}
