import { ProductGridSkeleton } from "@/components/catalog/product-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <main id="main-content" className="flex-1" aria-busy="true">
      <section className="border-border/70 border-b">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-4 h-11 w-full max-w-2xl" />
          <Skeleton className="mt-4 h-6 w-full max-w-xl" />
          <div className="mt-7 flex max-w-3xl flex-col gap-2 sm:flex-row">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-full sm:w-32" />
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-11 w-full sm:w-72" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <div className="border-border bg-card hidden rounded-xl border p-5 lg:block">
            <Skeleton className="h-6 w-32" />
            <div className="mt-6 space-y-5">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-11 w-full" />
                </div>
              ))}
            </div>
          </div>
          <ProductGridSkeleton
            count={6}
            className="lg:grid-cols-2 xl:grid-cols-3"
          />
        </div>
      </section>
    </main>
  );
}
