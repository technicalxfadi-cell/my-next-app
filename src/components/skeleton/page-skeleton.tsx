import { CardSkeleton } from "@/components/skeleton/card-skeleton";

export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 md:px-8">
      <div className="h-10 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
