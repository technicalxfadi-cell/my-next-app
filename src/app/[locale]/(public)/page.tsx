import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

import { HeroSlider } from "@/components/home/hero-slider";
import { ReviewsSection } from "@/components/home/reviews-section";
import { WhyChooseSection } from "@/components/home/why-choose-section";
import { ServiceCard } from "@/components/services/service-card";
import { getLocalizedSettingValue, getPublicFooterData, getPublicReviews, getPublicServices, getPublicSliders } from "@/lib/public-api";

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const serviceT = await getTranslations({ locale, namespace: "servicesPage" });
  const [sliders, reviews, footerData, services] = await Promise.all([
    getPublicSliders().catch(() => []),
    getPublicReviews(6).catch(() => []),
    getPublicFooterData().catch(() => null),
    getPublicServices().catch(() => []),
  ]);
  const featuredServices = services.slice(0, 6);
  const quickServices = featuredServices.slice(0, 6);
  const homeSectionImage = getLocalizedSettingValue(footerData?.settings, "section_home_image", locale);
  const whyChooseTitle = t("whyChooseTitle");
  const whyChooseItems = (footerData?.why_choose_items ?? [])
    .map((item) => ({
      id: item.id,
      title: locale === "ar" ? item.title_ar ?? item.title_en : item.title_en ?? item.title_ar,
      description: locale === "ar" ? item.description_ar ?? item.description_en : item.description_en ?? item.description_ar,
      icon: item.icon,
    }))
    .filter((item) => Boolean(item.title?.trim()));

  const fallbackWhyChooseItems = [1, 2, 3, 4, 5, 6]
    .map((index) => {
      const titleKey = `whyChooseItems.${index}.title`;
      const descKey = `whyChooseItems.${index}.desc`;

      if (!t.has(titleKey)) {
        return null;
      }

      return {
        id: -index,
        title: t(titleKey),
        description: t.has(descKey) ? t(descKey) : null,
        icon: null,
      };
    })
    .filter((item): item is { id: number; title: string; description: string | null; icon: null } => item !== null);

  const visibleWhyChooseItems = whyChooseItems.length ? whyChooseItems : fallbackWhyChooseItems;
  const primaryAddress = (footerData?.addresses ?? [])[0]
    ? locale === "ar"
      ? (footerData?.addresses ?? [])[0].address_ar || (footerData?.addresses ?? [])[0].address_en
      : (footerData?.addresses ?? [])[0].address_en || (footerData?.addresses ?? [])[0].address_ar
    : locale === "ar"
      ? "أبو ظبي"
      : "Abu Dhabi";

  const stats = [
    {
      value: services.length,
      label: locale === "ar" ? "خدمة نشطة" : "Active Services",
    },
    {
      value: reviews.length,
      label: locale === "ar" ? "آراء العملاء" : "Client Reviews",
    },
    {
      value: (footerData?.socials ?? []).length,
      label: locale === "ar" ? "قنوات التواصل" : "Social Channels",
    },
  ];

  return (
    <>
      <section className="w-full pb-0 pt-0">
      {sliders.length ? (
        <HeroSlider locale={locale} slides={sliders} />
      ) : (
        <div className="relative overflow-hidden p-10 text-white shadow-xl">
          {homeSectionImage ? (
            <Image
              src={homeSectionImage}
              alt={t("heroTitle")}
              fill
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f4f87]/90 to-[#07213b]/90" />
          <div className="relative z-10">
          <h1 className="text-3xl font-bold md:text-5xl">{t("heroTitle")}</h1>
          <p className="mt-4 max-w-2xl text-base text-white/90 md:text-lg">{t("heroSubtitle")}</p>
          <button className="mt-6 rounded-xl bg-[#57c943] px-5 py-3 text-sm font-bold text-white transition hover:brightness-105">
            {t("cta")}
          </button>
          </div>
        </div>
      )}
      </section>

      <section className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 overflow-x-auto bg-[#f1f3f6] px-3 py-3 text-xs text-[#0f4f87] md:px-8">
        <span>{locale === "ar" ? "خدمات متكاملة" : "Complete Services"}</span>
        <span className="text-[#57c943]">{locale === "ar" ? "5 / 4.9 تقييم العملاء" : "4.9 / 5 Client Rating"}</span>
        <span>{locale === "ar" ? "موثوقون في مختلف أنحاء الإمارات" : "Trusted Across UAE"}</span>
        <span className="text-[#57c943]">{locale === "ar" ? "24/7 خدمة على مدار الساعة" : "24/7 Around-the-clock"}</span>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-5 md:px-8">
        {visibleWhyChooseItems.length ? <WhyChooseSection title={whyChooseTitle} items={visibleWhyChooseItems} /> : null}

        {quickServices.length ? (
          <section>
            <div className="mb-4 mt-8 text-center">
              <h2 className="text-2xl font-extrabold text-[#0f4f87]">{locale === "ar" ? "خدماتنا" : "Our Services"}</h2>
              <p className="mt-1 text-sm text-[#5d7998]">
                {locale === "ar"
                  ? "خدمات موثوقة تغطي الاحتياجات الفنية اليومية"
                  : "Reliable solutions for everyday technical needs"}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {quickServices.map((service) => (
                <div key={service.id} className="w-full sm:w-[calc(50%-0.375rem)] md:w-[calc(33.333%-0.5rem)] xl:w-[calc(16.666%-0.625rem)]">
                  <ServiceCard
                    service={service}
                    locale={locale}
                    variant="pdf"
                    labels={{
                      images: serviceT("images"),
                      viewDetails: serviceT("viewDetails"),
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-center">
              <Link
                href={`/${locale}/services`}
                className="inline-flex items-center rounded-lg bg-[#57c943] px-5 py-2 text-sm font-bold text-white transition hover:brightness-105"
              >
                {locale === "ar" ? "عرض جميع الخدمات" : "View All Services"}
              </Link>
            </div>
          </section>
        ) : null}

        <section className="mt-8 overflow-hidden rounded-2xl bg-[#0f4f87] text-white shadow-[0_18px_40px_rgba(8,46,82,0.25)]">
          <div className="border-b border-white/20 px-4 py-5 text-center">
            <h3 className="text-2xl font-extrabold">{locale === "ar" ? "نخدم جميع إمارات الدولة" : "Serving All Emirates"}</h3>
            <p className="mt-1 text-sm text-white/85">
              {locale === "ar"
                ? "حلول صيانة وتركيب تغطي المدن والمناطق الرئيسية"
                : "Maintenance and installation support across major cities"}
            </p>
          </div>

          <div className="relative mx-4 mt-4 h-[360px] overflow-hidden rounded-xl border border-white/20 bg-[radial-gradient(circle_at_30%_20%,#1e6ba5_0%,#0d4577_38%,#093a64_100%)] md:h-[430px]">
            <Image
              src="/reference/map-outline-only.png"
              alt="UAE map"
              fill
              className="object-contain object-center p-4 opacity-95 md:p-10"
            />

            <div className="absolute inset-y-0 end-3 flex items-center md:end-8">
              <div className="relative rounded-xl border border-white/35 bg-[#0b3f6f]/85 px-4 py-3 text-end shadow-[0_14px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm md:px-5 md:py-4">
                <span className="absolute -start-14 top-1/2 h-px w-12 -translate-y-1/2 bg-white/80" />
                <p className="text-base font-extrabold leading-tight md:text-2xl">{primaryAddress}</p>
                <p className="mt-1 text-xs text-white/90 md:text-sm">{locale === "ar" ? "تفاصيل اضافية" : "More details"}</p>
              </div>
            </div>

            <div className="absolute bottom-3 end-3 grid grid-cols-3 gap-1 rounded-lg border border-white/30 bg-[#0d3f6b]/95 p-2 shadow-[0_12px_24px_rgba(0,0,0,0.2)] md:bottom-5 md:end-5 md:w-auto md:gap-2 md:p-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-md px-1.5 py-1.5 text-center md:px-2 md:py-2">
                  <p className="text-base font-extrabold leading-none md:text-lg">{item.value}</p>
                  <p className="mt-1 text-[10px] text-white/85 md:text-xs">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="h-4" />
        </section>
      </section>

      <section className="w-full bg-white px-4 py-8 text-center md:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <h3 className="text-xl font-extrabold text-[#0f4f87]">{locale === "ar" ? "خدمة 24/7" : "24/7 Service"}</h3>
          <p className="mt-1 text-lg font-bold text-[#0f4f87]">{locale === "ar" ? "على مدار الساعة" : "Around The Clock"}</p>
          <p className="mt-2 text-sm leading-6 text-[#587695]">
            {locale === "ar"
              ? "نستقبل طلباتك طوال اليوم ونوفر فريق دعم جاهز للحالات العاجلة"
              : "We receive requests all day with rapid response for urgent cases"}
          </p>
          <button className="mt-4 rounded-lg bg-[#57c943] px-6 py-2 text-sm font-bold text-white transition hover:brightness-105">
            {locale === "ar" ? "اتصل الآن" : "Contact Now"}
          </button>
        </div>
      </section>

      <ReviewsSection locale={locale} reviews={reviews} fullBleed />
   
    </>
  );
}
