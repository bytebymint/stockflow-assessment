import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  CATALOG_PAGE_SIZE,
  catalogHref,
  type CatalogQuery,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

type CatalogPaginationProps = {
  currentPage: number;
  pageCount: number;
  query: CatalogQuery;
  total: number;
};

function paginationItems(currentPage: number, pageCount: number) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set([
    1,
    pageCount,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const validPages = [...pages]
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((left, right) => left - right);
  const items: Array<number | "ellipsis"> = [];

  validPages.forEach((page, index) => {
    const previousPage = validPages[index - 1];
    if (previousPage && page - previousPage > 1) items.push("ellipsis");
    items.push(page);
  });

  return items;
}

export function CatalogPagination({
  currentPage,
  pageCount,
  query,
  total,
}: CatalogPaginationProps) {
  if (total === 0) return null;

  const firstResult = (currentPage - 1) * CATALOG_PAGE_SIZE + 1;
  const lastResult = Math.min(currentPage * CATALOG_PAGE_SIZE, total);

  return (
    <div className="border-border mt-8 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm" aria-live="polite">
        Showing{" "}
        <span className="text-foreground font-medium">{firstResult}</span>–
        <span className="text-foreground font-medium">{lastResult}</span> of{" "}
        <span className="text-foreground font-medium">{total}</span> products
      </p>

      {pageCount > 1 ? (
        <nav
          className="flex items-center justify-between gap-2 sm:justify-end"
          aria-label="Catalog pagination"
        >
          {currentPage > 1 ? (
            <Link
              href={catalogHref(query, { page: currentPage - 1 })}
              className={buttonVariants({ variant: "outline", size: "sm" })}
              aria-label="Go to previous catalog page"
            >
              <ChevronLeft data-icon="inline-start" aria-hidden="true" />
              Previous
            </Link>
          ) : (
            <span
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "pointer-events-none opacity-45",
              )}
              aria-disabled="true"
            >
              <ChevronLeft data-icon="inline-start" aria-hidden="true" />
              Previous
            </span>
          )}

          <div className="hidden items-center gap-1 md:flex">
            {paginationItems(currentPage, pageCount).map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="text-muted-foreground flex size-11 items-center justify-center"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : item === currentPage ? (
                <span
                  key={item}
                  className={cn(buttonVariants({ size: "icon-sm" }))}
                  aria-current="page"
                  aria-label={`Page ${item}, current page`}
                >
                  {item}
                </span>
              ) : (
                <Link
                  key={item}
                  href={catalogHref(query, { page: item })}
                  className={buttonVariants({
                    variant: "outline",
                    size: "icon-sm",
                  })}
                  aria-label={`Go to catalog page ${item}`}
                >
                  {item}
                </Link>
              ),
            )}
          </div>

          <span className="text-muted-foreground text-sm md:hidden">
            Page {currentPage} of {pageCount}
          </span>

          {currentPage < pageCount ? (
            <Link
              href={catalogHref(query, { page: currentPage + 1 })}
              className={buttonVariants({ variant: "outline", size: "sm" })}
              aria-label="Go to next catalog page"
            >
              Next
              <ChevronRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          ) : (
            <span
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "pointer-events-none opacity-45",
              )}
              aria-disabled="true"
            >
              Next
              <ChevronRight data-icon="inline-end" aria-hidden="true" />
            </span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
