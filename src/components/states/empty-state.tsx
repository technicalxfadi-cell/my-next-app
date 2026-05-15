import { Inbox } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
      <Inbox className="mx-auto mb-4 h-8 w-8 text-slate-500" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}
