import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock3,
  Package,
  Search,
  Store,
} from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { SupplierDecisionActions } from "@/components/admin/supplier-status-dialog";
import { SupplierRetryButton } from "@/components/admin/supplier-retry-button";
import { SuppliersPageSkeleton } from "@/components/admin/suppliers-page-skeleton";
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
import type { SupplierStatus } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/session";
import { getDatabase } from "@/lib/database";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Supplier approvals",
  description: "Review and manage StockFlow supplier access.",
};

const supplierFilters = ["PENDING", "APPROVED", "REJECTED", "ALL"] as const;
type SupplierFilter = (typeof supplierFilters)[number];

const filterContent = {
  PENDING: { label: "Pending", icon: Clock3 },
  APPROVED: { label: "Approved", icon: CircleCheck },
  REJECTED: { label: "Rejected", icon: CircleX },
  ALL: { label: "All suppliers", icon: Store },
} as const;

const statusContent = {
  PENDING: { label: "Pending review", variant: "warning" as const },
  APPROVED: { label: "Approved", variant: "success" as const },
  REJECTED: { label: "Rejected", variant: "destructive" as const },
};

type SupplierPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
  }>;
};

function readSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSupplierFilter(
  value: string | string[] | undefined,
): SupplierFilter {
  const candidate = readSingleValue(value)?.toUpperCase();
  return supplierFilters.includes(candidate as SupplierFilter)
    ? (candidate as SupplierFilter)
    : "PENDING";
}

function getSearchQuery(value: string | string[] | undefined) {
  return readSingleValue(value)?.trim().slice(0, 100) ?? "";
}

