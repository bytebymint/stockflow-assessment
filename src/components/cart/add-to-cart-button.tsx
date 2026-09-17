"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import type { CartItemSnapshot } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  productId,
  productName,
  snapshot,
  disabled = false,
  compact = false,
  className,
}: {
  productId: string;
  productName: string;
  snapshot: CartItemSnapshot;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const { addItem } = useCart();

  return (
    <Button
      type="button"
      size={compact ? "sm" : "lg"}
      className={cn(!compact && "w-full", className)}
      disabled={disabled}
      onClick={() => {
        addItem(productId, snapshot);
        toast.success(`${productName} added to your cart.`);
      }}
    >
      <ShoppingCart data-icon="inline-start" aria-hidden="true" />
      {disabled ? "Out of stock" : "Add to cart"}
    </Button>
  );
}
