import { StatusBadge } from "@/components/ui/status-badge";

type StockStatusProps = {
  stock: number;
  lowStockThreshold: number;
  showQuantity?: boolean;
};

export function StockStatus({
  stock,
  lowStockThreshold,
  showQuantity = false,
}: StockStatusProps) {
  if (stock === 0) {
    return <StatusBadge label="Out of stock" variant="destructive" />;
  }

  if (stock <= lowStockThreshold) {
    return (
      <StatusBadge
        label={showQuantity ? `Low stock · ${stock} available` : "Low stock"}
        variant="warning"
      />
    );
  }

  return (
    <StatusBadge
      label={showQuantity ? `In stock · ${stock} available` : "In stock"}
      variant="success"
    />
  );
}
