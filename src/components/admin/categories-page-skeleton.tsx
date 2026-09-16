import { Skeleton } from "@/components/ui/skeleton";

export function CategoriesPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-busy="true">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
        <Skeleton className="h-11 w-36" />
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="border-border bg-card shadow-card overflow-hidden rounded-xl border">
        <div className="space-y-4 p-5">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
