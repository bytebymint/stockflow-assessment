import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  catalogAvailabilityOptions,
  catalogHref,
  catalogSortOptions,
  type CatalogQuery,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

type FilterOptions = {
  categories: Array<{ name: string; slug: string }>;
  suppliers: Array<{ id: string; name: string }>;
};

type DiscoveryProps = {
  options: FilterOptions;
  query: CatalogQuery;
};

const selectClassName =
  "border-input bg-card focus-visible:border-ring focus-visible:ring-ring/25 h-11 w-full rounded-lg border px-3 text-base shadow-xs outline-none transition-[border-color,box-shadow] duration-200 focus-visible:ring-3 md:text-sm";

function PreservedFilterFields({ query }: { query: CatalogQuery }) {
  return (
    <>
      {query.category ? (
        <input type="hidden" name="category" value={query.category} />
      ) : null}
      {query.supplier ? (
        <input type="hidden" name="supplier" value={query.supplier} />
      ) : null}
      {query.minPrice ? (
        <input type="hidden" name="minPrice" value={query.minPrice} />
      ) : null}
      {query.maxPrice ? (
        <input type="hidden" name="maxPrice" value={query.maxPrice} />
      ) : null}
      {query.availability !== "all" ? (
        <input type="hidden" name="availability" value={query.availability} />
      ) : null}
    </>
  );
}

export function CatalogSearch({ query }: Pick<DiscoveryProps, "query">) {
  return (
    <form action="/products" method="get" className="mt-7 max-w-3xl">
      <Label htmlFor="catalog-search" className="text-sm font-semibold">
        Search the catalog
      </Label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id="catalog-search"
            name="q"
            type="search"
            defaultValue={query.q}
            placeholder="Search products, suppliers, or categories"
            className="bg-background h-12 pl-11 sm:text-base"
            maxLength={100}
          />
        </div>
        <PreservedFilterFields query={query} />
        {query.sort !== "featured" ? (
          <input type="hidden" name="sort" value={query.sort} />
        ) : null}
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "sm:min-w-32")}
        >
          <Search data-icon="inline-start" aria-hidden="true" />
          Search
        </button>
      </div>
    </form>
  );
}

function FilterFields({
  idPrefix,
  options,
  query,
}: DiscoveryProps & { idPrefix: string }) {
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor={`${idPrefix}-category`}>Category</Label>
        <select
          id={`${idPrefix}-category`}
          name="category"
          defaultValue={query.category}
          className={cn(selectClassName, "mt-2")}
        >
          <option value="">All categories</option>
          {options.categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-supplier`}>Supplier</Label>
        <select
          id={`${idPrefix}-supplier`}
          name="supplier"
          defaultValue={query.supplier}
          className={cn(selectClassName, "mt-2")}
        >
          <option value="">All suppliers</option>
          {options.suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-availability`}>Availability</Label>
        <select
          id={`${idPrefix}-availability`}
          name="availability"
          defaultValue={query.availability}
          className={cn(selectClassName, "mt-2")}
        >
          {catalogAvailabilityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm leading-none font-medium">
          Price range
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div>
            <Label
              htmlFor={`${idPrefix}-min-price`}
              className="text-muted-foreground text-xs"
            >
              Minimum
            </Label>
            <Input
              id={`${idPrefix}-min-price`}
              name="minPrice"
              type="number"
              inputMode="decimal"
              min="0"
              max="9999999999.99"
              step="0.01"
              defaultValue={query.minPrice}
              placeholder="£0"
              className="mt-2"
            />
          </div>
          <div>
            <Label
              htmlFor={`${idPrefix}-max-price`}
              className="text-muted-foreground text-xs"
            >
              Maximum
            </Label>
            <Input
              id={`${idPrefix}-max-price`}
              name="maxPrice"
              type="number"
              inputMode="decimal"
              min="0"
              max="9999999999.99"
              step="0.01"
              defaultValue={query.maxPrice}
              placeholder="No limit"
              className="mt-2"
            />
          </div>
        </div>
      </fieldset>
    </div>
  );
}

