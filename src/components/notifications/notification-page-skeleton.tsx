import { Skeleton } from "@/components/ui/skeleton";

export function NotificationPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-7" aria-hidden="true">
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-5 w-[34rem] max-w-full" />
      </div>
      <Skeleton className="h-5 w-44" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="border-border bg-card rounded-2xl border p-5"
          >
            <div className="flex gap-4">
              <Skeleton className="size-11 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-6 w-80 max-w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
