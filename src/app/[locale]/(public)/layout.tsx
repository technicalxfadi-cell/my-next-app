import { SiteShell } from "@/components/layout/site-shell";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <SiteShell locale={locale}>{children}</SiteShell>;
}