function supplierFilterHref(filter: SupplierFilter, query: string) {
  const parameters = new URLSearchParams();
  parameters.set("status", filter);
  if (query) parameters.set("q", query);
  return `/admin/suppliers?${parameters.toString()}`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

async function getSupplierData(filter: SupplierFilter, query: string) {
  const database = getDatabase();
  const searchWhere = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [suppliers, groupedCounts] = await Promise.all([
    database.user.findMany({
      where: {
        role: "SUPPLIER",
        ...(filter === "ALL" ? {} : { supplierStatus: filter }),
        ...searchWhere,
      },
      select: {
        id: true,
        name: true,
        email: true,
        supplierStatus: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: { where: { archivedAt: null } },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    }),
    database.user.groupBy({
      by: ["supplierStatus"],
      where: { role: "SUPPLIER" },
      _count: { _all: true },
    }),
  ]);

  const counts: Record<SupplierStatus, number> = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  };

  for (const group of groupedCounts) {
    if (group.supplierStatus) {
      counts[group.supplierStatus] = group._count._all;
    }
  }

  return {
    counts,
    suppliers: suppliers.flatMap((supplier) =>
      supplier.supplierStatus
        ? [
            {
              ...supplier,
              status: supplier.supplierStatus,
              activeProductCount: supplier._count.products,
            },
          ]
        : [],
    ),
  };
}

type SupplierRecord = Awaited<
  ReturnType<typeof getSupplierData>
>["suppliers"][number];

function SupplierSearch({
  filter,
  query,
}: {
  filter: SupplierFilter;
  query: string;
}) {
  return (
    <form
      action="/admin/suppliers"
      method="get"
      role="search"
      className="border-border/80 bg-card shadow-card flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-end"
    >
      <input type="hidden" name="status" value={filter} />
      <div className="min-w-0 flex-1">
        <Label htmlFor="supplier-search">Search suppliers</Label>
        <div className="relative mt-2">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id="supplier-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search company name or email"
            className="pl-9"
            maxLength={100}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className={cn(buttonVariants(), "flex-1 sm:flex-none")}
        >
          Search
        </button>
        {query ? (
          <Link
            href={supplierFilterHref(filter, "")}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex-1 sm:flex-none",
            )}
          >
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}

function SupplierMetrics({
  counts,
}: {
  counts: Record<SupplierStatus, number>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {(["PENDING", "APPROVED", "REJECTED"] as const).map((status) => {
        const content = filterContent[status];
        const Icon = content.icon;
        return (
          <Card key={status}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="bg-accent text-accent-foreground flex size-11 shrink-0 items-center justify-center rounded-xl">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {content.label}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {counts[status]}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function SupplierFilters({
  activeFilter,
  counts,
  query,
}: {
  activeFilter: SupplierFilter;
  counts: Record<SupplierStatus, number>;
  query: string;
}) {
  const total = counts.PENDING + counts.APPROVED + counts.REJECTED;

  return (
    <nav
      aria-label="Supplier status filters"
      className="border-border bg-card flex max-w-full gap-2 overflow-x-auto rounded-xl border p-2"
    >
      {supplierFilters.map((filter) => {
        const content = filterContent[filter];
        const count = filter === "ALL" ? total : counts[filter];
        const Icon = content.icon;
        return (
          <Link
            key={filter}
            href={supplierFilterHref(filter, query)}
            aria-current={activeFilter === filter ? "page" : undefined}
            className={cn(
              "focus-visible:ring-ring/30 flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
              activeFilter === filter
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {content.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                activeFilter === filter
                  ? "bg-primary-foreground/15 text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function SupplierActions({ supplier }: { supplier: SupplierRecord }) {
  return (
    <SupplierDecisionActions
      supplier={{
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
      }}
      status={supplier.status}
    />
  );
}

function SupplierMobileCard({ supplier }: { supplier: SupplierRecord }) {
  const status = statusContent[supplier.status];

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="bg-accent text-accent-foreground flex size-11 shrink-0 items-center justify-center rounded-xl font-bold">
            {supplier.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold break-words">{supplier.name}</h3>
            <p className="text-muted-foreground mt-1 text-sm break-all">
              {supplier.email}
            </p>
          </div>
          <StatusBadge label={status.label} variant={status.variant} />
        </div>
        <dl className="border-border/70 grid grid-cols-2 gap-3 border-y py-3 text-sm">
          <div>
            <dt className="text-muted-foreground text-xs">Applied</dt>
            <dd className="mt-1 font-medium">
              <time dateTime={supplier.createdAt.toISOString()}>
                {formatDate(supplier.createdAt)}
              </time>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Active products</dt>
            <dd className="mt-1 flex items-center gap-1.5 font-medium tabular-nums">
              <Package className="size-4" aria-hidden="true" />
              {supplier.activeProductCount}
            </dd>
          </div>
        </dl>
        <SupplierActions supplier={supplier} />
      </CardContent>
    </Card>
  );
}

function SupplierLoadError() {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center">
        <span className="bg-destructive/10 text-destructive flex size-11 shrink-0 items-center justify-center rounded-xl">
          <CircleAlert className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Suppliers could not be loaded</h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            The database did not return supplier data. Retry without losing the
            current filter.
          </p>
        </div>
        <SupplierRetryButton />
      </CardContent>
    </Card>
  );
}

async function SuppliersContent({
  filter,
  query,
}: {
  filter: SupplierFilter;
  query: string;
}) {
  let data: Awaited<ReturnType<typeof getSupplierData>>;

  try {
    data = await getSupplierData(filter, query);
  } catch {
    return <SupplierLoadError />;
  }

  const filterLabel = filterContent[filter].label;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Access governance"
        title="Supplier approvals"
        description="Review supplier applications and control who can publish products to the StockFlow catalog."
      />

      <SupplierMetrics counts={data.counts} />
      <SupplierFilters
        activeFilter={filter}
        counts={data.counts}
        query={query}
      />
      <SupplierSearch filter={filter} query={query} />

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold">
          {query ? `${filterLabel} matching “${query}”` : filterLabel}
        </h2>
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {data.suppliers.length} result{data.suppliers.length === 1 ? "" : "s"}
        </p>
      </div>

      {data.suppliers.length === 0 ? (
        <EmptyState
          icon={Store}
          title={
            query
              ? "No suppliers match this search"
              : `No ${filterLabel.toLowerCase()}`
          }
          description={
            query
              ? "Try another company name or email, or clear the current search."
              : "Supplier accounts will appear here when they enter this status."
          }
          action={
            query ? (
              <Link
                href={supplierFilterHref(filter, "")}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Clear search
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="bg-card shadow-card hidden overflow-x-auto rounded-xl border xl:block">
            <Table className="min-w-[920px]">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-4">Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-center">Active products</TableHead>
                  <TableHead className="px-4 text-right">Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.suppliers.map((supplier) => {
                  const status = statusContent[supplier.status];
                  return (
                    <TableRow key={supplier.id}>
                      <TableCell className="px-4 py-4 whitespace-normal">
                        <p className="font-semibold">{supplier.name}</p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {supplier.email}
                        </p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={status.label}
                          variant={status.variant}
                        />
                      </TableCell>
                      <TableCell>
                        <time dateTime={supplier.createdAt.toISOString()}>
                          {formatDate(supplier.createdAt)}
                        </time>
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {supplier.activeProductCount}
                      </TableCell>
                      <TableCell className="px-4">
                        <SupplierActions supplier={supplier} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 xl:hidden">
            {data.suppliers.map((supplier) => (
              <SupplierMobileCard key={supplier.id} supplier={supplier} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default async function SuppliersPage({
  searchParams,
}: SupplierPageProps) {
  const [user, parameters] = await Promise.all([
    requireRole("ADMIN"),
    searchParams,
  ]);
  const filter = getSupplierFilter(parameters.status);
  const query = getSearchQuery(parameters.q);

  return (
    <AdminShell activeHref="/admin/suppliers" user={user}>
      <Suspense key={`${filter}:${query}`} fallback={<SuppliersPageSkeleton />}>
        <SuppliersContent filter={filter} query={query} />
      </Suspense>
    </AdminShell>
  );
}
