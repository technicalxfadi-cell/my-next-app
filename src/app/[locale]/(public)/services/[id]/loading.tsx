export default function LoadingServiceDetailsPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-6 h-10 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-[380px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-4">
          <div className="h-10 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-5 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-[220px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </section>
  );
}
