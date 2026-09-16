import { Skeleton } from "@/components/ui/skeleton";

type ProductGridSkeletonProps = {
  count?: number;
};

export function ProductGridSkeleton({ count = 6 }: ProductGridSkeletonProps) {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-label="Loading products"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="border-border/80 bg-card shadow-card overflow-hidden rounded-xl border"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-4 p-5">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-8 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
