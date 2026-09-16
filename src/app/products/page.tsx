import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PackageSearch, RotateCcw, ShieldCheck } from "lucide-react";

import {
  ActiveCatalogFilters,
  activeFilterCount,
  CatalogDesktopFilters,
  CatalogMobileFilters,
  CatalogSearch,
  CatalogSortControl,
} from "@/components/catalog/catalog-discovery";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { ProductCard } from "@/components/catalog/product-card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  catalogHref,
  getCatalogFilterOptions,
  getPublicCatalogPage,
  parseCatalogQuery,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Product catalog",
  description:
    "Search and filter available stock from approved suppliers in the StockFlow catalog.",
};

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function normalizedQueryString(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else if (value !== undefined) {
      params.set(key, value);
    }
  });
  params.sort();

  return params.toString();
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const rawSearchParams = await searchParams;
  const query = parseCatalogQuery(rawSearchParams);
  const canonicalHref = catalogHref(query);
  const canonicalSearch = canonicalHref.split("?")[1] ?? "";

  if (
    normalizedQueryString(rawSearchParams) !==
    normalizedQueryString(
      Object.fromEntries(new URLSearchParams(canonicalSearch)),
    )
  ) {
    redirect(canonicalHref);
  }

  const [catalog, options] = await Promise.all([
    getPublicCatalogPage(query),
    getCatalogFilterOptions(),
  ]);
  const effectiveQuery = { ...query, page: catalog.currentPage };

  if (effectiveQuery.page !== query.page) {
    redirect(catalogHref(effectiveQuery));
  }

  const hasDiscoveryState = Boolean(query.q) || activeFilterCount(query) > 0;

  return (
    <main id="main-content" className="flex-1">
      <section className="surface-grid border-border/70 border-b">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-8">
          <div className="max-w-3xl">
            <p className="text-primary text-xs font-bold tracking-[0.14em] uppercase">
              Public catalog
            </p>
            <h1 className="text-foreground mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              Find the right stock, without the guesswork.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-7 sm:text-lg">
              Search live products from approved StockFlow suppliers, then
              refine the results by category, price, and availability.
            </p>
            <CatalogSearch query={effectiveQuery} />
          </div>
          <div className="border-border/80 bg-card shadow-card flex max-w-sm items-start gap-3 rounded-xl border p-4">
            <span className="bg-success-subtle text-success-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold">Approved suppliers only</p>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                Archived listings and unapproved suppliers stay out of every
                search result.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
        aria-labelledby="catalog-results-heading"
      >
        <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="catalog-results-heading" className="text-xl font-semibold">
              {query.q ? `Results for “${query.q}”` : "Available catalog"}
            </h2>
            <p
              className="text-muted-foreground mt-1 text-sm"
              aria-live="polite"
            >
              {catalog.total === 1
                ? "1 product found"
                : `${catalog.total} products found`}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <CatalogMobileFilters options={options} query={effectiveQuery} />
            <CatalogSortControl query={effectiveQuery} />
          </div>
        </div>

        <ActiveCatalogFilters options={options} query={effectiveQuery} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <CatalogDesktopFilters options={options} query={effectiveQuery} />

          <div className="min-w-0">
            {catalog.products.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {catalog.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : hasDiscoveryState ? (
              <EmptyState
                icon={PackageSearch}
                title="No products match these filters"
                description="Try a broader search, remove one or more filters, or clear everything to return to the full catalog."
                action={
                  <Link
                    href="/products"
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    <RotateCcw data-icon="inline-start" aria-hidden="true" />
                    Clear search and filters
                  </Link>
                }
              />
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
                  </Link>
                }
              />
            )}

            <CatalogPagination
              currentPage={catalog.currentPage}
              pageCount={catalog.pageCount}
              query={effectiveQuery}
              total={catalog.total}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
