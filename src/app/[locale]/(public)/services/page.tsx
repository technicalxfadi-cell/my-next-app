import { ServiceCard } from "@/components/services/service-card";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { SectionHero } from "@/components/layout/section-hero";
import { getLocalizedSettingValue, getPublicFooterData, getPublicServices } from "@/lib/public-api";
import { getTranslations } from "next-intl/server";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesPage" });
  const footerData = await getPublicFooterData().catch(() => null);
  const sectionImage = getLocalizedSettingValue(footerData?.settings, "section_services_image", locale);

  const services = await getPublicServices().catch(() => null);

  if (services === null) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 md:px-8">
        <h1 className="text-3xl font-bold text-[#0f4f87] dark:text-[#deeeff]">{t("title")}</h1>
        <div className="mt-8">
          <ErrorState title={t("errorTitle")} description={t("errorDescription")} />
        </div>
      </section>
    );
  }

  if (!services.length) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 md:px-8">
        <h1 className="text-3xl font-bold text-[#0f4f87] dark:text-[#deeeff]">{t("title")}</h1>
        <div className="mt-8">
          <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-full pb-0 pt-0">
        <SectionHero title={t("title")} subtitle={t("subtitle")} imageUrl={sectionImage} edgeToEdge />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 md:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              locale={locale}
              labels={{
                images: t("images"),
                viewDetails: t("viewDetails"),
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}
