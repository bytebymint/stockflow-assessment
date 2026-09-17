import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton({ chartCount = 0 }: { chartCount?: number }) {
  return (
    <>
      <p className="sr-only" role="status">
        Loading dashboard data…
      </p>
      <div className="space-y-8" aria-hidden="true">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-80 max-w-full" />
          <Skeleton className="h-5 w-[34rem] max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-xl" />
          ))}
        </div>
        {chartCount > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: chartCount }).map((_, index) => (
              <Skeleton key={index} className="h-[28rem] rounded-xl" />
            ))}
          </div>
        ) : null}
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    </>
  );
}
