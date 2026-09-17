"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  PackageOpen,
  ShieldCheck,
  Store,
  TriangleAlert,
} from "lucide-react";

import {
  getCartAvailableSubtotal,
  getCartDisplayProduct,
  type CartDisplayItem,
  useCart,
} from "@/components/cart/cart-provider";
import { CartFeedback } from "@/components/cart/cart-feedback";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CheckoutButton } from "@/components/cart/checkout-button";
import { ClearCartDialog } from "@/components/cart/clear-cart-dialog";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCartPrice } from "@/lib/cart";
import { cn } from "@/lib/utils";

type SupplierGroup = {
  id: string;
  name: string;
  items: CartDisplayItem[];
};

function groupItemsBySupplier(items: CartDisplayItem[]) {
  const groups = new Map<string, SupplierGroup>();

  items.forEach((item) => {
    const product = getCartDisplayProduct(item);
    const existingGroup = groups.get(product.supplierId);

    if (existingGroup) {
      existingGroup.items.push(item);
    } else {
      groups.set(product.supplierId, {
        id: product.supplierId,
        name: product.supplierName,
        items: [item],
      });
    }
  });

  return Array.from(groups.values());
}

function CartPageSkeleton() {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4">
        {[0, 1].map((item) => (
          <div key={item} className="border-border rounded-xl border p-5">
            <Skeleton className="h-5 w-40" />
            <div className="mt-5 flex gap-4">
              <Skeleton className="size-24 shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export function CartPageContent() {
  const { items, itemCount, hydrated, reconciliationStatus } = useCart();
  const supplierGroups = groupItemsBySupplier(items);
  const subtotal = getCartAvailableSubtotal(items);
  const unavailableCount = items.filter(
    (item) => item.live && !item.live.orderable,
  ).length;
  const priceChangeCount = items.filter((item) =>
    item.live?.issues.some((issue) => issue.code === "PRICE_CHANGED"),
  ).length;

  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <PageHeader
          eyebrow="Customer cart"
          title="Review products by supplier"
          description="Your cart is saved to this browser. Stock, supplier approval, and prices are checked against the server whenever the cart changes."
          actions={
            hydrated && items.length > 0 ? (
              <>
                <Link
                  href="/products"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                  Continue shopping
                </Link>
                <ClearCartDialog />
              </>
            ) : null
          }
        />

        {!hydrated ? (
          <CartPageSkeleton />
        ) : items.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="Your cart is ready for its first product"
            description="Products you add are kept locally for this customer account, so you can return and continue later on this browser."
            className="mt-8 py-16"
            action={
              <Link href="/products" className={buttonVariants()}>
                Browse the catalog
              </Link>
            }
          />
        ) : (
          <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <div className="min-w-0 space-y-5">
              <CartFeedback />

              {supplierGroups.map((group) => (
                <section
                  key={group.id}
                  className="border-border/80 bg-muted/25 overflow-hidden rounded-2xl border"
                  aria-labelledby={`supplier-${group.id}`}
                >
                  <div className="border-border/70 bg-card flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                        <Store className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h2
                          id={`supplier-${group.id}`}
                          className="truncate font-semibold"
                        >
                          {group.name}
                        </h2>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {group.items.length}{" "}
                          {group.items.length === 1 ? "product" : "products"}
                        </p>
                      </div>
                    </div>
                    <p className="font-mono text-sm font-semibold tabular-nums">
                      {formatCartPrice(getCartAvailableSubtotal(group.items))}
                    </p>
                  </div>
                  <div className="grid gap-3 p-3 sm:p-4">
                    {group.items.map((item) => (
                      <CartItemRow key={item.productId} item={item} />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <aside className="border-border/80 bg-card shadow-card rounded-2xl border p-5 lg:sticky lg:top-24">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="text-primary size-5"
                  aria-hidden="true"
                />
                <h2 className="font-semibold">Cart summary</h2>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Items</dt>
                  <dd className="font-mono font-semibold tabular-nums">
                    {itemCount}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Suppliers</dt>
                  <dd className="font-mono font-semibold tabular-nums">
                    {supplierGroups.length}
                  </dd>
                </div>
                <div className="border-border flex items-end justify-between gap-4 border-t pt-4">
                  <dt>
                    <span className="block font-semibold">
                      Available subtotal
                    </span>
                    <span className="text-muted-foreground mt-1 block text-xs">
                      Excludes unavailable products
                    </span>
                  </dt>
                  <dd className="font-mono text-xl font-semibold tabular-nums">
                    {formatCartPrice(subtotal)}
                  </dd>
                </div>
              </dl>

              <div
                className={cn(
                  "mt-5 rounded-lg border p-3",
                  unavailableCount > 0 || priceChangeCount > 0
                    ? "border-warning/30 bg-warning-subtle"
                    : "border-success/25 bg-success-subtle",
                )}
                role="status"
              >
                <div className="flex items-start gap-2">
                  {unavailableCount > 0 || priceChangeCount > 0 ? (
                    <TriangleAlert
                      className="text-warning-foreground mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <CheckCircle2
                      className="text-success-foreground mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <div className="text-xs leading-5">
                    {reconciliationStatus === "checking" ? (
                      <p>Checking the latest catalog details now.</p>
                    ) : unavailableCount > 0 ? (
                      <p>
                        {unavailableCount}{" "}
                        {unavailableCount === 1
                          ? "product needs"
                          : "products need"}{" "}
                        attention before checkout.
                      </p>
                    ) : priceChangeCount > 0 ? (
                      <p>
                        Review and accept the current price for{" "}
                        {priceChangeCount}{" "}
                        {priceChangeCount === 1 ? "product" : "products"}.
                      </p>
                    ) : (
                      <p>
                        Prices and stock are current. They will be checked again
                        before an order is created.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <CheckoutButton />

              <p className="text-muted-foreground mt-4 text-xs leading-5">
                Each supplier is shown separately so fulfilment remains clear,
                even when one cart contains products from several businesses.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
