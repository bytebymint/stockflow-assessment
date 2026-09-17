import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutSuccessLoading() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <Skeleton className="h-56 rounded-2xl" />
      <div className="mt-8 flex items-end justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="mt-4 grid gap-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </main>
  );
}
