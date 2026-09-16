import { Skeleton } from "@/components/ui/skeleton";

export function SuppliersPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-busy="true">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-20 rounded-xl" />
      <div className="grid gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-44 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
