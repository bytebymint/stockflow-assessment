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
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-28" />
        </div>
        <ProductGridSkeleton />
      </section>
    </main>
  );
}
