import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-black text-emerald-500">404</h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">The page you requested was not found.</p>
      <Link href="/en" className="mt-6 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white">
        Go Home
      </Link>
    </div>
  );
}
