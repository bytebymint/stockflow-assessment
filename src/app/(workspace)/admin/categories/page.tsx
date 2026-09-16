import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CircleAlert, FolderOpen, Package, Search, Tags } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  CategoryRowActions,
  CreateCategoryDialog,
  type EditableCategory,
} from "@/components/admin/category-dialogs";
import { CategoryRetryButton } from "@/components/admin/category-retry-button";
import { CategoriesPageSkeleton } from "@/components/admin/categories-page-skeleton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireRole } from "@/lib/auth/session";
import { getDatabase } from "@/lib/database";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Category administration",
  description: "Create and maintain StockFlow product categories.",
};

type CategoryPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

function formatUpdatedAt(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function getSearchQuery(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 100) ?? "";
}

async function getCategories(query: string) {
  const database = getDatabase();
  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { slug: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [categories, totalCount] = await Promise.all([
    database.category.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        updatedAt: true,
        _count: {
          select: {
            products: { where: { archivedAt: null } },
          },
        },
      },
      orderBy: [{ name: "asc" }],
    }),
    database.category.count(),
  ]);

  return {
    totalCount,
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      updatedAt: category.updatedAt,
      activeProductCount: category._count.products,
    })),
  };
}

function CategorySearch({ query }: { query: string }) {
  return (
    <form
      action="/admin/categories"
      method="get"
      role="search"
      className="border-border/80 bg-card shadow-card flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-end"
    >
      <div className="min-w-0 flex-1">
        <Label htmlFor="category-search">Search categories</Label>
        <div className="relative mt-2">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id="category-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search name, slug, or description"
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
            href="/admin/categories"
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

function CategoryLoadError() {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center">
        <span className="bg-destructive/10 text-destructive flex size-11 shrink-0 items-center justify-center rounded-xl">
          <CircleAlert className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Categories could not be loaded</h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            The database did not return category data. Retry the request without
            losing your current page.
          </p>
        </div>
        <CategoryRetryButton />
      </CardContent>
    </Card>
  );
}

function CategoryMobileCard({
  category,
}: {
  category: Awaited<ReturnType<typeof getCategories>>["categories"][number];
}) {
  const editableCategory: EditableCategory = category;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
            <Tags className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold break-words">{category.name}</h3>
            <p className="text-muted-foreground mt-1 font-mono text-xs break-all">
              /{category.slug}
            </p>
          </div>
          <Badge variant="secondary" className="h-6">
            <Package aria-hidden="true" />
            {category.activeProductCount}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm leading-6">
          {category.description || "No description provided."}
        </p>
        {category.activeProductCount > 0 ? (
          <p className="border-warning/20 bg-warning-subtle text-warning-foreground rounded-lg border px-3 py-2 text-xs leading-5">
            Reassign or archive active products before deleting this category.
          </p>
        ) : null}
        <div className="border-border/70 text-muted-foreground flex items-center justify-between border-t pt-3 text-xs">
          <span>Last updated</span>
          <time dateTime={category.updatedAt.toISOString()}>
            {formatUpdatedAt(category.updatedAt)}
          </time>
        </div>
        <CategoryRowActions
          category={editableCategory}
          className="grid grid-cols-2 [&>*]:w-full"
        />
      </CardContent>
    </Card>
  );
}

async function CategoriesContent({ query }: { query: string }) {
  let data: Awaited<ReturnType<typeof getCategories>>;

  try {
    data = await getCategories(query);
  } catch {
    return <CategoryLoadError />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Catalog structure"
        title="Categories"
        description="Create and maintain the product categories available to approved suppliers."
        actions={<CreateCategoryDialog />}
      />

      <CategorySearch query={query} />

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold">
          {query ? `Results for “${query}”` : "All categories"}
        </h2>
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {data.categories.length === data.totalCount
            ? `${data.totalCount} total`
            : `${data.categories.length} of ${data.totalCount} shown`}
        </p>
      </div>

      {data.categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={
            query ? "No categories match this search" : "No categories yet"
          }
          description={
            query
              ? "Try a broader term or clear the search to see every category."
              : "Create the first category to organise supplier product listings."
          }
          action={
            query ? (
              <Link
                href="/admin/categories"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Clear search
              </Link>
            ) : (
              <CreateCategoryDialog />
            )
          }
        />
      ) : (
        <>
          <div className="bg-card shadow-card hidden overflow-x-auto rounded-xl border xl:block">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-4">Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Active products</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.categories.map((category) => {
                  const editableCategory: EditableCategory = category;
                  return (
                    <TableRow key={category.id}>
                      <TableCell className="px-4 py-4 whitespace-normal">
                        <p className="font-semibold">{category.name}</p>
                        <p className="text-muted-foreground mt-1 font-mono text-xs">
                          /{category.slug}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-sm whitespace-normal">
                        <span className="line-clamp-2 leading-5">
                          {category.description || "No description provided."}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            category.activeProductCount > 0
                              ? "secondary"
                              : "outline"
                          }
                          className="h-6"
                        >
                          <Package aria-hidden="true" />
                          {category.activeProductCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <time dateTime={category.updatedAt.toISOString()}>
                          {formatUpdatedAt(category.updatedAt)}
                        </time>
                      </TableCell>
                      <TableCell className="px-4">
                        <CategoryRowActions category={editableCategory} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 xl:hidden">
            {data.categories.map((category) => (
              <CategoryMobileCard key={category.id} category={category} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default async function CategoriesPage({
  searchParams,
}: CategoryPageProps) {
  const [user, params] = await Promise.all([
    requireRole("ADMIN"),
    searchParams,
  ]);
  const query = getSearchQuery(params.q);

  return (
    <AdminShell activeHref="/admin/categories" user={user}>
      <Suspense key={query} fallback={<CategoriesPageSkeleton />}>
        <CategoriesContent query={query} />
      </Suspense>
    </AdminShell>
  );
}
