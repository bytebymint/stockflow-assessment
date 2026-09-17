"use client";

import Link from "next/link";
import { ArrowRight, PackageOpen, ShoppingCart } from "lucide-react";

import {
  getCartAvailableSubtotal,
  useCart,
} from "@/components/cart/cart-provider";
import { CartFeedback } from "@/components/cart/cart-feedback";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCartPrice } from "@/lib/cart";
import { cn } from "@/lib/utils";

function CartDrawerSkeleton() {
  return (
    <div className="space-y-3 px-4" aria-label="Loading saved cart">
      {[0, 1].map((item) => (
        <div key={item} className="border-border rounded-xl border p-3">
          <div className="flex gap-3">
            <Skeleton className="size-18 shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CartDrawer() {
  const { items, itemCount, hydrated, cartOpen, setCartOpen } = useCart();
  const subtotal = getCartAvailableSubtotal(items);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="relative shrink-0"
            aria-label={
              itemCount === 0
                ? "Open cart, empty"
                : `Open cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`
            }
          />
        }
      >
        <ShoppingCart aria-hidden="true" />
        {hydrated && itemCount > 0 ? (
          <span className="bg-primary text-primary-foreground ring-background absolute -top-1.5 -right-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.65rem] font-bold tabular-nums ring-2">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        ) : null}
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(30rem,100vw)] sm:max-w-md">
        <SheetHeader className="border-b pr-14">
          <SheetTitle>Your cart</SheetTitle>
          <SheetDescription aria-live="polite">
            {itemCount === 0
              ? "No products saved yet."
              : `${itemCount} ${itemCount === 1 ? "item" : "items"} saved across approved suppliers.`}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {!hydrated ? (
            <CartDrawerSkeleton />
          ) : items.length === 0 ? (
            <div className="px-4 py-6">
              <EmptyState
                icon={PackageOpen}
                title="Your cart is empty"
                description="Browse the catalog and add products when you are ready to plan an order."
                action={
                  <Link
                    href="/products"
                    onClick={() => setCartOpen(false)}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Browse products
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="space-y-3 px-4 pb-4">
              <CartFeedback />
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} compact />
              ))}
            </div>
          )}
        </div>

        {hydrated && items.length > 0 ? (
          <SheetFooter className="border-t">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Available subtotal
                </p>
                <p className="mt-1 font-mono text-xl font-semibold tabular-nums">
                  {formatCartPrice(subtotal)}
                </p>
              </div>
              <p className="text-muted-foreground max-w-40 text-right text-xs leading-5">
                Rechecked before checkout
              </p>
            </div>
            <Link href="/cart" className={cn(buttonVariants(), "w-full")}>
              Review full cart
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
