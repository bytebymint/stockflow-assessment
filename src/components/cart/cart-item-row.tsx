"use client";

import Link from "next/link";
import { AlertTriangle, Minus, Plus, RefreshCcw, Trash2 } from "lucide-react";

import {
  type CartDisplayItem,
  getCartDisplayProduct,
  useCart,
} from "@/components/cart/cart-provider";
import { ProductMedia } from "@/components/catalog/product-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCartPrice } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function CartItemRow({
  item,
  compact = false,
}: {
  item: CartDisplayItem;
  compact?: boolean;
}) {
  const { updateQuantity, removeItem, acceptCurrentPrice } = useCart();
  const product = getCartDisplayProduct(item);
  const priceChanged = item.live?.issues.some(
    (issue) => issue.code === "PRICE_CHANGED",
  );
  const blockingIssues =
    item.live?.issues.filter((issue) => issue.code !== "PRICE_CHANGED") ?? [];
  const quantityAtStockLimit =
    typeof product.stock === "number" && item.quantity >= product.stock;

  return (
    <article
      className={cn(
        "border-border/80 bg-card rounded-xl border",
        compact ? "p-3" : "p-4 sm:p-5",
      )}
    >
      <div
        className={cn(
          "grid min-w-0 gap-3",
          compact
            ? "grid-cols-[4.5rem_minmax(0,1fr)]"
            : "grid-cols-[5rem_minmax(0,1fr)] sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:gap-4",
        )}
      >
        <Link
          href={`/products/${item.productId}`}
          className="focus-visible:ring-ring/30 overflow-hidden rounded-lg focus-visible:ring-3 focus-visible:outline-none"
          aria-label={`View ${product.name}`}
        >
          <ProductMedia
            imageUrl={product.imageUrl}
            imageAlt={product.imageAlt}
            productName={product.name}
            className="aspect-square h-full min-h-18"
            sizes={compact ? "72px" : "96px"}
          />
        </Link>

        <div className="min-w-0">
          <p className="text-muted-foreground truncate text-xs font-medium">
            {product.supplierName}
          </p>
          <h3 className="mt-1 text-sm font-semibold sm:text-base">
            <Link
              href={`/products/${item.productId}`}
              className="hover:text-primary focus-visible:ring-ring/30 inline-flex min-h-11 items-center rounded-sm transition-colors focus-visible:ring-3 focus-visible:outline-none"
            >
              {product.name}
            </Link>
          </h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-mono text-sm font-semibold tabular-nums">
              {formatCartPrice(product.unitPrice)}
            </span>
            {priceChanged ? (
              <span className="text-muted-foreground text-xs line-through">
                {formatCartPrice(item.snapshot.unitPrice)}
              </span>
            ) : null}
          </div>
        </div>

        {!compact ? (
          <p className="col-span-2 font-mono text-sm font-semibold tabular-nums sm:col-span-1 sm:text-right">
            {formatCartPrice(Number(product.unitPrice) * item.quantity)}
          </p>
        ) : null}
      </div>

      {blockingIssues.length > 0 || priceChanged ? (
        <div className="border-warning/30 bg-warning-subtle mt-3 rounded-lg border p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="text-warning-foreground mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0 text-xs leading-5">
              {blockingIssues.map((issue) => (
                <p key={issue.code}>{issue.message}</p>
              ))}
              {priceChanged ? (
                <div className="flex flex-wrap items-center gap-2">
                  <p>The current price is shown above.</p>
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    className="h-auto min-h-11 px-0"
                    onClick={() => acceptCurrentPrice(item.productId)}
                  >
                    <RefreshCcw aria-hidden="true" />
                    Accept current price
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="border-border/70 mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <div
          className="flex items-center"
          aria-label={`Quantity for ${product.name}`}
        >
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-r-none"
            disabled={item.quantity <= 1}
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            aria-label={`Decrease ${product.name} quantity`}
          >
            <Minus aria-hidden="true" />
          </Button>
          <label
            className="sr-only"
            htmlFor={`cart-quantity-${item.productId}`}
          >
            Quantity for {product.name}
          </label>
          <Input
            id={`cart-quantity-${item.productId}`}
            type="number"
            inputMode="numeric"
            min={1}
            max={999}
            value={item.quantity}
            onChange={(event) =>
              updateQuantity(item.productId, Number(event.target.value))
            }
            className="w-14 [appearance:textfield] rounded-none border-x-0 px-1 text-center font-mono tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-l-none"
            disabled={quantityAtStockLimit || item.quantity >= 999}
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            aria-label={`Increase ${product.name} quantity`}
          >
            <Plus aria-hidden="true" />
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => removeItem(item.productId)}
        >
          <Trash2 data-icon="inline-start" aria-hidden="true" />
          Remove
        </Button>
      </div>
    </article>
  );
}
