import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Layers3,
  LockKeyhole,
  PackageCheck,
} from "lucide-react";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductMedia } from "@/components/catalog/product-media";
import { StockStatus } from "@/components/catalog/stock-status";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { getWorkspacePath } from "@/lib/auth/paths";
import { formatPrice, getPublicProductById } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getPublicProductById(id);

  if (!product) {
    return { title: "Product not available" };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const [product, user] = await Promise.all([
    getPublicProductById(id),
    getCurrentUser(),
  ]);

  if (!product) {
    notFound();
  }

  const canOrder = product.stock > 0;
  const signInHref = `/sign-in?returnTo=${encodeURIComponent(`/products/${product.id}`)}`;

  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link
          href="/products"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/30 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to catalog
        </Link>

        <div className="mt-4 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.06fr)_minmax(22rem,0.94fr)] lg:gap-12">
          <div className="border-border/80 bg-card shadow-card overflow-hidden rounded-2xl border">
            <ProductMedia
              imageUrl={product.imageUrl}
              imageAlt={product.imageAlt}
              productName={product.name}
              categoryName={product.category?.name}
              className="aspect-square sm:aspect-[4/3] lg:aspect-square"
              sizes="(min-width: 1024px) 52vw, 100vw"
            />
          </div>

          <div className="min-w-0 self-center">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="h-7">
                <Layers3 aria-hidden="true" />
                {product.category?.name ?? "Uncategorised"}
              </Badge>
              <StockStatus
                stock={product.stock}
                lowStockThreshold={product.lowStockThreshold}
                showQuantity
              />
            </div>

            <h1 className="text-foreground mt-5 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>
            <p className="text-muted-foreground mt-4 text-base leading-7 sm:text-lg">
              {product.description}
            </p>

            <div className="border-border/70 mt-6 flex flex-wrap items-center justify-between gap-4 border-y py-5">
              <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Unit price
                </p>
                <p className="mt-1 font-mono text-3xl font-semibold tracking-tight tabular-nums">
                  {formatPrice(product.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Supplied by
                </p>
                <p className="mt-1 flex items-center justify-end gap-2 font-semibold">
                  <Building2
                    className="text-primary size-4"
                    aria-hidden="true"
                  />
                  {product.supplier.name}
                </p>
              </div>
            </div>

            <div className="bg-card border-border/80 shadow-card mt-6 rounded-xl border p-5">
              {!canOrder ? (
                <>
                  <div className="flex items-start gap-3">
                    <span className="bg-destructive/10 text-destructive flex size-10 shrink-0 items-center justify-center rounded-lg">
                      <PackageCheck className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="font-semibold">Currently unavailable</h2>
                      <p className="text-muted-foreground mt-1 text-sm leading-6">
                        This listing remains visible for reference, but it
                        cannot be ordered until stock is replenished.
                      </p>
                    </div>
                  </div>
                </>
              ) : !user ? (
                <>
                  <div className="flex items-start gap-3">
                    <span className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                      <LockKeyhole className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="font-semibold">
                        Ready to begin an order?
                      </h2>
                      <p className="text-muted-foreground mt-1 text-sm leading-6">
                        Sign in with a customer account before accessing any
                        ordering action.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={signInHref}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "mt-5 w-full",
                    )}
                  >
                    Sign in to order
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </Link>
                </>
              ) : user.role === "CUSTOMER" ? (
                <>
                  <div className="flex items-start gap-3">
                    <span className="bg-success-subtle text-success-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                      <CheckCircle2 className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="font-semibold">Ready to add</h2>
                      <p className="text-muted-foreground mt-1 text-sm leading-6">
                        Add this product to your saved cart. Current price and
                        stock will be checked whenever the cart changes.
                      </p>
                    </div>
                  </div>
                  <AddToCartButton
                    productId={product.id}
                    productName={product.name}
                    snapshot={{
                      name: product.name,
                      unitPrice: product.price,
                      imageUrl: product.imageUrl,
                      imageAlt: product.imageAlt,
                      supplierId: product.supplier.id,
                      supplierName: product.supplier.name,
                    }}
                    className="mt-5"
                  />
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                      <LockKeyhole className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="font-semibold">
                        Customer accounts order products
                      </h2>
                      <p className="text-muted-foreground mt-1 text-sm leading-6">
                        Your current role can browse the catalog, but purchasing
                        is reserved for customer accounts.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={getWorkspacePath(user)}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "mt-5 w-full",
                    )}
                  >
                    Return to workspace
                  </Link>
                </>
              )}
            </div>

            <ul className="text-muted-foreground mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className="text-primary size-4"
                  aria-hidden="true"
                />
                Live stock status
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className="text-primary size-4"
                  aria-hidden="true"
                />
                Approved supplier
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
