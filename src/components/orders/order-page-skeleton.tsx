import { Skeleton } from "@/components/ui/skeleton";

export function OrdersListSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-3 h-9 w-80 max-w-full" />
      <Skeleton className="mt-3 h-5 w-[36rem] max-w-full" />
      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-72 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-9 w-56" />
      <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Skeleton className="h-[28rem] rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
