import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceLoading() {
  return (
    <div
      className="bg-background min-h-dvh p-4 sm:p-6 lg:ml-68 lg:p-8"
      aria-busy="true"
      aria-label="Loading workspace"
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-full max-w-sm" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
