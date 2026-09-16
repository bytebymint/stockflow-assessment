import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  ClipboardCheck,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Users,
} from "lucide-react";

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
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

const roles = [
  {
    icon: ShoppingBag,
    title: "Customers",
    description:
      "Find available products and follow every order from confirmation to delivery.",
  },
  {
    icon: Store,
    title: "Suppliers",
    description:
      "Keep product details, stock levels, and fulfillment work in one clear queue.",
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
    title: "List accurately",
    description:
      "Suppliers maintain categorized products and reliable stock quantities.",
  },
  {
    step: "02",
    title: "Order confidently",
    description:
      "Customers place orders against validated, available inventory.",
  },
  {
    step: "03",
    title: "Fulfill visibly",
    description: "Clear statuses keep every role aligned through delivery.",
  },
];

export default function Home() {
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
          <div className="relative mx-auto grid w-full max-w-7xl min-w-0 grid-cols-[minmax(0,1fr)] gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center lg:px-8 lg:py-28">
            <div className="max-w-2xl min-w-0">
              <Badge
                variant="outline"
                className="border-primary/20 bg-accent text-accent-foreground h-7 px-3"
              >
                <span
                  className="bg-primary size-1.5 rounded-full"
                  aria-hidden="true"
                />
                Role-based access is ready
              </Badge>
              <h1 className="text-foreground mt-6 text-4xl leading-[1.08] font-bold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
                Inventory clarity from shelf to delivery.
              </h1>
              <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-8">
                StockFlow gives customers, suppliers, and administrators one
                dependable view of products, stock, and order progress.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className={cn(buttonVariants({ size: "lg" }), "group")}
                >
                  Create an account
                  <ArrowRight
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    data-icon="inline-end"
                  />
                </Link>
                <Link
                  href="/sign-in"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                  )}
                >
                  Sign in
                </Link>
              </div>
              <ul
                className="text-muted-foreground mt-8 grid gap-3 text-sm font-medium sm:grid-cols-3"
                aria-label="Platform qualities"
              >
                {["Role-aware", "Stock-safe", "Accessible"].map((quality) => (
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
                      Operations snapshot
                    </p>
                    <h2 className="mt-2 text-lg font-semibold">
                      Today at a glance
                    </h2>
                  </div>
                  <span className="bg-accent text-accent-foreground flex size-10 items-center justify-center rounded-lg">
                    <BarChart3 className="size-5" aria-hidden="true" />
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { label: "Products", value: "128", change: "+8 this week" },
                    {
                      label: "Open orders",
                      value: "34",
                      change: "12 need action",
                    },
                    { label: "Low stock", value: "7", change: "Review today" },
                    {
                      label: "Fulfilled",
                      value: "96%",
                      change: "+2.4% this month",
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="border-border/70 bg-background rounded-lg border p-4"
                    >
                      <p className="text-muted-foreground text-xs font-medium">
                        {metric.label}
                      </p>
                      <p className="text-foreground mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums">
                        {metric.value}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {metric.change}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-border/70 mt-5 space-y-3 border-t pt-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Recent movement</p>
                    <span className="text-muted-foreground text-xs">
                      Live preview
                    </span>
                  </div>
                  {[
                    {
                      icon: PackageCheck,
                      name: "Office chair",
                      meta: "Stock adjusted",
                      status: "Healthy",
                      variant: "success" as const,
                    },
                    {
                      icon: Truck,
                      name: "Desk lamp",
                      meta: "Order confirmed",
                      status: "In progress",
                      variant: "info" as const,
                    },
                    {
                      icon: ClipboardCheck,
                      name: "Monitor stand",
                      meta: "Threshold reached",
                      status: "Low stock",
                      variant: "warning" as const,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.name}
                        className="flex items-center gap-3 rounded-lg py-1"
                      >
                        <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {item.name}
                          </span>
                          <span className="text-muted-foreground block text-xs">
                            {item.meta}
                          </span>
                        </span>
                        <StatusBadge
                          label={item.status}
                          variant={item.variant}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="platform"
          className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
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
        </section>

        <section id="workflow" className="border-border/70 bg-card border-y">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
              <div>
                <span className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-xl">
                  <Boxes className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                  A workflow built around trustworthy stock.
                </h2>
                <p className="text-muted-foreground mt-4 text-base leading-7">
                  The visual system prioritizes clear state, readable data, and
                  deliberate actions before visual decoration.
                </p>
              </div>
              <ol className="grid gap-4">
                {workflow.map((item) => (
                  <li
                    key={item.step}
                    className="border-border/80 bg-background grid grid-cols-[3.5rem_1fr] gap-4 rounded-xl border p-5"
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
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="bg-sidebar text-sidebar-foreground shadow-float overflow-hidden rounded-2xl px-6 py-10 sm:px-10 sm:py-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="text-sidebar-primary flex items-center gap-2 text-sm font-semibold">
                  <Users className="size-4" aria-hidden="true" />
                  Designed for every operational role
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-balance text-white sm:text-3xl">
                  Enter the right workspace with one secure account.
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
                <ArrowRight data-icon="inline-end" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
