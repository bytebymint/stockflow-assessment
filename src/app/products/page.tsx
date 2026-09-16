import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PackageSearch, ShieldCheck } from "lucide-react";

import { ProductCard } from "@/components/catalog/product-card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublicProducts } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Product catalog",
  description:
    "Browse available stock from approved suppliers in the StockFlow catalog.",
};

export default async function ProductsPage() {
  const products = await getPublicProducts();

  return (
    <main id="main-content" className="flex-1">
      <section className="surface-grid border-border/70 border-b">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-8">
          <div className="max-w-3xl">
            <p className="text-primary text-xs font-bold tracking-[0.14em] uppercase">
              Public catalog
            </p>
            <h1 className="text-foreground mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              Operational products, with stock you can trust.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-7 sm:text-lg">
              Browse live availability from approved StockFlow suppliers. Sign
              in only when you are ready to begin an order.
            </p>
          </div>
          <div className="border-border/80 bg-card shadow-card flex max-w-sm items-start gap-3 rounded-xl border p-4">
            <span className="bg-success-subtle text-success-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold">Approved suppliers only</p>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                Archived listings and unapproved suppliers stay out of the
                public catalog.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
        aria-labelledby="catalog-results-heading"
      >
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="catalog-results-heading" className="text-xl font-semibold">
              Available catalog
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {products.length === 1
                ? "1 public product"
                : `${products.length} public products`}
            </p>
          </div>
          <p className="text-muted-foreground text-sm">
            Availability is shown on every listing.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="No public products yet"
            description="Approved suppliers have not published any active products. Check back after the catalog is updated."
            action={
              <Link
                href="/"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Return home
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            }
          />
        )}
      </section>
    </main>
  );
}
