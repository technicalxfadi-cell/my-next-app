import { AdminShell } from "@/components/layout/admin-shell";
import { notFound } from "next/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; hash: string }>;
}) {
  const { locale, hash } = await params;
  const expectedHash = process.env.ADMIN_HASH ?? process.env.NEXT_PUBLIC_ADMIN_HASH ?? "7f9k2x-admin";

  if (hash !== expectedHash) {
    notFound();
  }

  return <AdminShell locale={locale} hash={hash}>{children}</AdminShell>;
}

