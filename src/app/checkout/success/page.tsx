import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, PackageCheck, ReceiptText, Store } from "lucide-react";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireRole } from "@/lib/auth/session";
import { getCheckoutReceipt } from "@/lib/checkout";
import { formatCartPrice } from "@/lib/cart";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Checkout complete",
  description: "Review the supplier orders created by your StockFlow checkout.",
};

type CheckoutSuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const user = await requireRole("CUSTOMER");
  const rawReference = (await searchParams).reference;
  const reference = Array.isArray(rawReference)
    ? rawReference[0]
    : rawReference;

  if (!reference) notFound();

  const checkout = await getCheckoutReceipt(user.id, reference);
  if (!checkout) notFound();

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground shadow-float fixed top-3 left-3 z-[100] -translate-y-20 rounded-lg px-4 py-3 text-sm font-semibold transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <PublicHeader />
      <main id="main-content" className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <section className="border-success/25 bg-success-subtle rounded-2xl border p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <span className="bg-success text-success-foreground flex size-12 shrink-0 items-center justify-center rounded-xl">
                <CheckCircle2 className="size-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-success-foreground text-xs font-bold tracking-[0.14em] uppercase">
                  Checkout complete
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                  Your orders are ready for review.
                </h1>
                <p className="text-muted-foreground mt-3 max-w-2xl leading-7">
                  Stock was reserved and one pending order was created for each
                  supplier. All orders remain connected by checkout reference{" "}
                  <span className="text-foreground font-mono font-semibold">
                    {checkout.reference}
                  </span>
                  .
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6" aria-labelledby="order-summary-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-primary text-xs font-bold tracking-[0.14em] uppercase">
                  Receipt
                </p>
                <h2 id="order-summary-title" className="mt-2 text-xl font-bold">
                  {checkout.orderCount}{" "}
                  {checkout.orderCount === 1
                    ? "supplier order"
                    : "supplier orders"}
                </h2>
              </div>
              <p className="font-mono text-2xl font-bold tabular-nums">
                {formatCartPrice(checkout.total)}
              </p>
            </div>

            <div className="mt-4 grid gap-4">
              {checkout.orders.map((order) => (
                <article
                  key={order.id}
                  className="border-border/80 bg-card shadow-card rounded-2xl border p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                        <Store className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {order.supplierName}
                        </h3>
                        <p className="text-muted-foreground mt-1 font-mono text-xs">
                          {order.orderNumber}
                        </p>
                      </div>
                    </div>
                    <StatusBadge label="Pending" variant="warning" />
                  </div>
                  <dl className="border-border mt-4 grid grid-cols-2 gap-4 border-t pt-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                        <PackageCheck className="size-4" aria-hidden="true" />
                        Products
                      </dt>
                      <dd className="mt-1 font-semibold">
                        {order.itemCount}{" "}
                        {order.itemCount === 1 ? "product" : "products"}
                      </dd>
                    </div>
                    <div className="text-right">
                      <dt className="text-muted-foreground flex items-center justify-end gap-2 text-xs">
                        <ReceiptText className="size-4" aria-hidden="true" />
                        Subtotal
                      </dt>
                      <dd className="mt-1 font-mono font-semibold tabular-nums">
                        {formatCartPrice(order.subtotal)}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className={cn(buttonVariants(), "sm:w-auto")}
            >
              Continue shopping
            </Link>
            <Link
              href="/orders"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "sm:w-auto",
              )}
            >
              View your orders
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