function FilterForm({
  idPrefix,
  mobile = false,
  options,
  query,
}: DiscoveryProps & { idPrefix: string; mobile?: boolean }) {
  return (
    <form
      action="/products"
      method="get"
      className={cn(mobile && "flex min-h-0 flex-1 flex-col")}
    >
      {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
      {query.sort !== "featured" ? (
        <input type="hidden" name="sort" value={query.sort} />
      ) : null}
      <div className={cn(mobile && "flex-1 overflow-y-auto px-4 py-2")}>
        <FilterFields idPrefix={idPrefix} options={options} query={query} />
      </div>
      <div
        className={cn(
          "mt-6 flex flex-col gap-2",
          mobile && "border-border bg-background mt-0 border-t p-4",
        )}
      >
        <button type="submit" className={buttonVariants()}>
          Apply filters
        </button>
        {activeFilterCount(query) > 0 ? (
          <Link
            href={catalogHref(query, {
              category: "",
              supplier: "",
              minPrice: "",
              maxPrice: "",
              availability: "all",
              page: 1,
            })}
            className={buttonVariants({ variant: "outline" })}
          >
            Clear filters
          </Link>
        ) : null}
      </div>
    </form>
  );
}

export function CatalogDesktopFilters({ options, query }: DiscoveryProps) {
  return (
    <aside
      className="border-border bg-card shadow-card hidden self-start rounded-xl border p-5 lg:block"
      aria-labelledby="catalog-filters-heading"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="catalog-filters-heading" className="font-semibold">
          Filter products
        </h2>
        {activeFilterCount(query) > 0 ? (
          <Badge variant="secondary">{activeFilterCount(query)} active</Badge>
        ) : null}
      </div>
      <FilterForm idPrefix="desktop" options={options} query={query} />
    </aside>
  );
}

export function CatalogMobileFilters({ options, query }: DiscoveryProps) {
  const filterCount = activeFilterCount(query);

  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger
          render={
            <button
              type="button"
              className={buttonVariants({ variant: "outline" })}
            />
          }
        >
          <SlidersHorizontal data-icon="inline-start" aria-hidden="true" />
          Filters
          {filterCount > 0 ? (
            <Badge variant="secondary" className="ml-1">
              {filterCount}
            </Badge>
          ) : null}
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[min(24rem,92vw)] gap-0 overflow-hidden"
        >
          <SheetHeader className="border-b p-5 pr-16">
            <SheetTitle>Filter products</SheetTitle>
            <SheetDescription>
              Narrow the catalog by supplier, category, price, or availability.
            </SheetDescription>
          </SheetHeader>
          <FilterForm
            idPrefix="mobile"
            mobile
            options={options}
            query={query}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function CatalogSortControl({ query }: Pick<DiscoveryProps, "query">) {
  return (
    <form
      action="/products"
      method="get"
      className="flex min-w-0 items-end gap-2"
    >
      {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
      <PreservedFilterFields query={query} />
      <div className="min-w-0 flex-1 sm:w-52 sm:flex-none">
        <Label htmlFor="catalog-sort">Sort by</Label>
        <select
          id="catalog-sort"
          name="sort"
          defaultValue={query.sort}
          className={cn(selectClassName, "mt-2")}
        >
          {catalogSortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className={buttonVariants({ variant: "outline" })}>
        Apply
      </button>
    </form>
  );
}

export function ActiveCatalogFilters({ options, query }: DiscoveryProps) {
  const categoryName = options.categories.find(
    (category) => category.slug === query.category,
  )?.name;
  const supplierName = options.suppliers.find(
    (supplier) => supplier.id === query.supplier,
  )?.name;
  const filters = [
    query.q ? { field: "q" as const, label: `Search: “${query.q}”` } : null,
    query.category
      ? {
          field: "category" as const,
          label: categoryName ?? "Selected category",
        }
      : null,
    query.supplier
      ? {
          field: "supplier" as const,
          label: supplierName ?? "Selected supplier",
        }
      : null,
    query.minPrice
      ? { field: "minPrice" as const, label: `From £${query.minPrice}` }
      : null,
    query.maxPrice
      ? { field: "maxPrice" as const, label: `Up to £${query.maxPrice}` }
      : null,
    query.availability !== "all"
      ? {
          field: "availability" as const,
          label:
            query.availability === "in-stock" ? "In stock" : "Out of stock",
        }
      : null,
  ].filter((filter) => filter !== null);

  if (filters.length === 0) return null;

  return (
    <div className="border-border bg-muted/30 flex flex-wrap items-center gap-2 rounded-xl border p-3">
      <span className="text-muted-foreground mr-1 text-xs font-semibold tracking-wide uppercase">
        Active
      </span>
      {filters.map((filter) => (
        <Link
          key={filter.field}
          href={catalogHref(query, { [filter.field]: "", page: 1 })}
          className="border-border bg-background hover:border-primary/40 hover:text-primary focus-visible:ring-ring/30 inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none"
          aria-label={`Remove filter: ${filter.label}`}
        >
          {filter.label}
          <X className="size-3.5" aria-hidden="true" />
        </Link>
      ))}
      <Link
        href="/products"
        className="text-primary hover:text-primary/80 focus-visible:ring-ring/30 ml-auto inline-flex min-h-11 items-center rounded-md px-2 text-xs font-semibold focus-visible:ring-3 focus-visible:outline-none"
      >
        Clear all
      </Link>
    </div>
  );
}

export function activeFilterCount(query: CatalogQuery) {
  return [
    query.category,
    query.supplier,
    query.minPrice,
    query.maxPrice,
    query.availability === "all" ? "" : query.availability,
  ].filter(Boolean).length;
}
