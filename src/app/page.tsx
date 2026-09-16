import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Check,
  PackageSearch,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";

import { ProductCard } from "@/components/catalog/product-card";
import { StockStatus } from "@/components/catalog/stock-status";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice, getFeaturedProducts } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const roles = [
  {
    icon: ShoppingBag,
    title: "Customers",
    description:
      "Browse approved products and see stock status before signing in to order.",
  },
  {
    icon: Store,
    title: "Suppliers",
    description:
      "Keep product details, stock levels, and fulfilment work in one clear queue.",
  },
  {
    icon: ShieldCheck,
    title: "Administrators",
    description:
      "Watch platform health, approve suppliers, and spot inventory risk early.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Browse openly",
    description:
      "Anyone can review approved products, pricing, suppliers, and availability.",
  },
  {
    step: "02",
    title: "Order securely",
    description:
      "Customer authentication protects ordering while keeping discovery friction-free.",
  },
  {
    step: "03",
    title: "Fulfil visibly",
    description: "Clear statuses keep every role aligned through delivery.",
  },
];

export default async function Home() {
  const featuredProducts = await getFeaturedProducts().catch(() => []);

  return (
    <div className="bg-background min-h-dvh overflow-x-hidden">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground shadow-float fixed top-3 left-3 z-[100] -translate-y-20 rounded-lg px-4 py-3 text-sm font-semibold transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <PublicHeader />

      <main id="main-content">
        <section className="surface-grid border-border/70 relative border-b">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,color-mix(in_srgb,var(--accent)_75%,transparent),transparent_32%)]" />
          <div className="relative mx-auto grid w-full max-w-7xl min-w-0 grid-cols-[minmax(0,1fr)] gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:px-8 lg:py-28">
            <div className="max-w-2xl min-w-0">
              <Badge
                variant="outline"
                className="border-primary/20 bg-accent text-accent-foreground h-7 px-3"
              >
                <span
                  className="bg-primary size-1.5 rounded-full"
                  aria-hidden="true"
                />
                Public catalog is open
              </Badge>
              <h1 className="text-foreground mt-6 text-4xl leading-[1.08] font-bold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
                Inventory clarity before you place an order.
              </h1>
              <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-8">
                Discover products from approved suppliers, compare live stock,
                and sign in only when you are ready to continue.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className={cn(buttonVariants({ size: "lg" }), "group")}
                >
                  Browse products
                  <ArrowRight
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    data-icon="inline-end"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                  )}
                >
                  Create an account
                </Link>
              </div>
              <ul
                className="text-muted-foreground mt-8 grid gap-3 text-sm font-medium sm:grid-cols-3"
                aria-label="Catalog qualities"
              >
                {[
                  "Public browsing",
                  "Approved suppliers",
                  "Live availability",
                ].map((quality) => (
                  <li key={quality} className="flex items-center gap-2">
                    <span className="bg-success-subtle text-success-foreground flex size-5 items-center justify-center rounded-full">
                      <Check
                        className="size-3"
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    </span>
                    {quality}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel relative max-w-full min-w-0 rounded-2xl border border-white/80 p-3 sm:p-5">
              <div className="border-border/80 bg-card shadow-card rounded-xl border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-primary text-xs font-bold tracking-[0.12em] uppercase">
                      Catalog preview
                    </p>
                    <h2 className="mt-2 text-lg font-semibold">
                      Ready for operational teams
                    </h2>
                  </div>
                  <span className="bg-accent text-accent-foreground flex size-10 items-center justify-center rounded-lg">
                    <PackageSearch className="size-5" aria-hidden="true" />
                  </span>
                </div>

                <div className="border-border/70 mt-5 space-y-1 border-t pt-4">
                  {featuredProducts.length > 0 ? (
                    featuredProducts.slice(0, 3).map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="hover:bg-muted focus-visible:ring-ring/30 flex min-w-0 items-center gap-3 rounded-lg px-2 py-3 transition-colors focus-visible:ring-3 focus-visible:outline-none"
                      >
                        <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                          <Boxes className="size-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {product.name}
                          </span>
                          <span className="text-muted-foreground mt-0.5 block text-xs">
                            {formatPrice(product.price)} ·{" "}
                            {product.supplier.name}
                          </span>
                        </span>
                        <StockStatus
                          stock={product.stock}
                          lowStockThreshold={product.lowStockThreshold}
                        />
                      </Link>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="font-semibold">
                        Catalog preview unavailable
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Open the catalog to try loading products again.
                      </p>
                    </div>
                  )}
                </div>

                <Link
                  href="/products"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "mt-4 w-full",
                  )}
                >
                  View full catalog
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {featuredProducts.length > 0 ? (
          <section
            aria-labelledby="featured-products-heading"
            className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-primary text-xs font-bold tracking-[0.14em] uppercase">
                  Featured inventory
                </p>
                <h2
                  id="featured-products-heading"
                  className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl"
                >
                  Start with products currently in stock.
                </h2>
              </div>
              <Link
                href="/products"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Browse all products
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        <section id="platform" className="border-border/70 bg-card border-y">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-primary text-xs font-bold tracking-[0.14em] uppercase">
                One coordinated platform
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Each role sees what matters, without the clutter.
              </h2>
            </div>
            <div id="roles" className="mt-10 grid gap-5 md:grid-cols-3">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <Card
                    key={role.title}
                    className="hover:border-primary/30 hover:shadow-float transition-[border-color,box-shadow] duration-200"
                  >
                    <CardHeader>
                      <span className="bg-accent text-accent-foreground mb-3 flex size-11 items-center justify-center rounded-xl">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <CardTitle className="text-lg">{role.title}</CardTitle>
                      <CardDescription className="leading-6">
                        {role.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="workflow">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:px-8">
            <div>
              <span className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-xl">
                <Boxes className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                A storefront built around trustworthy stock.
              </h2>
              <p className="text-muted-foreground mt-4 text-base leading-7">
                Clear availability, visible suppliers, and role-aware actions
                make the path from discovery to fulfilment easy to understand.
              </p>
            </div>
            <ol className="grid gap-4">
              {workflow.map((item) => (
                <li
                  key={item.step}
                  className="border-border/80 bg-card shadow-card grid grid-cols-[3.5rem_1fr] gap-4 rounded-xl border p-5"
                >
                  <span className="text-primary font-mono text-sm font-bold tabular-nums">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-6">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="bg-sidebar text-sidebar-foreground shadow-float overflow-hidden rounded-2xl px-6 py-10 sm:px-10 sm:py-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="text-sidebar-primary flex items-center gap-2 text-sm font-semibold">
                  <Users className="size-4" aria-hidden="true" />
                  Designed for every operational role
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-balance text-white sm:text-3xl">
                  Browse first. Create an account when you are ready.
                </h2>
              </div>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shrink-0",
                )}
              >
                Get started
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
