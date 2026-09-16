import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Boxes,
  LayoutDashboard,
  Package,
  Plus,
  Search,
  ShoppingBag,
} from "lucide-react";

import {
  AppShell,
  type AppNavigationItem,
} from "@/components/layout/app-shell";
import { PreviewInteractions } from "@/components/preview/preview-interactions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "UI system preview",
  description:
    "StockFlow's temporary interface foundation and responsive shell preview.",
};

const navigation: AppNavigationItem[] = [
  { label: "Overview", href: "#overview", icon: LayoutDashboard },
  { label: "Products", href: "#components", icon: Package },
  { label: "Orders", href: "#data", icon: ShoppingBag, badge: "4" },
  { label: "Alerts", href: "#feedback", icon: Bell, badge: "2" },
];

const inventoryRows = [
  {
    product: "Ergonomic task chair",
    sku: "CHR-201",
    stock: 42,
    price: "$249.00",
    status: "Healthy",
    variant: "success" as const,
  },
  {
    product: "Adjustable desk lamp",
    sku: "LMP-104",
    stock: 8,
    price: "$64.00",
    status: "Low stock",
    variant: "warning" as const,
  },
  {
    product: "Aluminium monitor stand",
    sku: "STD-312",
    stock: 0,
    price: "$89.00",
    status: "Unavailable",
    variant: "destructive" as const,
  },
];

export default function UiPreviewPage() {
  return (
    <AppShell
      navigation={navigation}
      activeHref="#overview"
      roleLabel="Supplier"
      userName="Morgan Lee"
    >
      <div className="mx-auto w-full max-w-7xl min-w-0 space-y-8 overflow-x-hidden">
        <PageHeader
          eyebrow="Temporary internal preview"
          title="StockFlow interface system"
          description="A review surface for the design tokens, reusable states, data patterns, and responsive workspace shell that future features will share."
          actions={
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <ArrowLeft data-icon="inline-start" />
              Public shell
            </Link>
          }
        />

        <section
          id="overview"
          aria-labelledby="foundation-heading"
          className="scroll-mt-24"
        >
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Active products",
                value: "128",
                note: "+8 this week",
                accent: "bg-success-subtle text-success-foreground",
              },
              {
                label: "Open orders",
                value: "34",
                note: "12 need action",
                accent: "bg-info-subtle text-info-foreground",
              },
              {
                label: "Low-stock items",
                value: "7",
                note: "Review today",
                accent: "bg-warning-subtle text-warning-foreground",
              },
              {
                label: "Revenue",
                value: "$18.4k",
                note: "+6.2% this month",
                accent: "bg-muted text-muted-foreground",
              },
            ].map((metric) => (
              <Card key={metric.label} size="sm">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardDescription>{metric.label}</CardDescription>
                    <span
                      className={cn("size-2 rounded-full", metric.accent)}
                      aria-hidden="true"
                    />
                  </div>
                  <CardTitle className="font-mono text-2xl font-semibold tracking-tight tabular-nums">
                    {metric.value}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-xs">
                  {metric.note}
                </CardContent>
              </Card>
            ))}
          </div>
          <h2 id="foundation-heading" className="sr-only">
            Design foundation metrics
          </h2>
        </section>

        <section
          id="components"
          aria-labelledby="components-heading"
          className="scroll-mt-24 space-y-4"
        >
          <div>
            <h2
              id="components-heading"
              className="text-xl font-bold tracking-tight"
            >
              Core components
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Shared controls use consistent focus, feedback, spacing, and
              disabled states.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Actions and feedback</CardTitle>
                <CardDescription>
                  Primary, secondary, destructive, loading-adjacent, dialog, and
                  toast patterns.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-3">
                  <Button>
                    <Plus data-icon="inline-start" aria-hidden="true" />
                    Add product
                  </Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Archive</Button>
                  <Button disabled>Saving…</Button>
                </div>
                <PreviewInteractions />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form fields</CardTitle>
                <CardDescription>
                  Visible labels and helper text remain present independently of
                  placeholders.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="preview-search">Search products</Label>
                  <div className="relative">
                    <Search
                      className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <Input
                      id="preview-search"
                      className="pl-9"
                      placeholder="Name, SKU, or category"
                    />
                  </div>
                  <p className="text-muted-foreground text-xs leading-5">
                    Search will support product names, SKUs, and categories.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preview-stock">Stock quantity</Label>
                  <Input
                    id="preview-stock"
                    type="number"
                    defaultValue="24"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preview-error">Price</Label>
                  <Input
                    id="preview-error"
                    aria-invalid="true"
                    aria-describedby="price-error"
                    defaultValue="-12"
                  />
                  <p
                    id="price-error"
                    role="alert"
                    className="text-destructive text-xs font-medium"
                  >
                    Enter a price greater than zero.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section
          id="data"
          aria-labelledby="data-heading"
          className="scroll-mt-24 space-y-4"
        >
          <div>
            <h2 id="data-heading" className="text-xl font-bold tracking-tight">
              Data and status patterns
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Tabular numbers, labelled states, and responsive overflow keep
              operational data readable.
            </p>
          </div>
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Inventory preview</CardTitle>
              <CardDescription>
                Static sample data for evaluating density and hierarchy only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>
                  Sample inventory state styling. No product data is connected
                  yet.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryRows.map((row) => (
                    <TableRow key={row.sku}>
                      <TableCell className="text-foreground font-medium">
                        {row.product}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono">
                        {row.sku}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {row.stock}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {row.price}
                      </TableCell>
                      <TableCell>
                        <StatusBadge label={row.status} variant={row.variant} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        <section
          id="feedback"
          aria-labelledby="feedback-heading"
          className="scroll-mt-24 space-y-4"
        >
          <div>
            <h2
              id="feedback-heading"
              className="text-xl font-bold tracking-tight"
            >
              Loading and empty states
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Every asynchronous or empty feature will explain what is happening
              and what the user can do next.
            </p>
          </div>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Loading skeleton</CardTitle>
                <CardDescription>
                  Stable dimensions prevent layout shifts while data arrives.
                </CardDescription>
              </CardHeader>
              <CardContent
                className="space-y-4"
                aria-label="Loading content preview"
                aria-busy="true"
              >
                {["a", "b", "c"].map((key) => (
                  <div key={key} className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-2/5" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guided empty state</CardTitle>
                <CardDescription>
                  Empty screens give context and one clear next action.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={Boxes}
                  title="No products yet"
                  description="Products added by an approved supplier will appear here with stock and availability details."
                  action={
                    <Button>
                      <Plus data-icon="inline-start" aria-hidden="true" />
                      Add first product
                    </Button>
                  }
                />
              </CardContent>
              <CardFooter className="text-muted-foreground text-xs">
                Preview only — product creation belongs to a later approved
                step.
              </CardFooter>
            </Card>
          </div>
        </section>

        <div className="border-border bg-card text-muted-foreground shadow-card flex flex-wrap items-center gap-2 rounded-xl border p-4 text-sm">
          <span className="text-foreground font-semibold">Status palette:</span>
          <StatusBadge label="Confirmed" variant="success" />
          <StatusBadge label="Pending" variant="warning" />
          <StatusBadge label="Shipped" variant="info" />
          <StatusBadge label="Draft" variant="neutral" />
          <StatusBadge label="Cancelled" variant="destructive" />
          <Badge variant="outline" className="ml-auto">
            WCAG-aware labels
          </Badge>
        </div>
      </div>
    </AppShell>
  );
}
