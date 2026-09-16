import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <main id="main-content" className="flex-1" aria-busy="true">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Skeleton className="h-11 w-36" />
        <div className="mt-4 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.06fr)_minmax(22rem,0.94fr)] lg:gap-12">
          <Skeleton className="aspect-square w-full rounded-2xl sm:aspect-[4/3] lg:aspect-square" />
          <div className="self-center py-2">
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-32" />
            </div>
            <Skeleton className="mt-5 h-12 w-4/5" />
            <div className="mt-5 space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
            </div>
            <div className="mt-7 grid grid-cols-2 gap-6 border-y py-5">
              <Skeleton className="h-14 w-28" />
              <Skeleton className="ml-auto h-14 w-32" />
            </div>
            <Skeleton className="mt-6 h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
