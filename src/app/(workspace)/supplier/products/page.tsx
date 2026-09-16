import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  Archive,
  Boxes,
  CircleAlert,
  CircleCheck,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  TriangleAlert,
} from "lucide-react";

import { ProductMedia } from "@/components/catalog/product-media";
import { StockStatus } from "@/components/catalog/stock-status";
import { ProductArchiveDialog } from "@/components/supplier/product-archive-dialog";
import { ProductRetryButton } from "@/components/supplier/product-retry-button";
import { ProductsPageSkeleton } from "@/components/supplier/products-page-skeleton";
import { SupplierShell } from "@/components/supplier/supplier-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireApprovedSupplier } from "@/lib/auth/session";
import { formatPrice } from "@/lib/catalog";
import { getDatabase } from "@/lib/database";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Supplier products",
  description:
    "Maintain product listings, pricing, and inventory in StockFlow.",
};

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    notice?: string | string[];
  }>;
};

type ProductStatusFilter = "active" | "archived" | "all";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getStatusFilter(value: string | string[] | undefined) {
  const status = firstValue(value);
  return status === "archived" || status === "all" ? status : "active";
}

function formatUpdatedAt(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

async function getSupplierProducts(
  supplierId: string,
  query: string,
  status: ProductStatusFilter,
) {
  const allProducts = await getDatabase().product.findMany({
    where: { supplierId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      stock: true,
      lowStockThreshold: true,
      imageUrl: true,
      imageAlt: true,
      archivedAt: true,
      updatedAt: true,
      category: { select: { name: true } },
    },
    orderBy: [{ archivedAt: "asc" }, { updatedAt: "desc" }],
  });
  const normalisedQuery = query.toLocaleLowerCase("en-GB");
  const products = allProducts.filter((product) => {
    const matchesStatus =
      status === "all" ||
      (status === "active" && product.archivedAt === null) ||
      (status === "archived" && product.archivedAt !== null);
    const matchesQuery =
      !normalisedQuery ||
      [
        product.name,
        product.slug,
        product.description,
        product.category?.name ?? "",
      ].some((value) =>
        value.toLocaleLowerCase("en-GB").includes(normalisedQuery),
      );

    return matchesStatus && matchesQuery;
  });
  const activeInventory = allProducts.filter(
    (product) => product.archivedAt === null,
  );

  return {
    products: products.map((product) => ({
      ...product,
      price: product.price.toFixed(2),
    })),
    activeCount: activeInventory.length,
    archivedCount: allProducts.length - activeInventory.length,
    lowStockCount: activeInventory.filter(
      (product) =>
        product.stock > 0 && product.stock <= product.lowStockThreshold,
    ).length,
    outOfStockCount: activeInventory.filter((product) => product.stock === 0)
      .length,
  };
}

function ProductsSearch({
  query,
  status,
}: {
  query: string;
  status: ProductStatusFilter;
}) {
  return (
    <form
      action="/supplier/products"
      method="get"
      role="search"
      className="border-border/80 bg-card shadow-card grid gap-4 rounded-xl border p-4 md:grid-cols-[minmax(0,1fr)_13rem_auto] md:items-end"
    >
      <div>
        <Label htmlFor="product-search">Search inventory</Label>
        <div className="relative mt-2">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id="product-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Name, slug, category, or description"
            className="pl-9"
            maxLength={100}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="product-status">Listing status</Label>
        <select
          id="product-status"
          name="status"
          defaultValue={status}
          className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/25 mt-2 h-11 w-full rounded-lg border px-3 text-base shadow-xs outline-none focus-visible:ring-3 md:text-sm"
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All products</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" className={cn(buttonVariants(), "flex-1")}>
          Apply
        </button>
        {query || status !== "active" ? (
          <Link
            href="/supplier/products"
            className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
          >
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: typeof Boxes;
  label: string;
  value: number;
  tone?: "neutral" | "warning" | "destructive";
}) {
  const toneClass = {
    neutral: "bg-accent text-accent-foreground",
    warning: "bg-warning-subtle text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];

  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            toneClass,
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-muted-foreground text-xs font-medium">{label}</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

type SupplierProduct = Awaited<
  ReturnType<typeof getSupplierProducts>
>["products"][number];

function ProductActions({ product }: { product: SupplierProduct }) {
  if (product.archivedAt) {
    return <StatusBadge label="Read only" variant="neutral" />;
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Link
        href={`/supplier/products/${product.id}/edit`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <Pencil data-icon="inline-start" aria-hidden="true" />
        Edit
      </Link>
      <ProductArchiveDialog product={product} />
    </div>
  );
}

function ProductMobileCard({ product }: { product: SupplierProduct }) {
  return (
    <Card className="py-0">
      <div className="grid sm:grid-cols-[12rem_minmax(0,1fr)]">
        <ProductMedia
          imageUrl={product.imageUrl}
          imageAlt={product.imageAlt}
          productName={product.name}
          categoryName={product.category?.name}
          className="sm:aspect-auto sm:min-h-full"
          sizes="(min-width: 640px) 192px, 100vw"
        />
        <CardContent className="space-y-4 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold break-words">{product.name}</h3>
              <p className="text-muted-foreground mt-1 font-mono text-xs break-all">
                /{product.slug}
              </p>
            </div>
            {product.archivedAt ? (
              <StatusBadge label="Archived" variant="neutral" />
            ) : (
              <StockStatus
                stock={product.stock}
                lowStockThreshold={product.lowStockThreshold}
                showQuantity
              />
            )}
          </div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-6">
            {product.description}
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Category</p>
              <p className="mt-1 font-medium">
                {product.category?.name ?? "Uncategorised"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Price</p>
              <p className="mt-1 font-mono font-semibold tabular-nums">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>
          <div className="border-border/70 flex items-center justify-between border-t pt-3 text-xs">
            <span className="text-muted-foreground">Updated</span>
            <time dateTime={product.updatedAt.toISOString()}>
              {formatUpdatedAt(product.updatedAt)}
            </time>
          </div>
          {!product.archivedAt ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/supplier/products/${product.id}/edit`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full",
                )}
              >
                <Pencil data-icon="inline-start" aria-hidden="true" />
                Edit
              </Link>
              <ProductArchiveDialog product={product} compact />
            </div>
          ) : null}
        </CardContent>
      </div>
    </Card>
  );
}

function ProductLoadError() {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center">
        <span className="bg-destructive/10 text-destructive flex size-11 shrink-0 items-center justify-center rounded-xl">
          <CircleAlert className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Inventory could not be loaded</h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            Your product data was not changed. Retry this request when the
            database is available.
          </p>
        </div>
        <ProductRetryButton />
      </CardContent>
    </Card>
  );
}

async function ProductsContent({
  supplierId,
  query,
  status,
  notice,
}: {
  supplierId: string;
  query: string;
  status: ProductStatusFilter;
  notice?: string;
}) {
  let data: Awaited<ReturnType<typeof getSupplierProducts>>;

  try {
    data = await getSupplierProducts(supplierId, query, status);
  } catch {
    return <ProductLoadError />;
  }

  const statusLabel =
    status === "all"
      ? "All products"
      : status === "archived"
        ? "Archived"
        : "Active";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Catalog operations"
        title="Products"
        description="Maintain customer-facing listings, prices, and stock levels for your supplier account."
        actions={
          <Link href="/supplier/products/new" className={buttonVariants()}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            New product
          </Link>
        }
      />

      {notice === "created" || notice === "updated" ? (
        <div
          className="border-success/25 bg-success-subtle text-success-foreground flex items-start gap-3 rounded-xl border p-4 text-sm"
          role="status"
        >
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            {notice === "created"
              ? "Product created and published to the catalog."
              : "Product details and inventory were updated."}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={Boxes}
          label="Active listings"
          value={data.activeCount}
        />
        <MetricCard
          icon={TriangleAlert}
          label="Low stock"
          value={data.lowStockCount}
          tone="warning"
        />
        <MetricCard
          icon={CircleAlert}
          label="Out of stock"
          value={data.outOfStockCount}
          tone="destructive"
        />
      </div>

      <ProductsSearch query={query} status={status} />

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold">
          {query ? `${statusLabel} matching “${query}”` : statusLabel}
        </h2>
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {data.products.length} shown · {data.archivedCount} archived total
        </p>
      </div>

      {data.products.length === 0 ? (
        <EmptyState
          icon={status === "archived" ? Archive : PackageOpen}
          title={
            query
              ? "No products match these filters"
              : `No ${statusLabel.toLowerCase()} found`
          }
          description={
            query || status !== "active"
              ? "Clear the filters or adjust the search to review another part of your inventory."
              : "Create your first product to publish it in the StockFlow catalog."
          }
          action={
            query || status !== "active" ? (
              <Link
                href="/supplier/products"
                className={buttonVariants({ variant: "outline" })}
              >
                Clear filters
              </Link>
            ) : (
              <Link href="/supplier/products/new" className={buttonVariants()}>
                <Plus data-icon="inline-start" aria-hidden="true" />
                New product
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="bg-card shadow-card hidden overflow-x-auto rounded-xl border xl:block">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-4">Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="max-w-xs px-4 py-4 whitespace-normal">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-muted-foreground mt-1 font-mono text-xs">
                        /{product.slug}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {product.category?.name ?? "Uncategorised"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono font-semibold tabular-nums">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell>
                      {product.archivedAt ? (
                        <StatusBadge label="Archived" variant="neutral" />
                      ) : (
                        <StockStatus
                          stock={product.stock}
                          lowStockThreshold={product.lowStockThreshold}
                          showQuantity
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <time dateTime={product.updatedAt.toISOString()}>
                        {formatUpdatedAt(product.updatedAt)}
                      </time>
                    </TableCell>
                    <TableCell className="px-4">
                      <ProductActions product={product} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-4 xl:hidden">
            {data.products.map((product) => (
              <ProductMobileCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const [user, params] = await Promise.all([
    requireApprovedSupplier(),
    searchParams,
  ]);
  const query = firstValue(params.q)?.trim().slice(0, 100) ?? "";
  const status = getStatusFilter(params.status);
  const notice = firstValue(params.notice);
  const suspenseKey = `${query}:${status}:${notice ?? ""}`;

  return (
    <SupplierShell activeHref="/supplier/products" user={user}>
      <Suspense key={suspenseKey} fallback={<ProductsPageSkeleton />}>
        <ProductsContent
          supplierId={user.id}
          query={query}
          status={status}
          notice={notice}
        />
      </Suspense>
    </SupplierShell>
  );
}
