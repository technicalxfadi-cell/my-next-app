import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { ServiceIcon } from "@/components/services/service-icon";
import { ErrorState } from "@/components/states/error-state";
import { getPublicServiceDetails } from "@/lib/public-api";
import { getYouTubeEmbedUrl } from "@/lib/utils";

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "serviceDetails" });
  const servicesT = await getTranslations({ locale, namespace: "servicesPage" });
  const serviceId = Number(id);

  if (!Number.isFinite(serviceId)) {
    notFound();
  }

  let service: Awaited<ReturnType<typeof getPublicServiceDetails>>;
  try {
    service = await getPublicServiceDetails(serviceId);
  } catch {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
        <Link href={`/${locale}/services`} className="mb-6 inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
          ← {t("back")}
        </Link>
        <ErrorState title={servicesT("errorTitle")} description={servicesT("errorDescription")} />
      </section>
    );
  }

  if (!service) {
    notFound();
  }

  const title = locale === "ar" ? service.title_ar : service.title_en;
  const description =
    locale === "ar" ? service.description_ar ?? service.description_en : service.description_en ?? service.description_ar;
  const serviceVideoUrl = getYouTubeEmbedUrl(service.youtube_url);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
      <Link href={`/${locale}/services`} className="mb-6 inline-flex rounded-lg border border-[#b9cee2] bg-white px-3 py-2 text-sm font-semibold text-[#0f4f87] dark:border-[#2e597f] dark:bg-[#12395f] dark:text-[#d7ebff]">
        ← {t("back")}
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-[#c7d9ea] bg-[#eaf1f8] dark:border-[#345a7d] dark:bg-[#173f63]">
          {service.main_image ? (
            <Image
              src={service.main_image}
              alt={title ?? t("imageAlt")}
              width={1200}
              height={800}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-[380px] items-center justify-center">
              <ServiceIcon name={service.icon} className="h-20 w-20 text-[#0f4f87] dark:text-[#9fcbf5]" />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-[#0f4f87] dark:text-[#deeeff]">{title}</h1>
          {description ? <p className="mt-4 leading-8 text-[#4f7091] dark:text-[#bdd7f2]">{description}</p> : null}

          {serviceVideoUrl ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-[#c7d9ea] dark:border-[#355b7f]">
              <iframe
                className="aspect-video w-full"
                src={serviceVideoUrl}
                title={t("videoTitle", { title: title ?? t("imageAlt") })}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : null}
        </div>
      </div>

      {service.sub_services && service.sub_services.length ? (
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-[#0f4f87] dark:text-[#deeeff]">{t("subServices")}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(service.sub_services ?? []).map((subService) => {
              const subTitle = locale === "ar" ? subService.title_ar : subService.title_en;
              const subSubtitle = locale === "ar"
                ? subService.subtitle_ar ?? subService.subtitle_en
                : subService.subtitle_en ?? subService.subtitle_ar;

              return (
                <Link
                  key={subService.id}
                  href={`/${locale}/services/${service.id}/${subService.slug}`}
                  className="overflow-hidden rounded-xl border border-[#d0dce8] bg-white transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#355a7c] dark:bg-[#12385d]"
                >
                  {subService.cover_image ? (
                    <div className="h-40 w-full overflow-hidden border-b border-[#d2dde8] dark:border-[#355a7c]">
                      <Image
                        src={subService.cover_image}
                        alt={subTitle}
                        width={900}
                        height={520}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-[#0f4f87] dark:text-[#deeeff]">{subTitle}</h3>
                    {subSubtitle ? <p className="mt-2 text-sm text-[#4f7091] dark:text-[#bdd7f2]">{subSubtitle}</p> : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
