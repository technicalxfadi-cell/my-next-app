"use client";

import { AlertTriangle } from "lucide-react";

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/60 dark:bg-red-950/20">
      <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />
      <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">{title}</h3>
      <p className="mt-2 text-sm text-red-600/90 dark:text-red-300/90">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
