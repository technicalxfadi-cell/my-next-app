import { CardSkeleton } from "@/components/skeleton/card-skeleton";

export default function LoadingServicesPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
      <div className="h-10 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2 h-5 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </section>
  );
}
