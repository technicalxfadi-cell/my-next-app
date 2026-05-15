import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { getPublicSubServiceDetails } from "@/lib/public-api";
import { ServiceIcon } from "@/components/services/service-icon";
import { getYouTubeEmbedUrl } from "@/lib/utils";

export default async function SubServiceDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; slug: string }>;
}) {
  const { locale, id, slug } = await params;
  const t = await getTranslations({ locale, namespace: "subServiceDetails" });
  const serviceId = Number(id);

  if (!Number.isFinite(serviceId)) {
    notFound();
  }

  const payload = await getPublicSubServiceDetails(serviceId, slug);

  if (!payload) {
    notFound();
  }

  const serviceTitle = locale === "ar" ? payload.service.title_ar : payload.service.title_en;
  const title = locale === "ar" ? payload.sub_service.title_ar : payload.sub_service.title_en;
  const subtitle =
    locale === "ar"
      ? payload.sub_service.subtitle_ar ?? payload.sub_service.subtitle_en
      : payload.sub_service.subtitle_en ?? payload.sub_service.subtitle_ar;
  const content =
    locale === "ar"
      ? payload.sub_service.content_ar ?? payload.sub_service.content_en
      : payload.sub_service.content_en ?? payload.sub_service.content_ar;
  const details =
    locale === "ar"
      ? payload.sub_service.details_ar ?? payload.sub_service.details_en
      : payload.sub_service.details_en ?? payload.sub_service.details_ar;
  const highlightsRaw =
    locale === "ar"
      ? payload.sub_service.highlights_ar ?? payload.sub_service.highlights_en
      : payload.sub_service.highlights_en ?? payload.sub_service.highlights_ar;
  const highlights = (highlightsRaw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const quickFactsFromData = (payload.sub_service.quick_facts ?? [])
    .map((fact) => {
      const title = locale === "ar" ? fact.title_ar ?? fact.title_en : fact.title_en ?? fact.title_ar;
      const value = locale === "ar" ? fact.value_ar ?? fact.value_en : fact.value_en ?? fact.value_ar;

      if (!title && !value) {
        return null;
      }

      return {
        title: title || "",
        value: value || "-",
        icon: fact.icon ?? null,
      };
    })
    .filter((fact): fact is { title: string; value: string; icon: string | null } => Boolean(fact));

  const quickFacts = quickFactsFromData;
  const ctaText =
    locale === "ar"
      ? payload.sub_service.cta_text_ar ?? payload.sub_service.cta_text_en
      : payload.sub_service.cta_text_en ?? payload.sub_service.cta_text_ar;
  const subServiceVideoUrl = getYouTubeEmbedUrl(payload.sub_service.youtube_url);

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 md:px-8">
      <Link
        href={`/${locale}/services/${serviceId}`}
        className="mb-6 inline-flex rounded-lg border border-[#b9cee2] bg-white px-3 py-2 text-sm font-semibold text-[#0f4f87] dark:border-[#2e597f] dark:bg-[#12395f] dark:text-[#d7ebff]"
      >
        ← {t("back")}
      </Link>

      <div className="rounded-2xl border border-[#d0dce8] bg-white p-6 dark:border-[#355b7e] dark:bg-[#12385d] md:p-8">
        <p className="text-sm font-medium text-[#57c943]">{serviceTitle}</p>
        <h1 className="mt-2 text-3xl font-bold text-[#0f4f87] dark:text-[#deeeff]">{title}</h1>
        {subtitle ? <p className="mt-3 text-lg text-[#4f7091] dark:text-[#bdd7f2]">{subtitle}</p> : null}

        {payload.sub_service.cover_image ? (
          <div className="mt-6 overflow-hidden rounded-xl border border-[#d2dde8] dark:border-[#355b7e]">
            <Image
              src={payload.sub_service.cover_image}
              alt={title}
              width={1400}
              height={800}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : null}

        {content ? (
          <div className="prose mt-8 max-w-none whitespace-pre-wrap text-[#4f7091] dark:prose-invert dark:text-[#bdd7f2]">{content}</div>
        ) : null}

        {details ? (
          <div className="mt-6 rounded-xl border border-[#d2dde8] bg-[#f3f5f8] p-4 text-[#4f7091] dark:border-[#355b7e] dark:bg-[#18466d] dark:text-[#bdd7f2]">
            <h2 className="text-lg font-semibold text-[#0f4f87] dark:text-[#deeeff]">{t("details")}</h2>
            <p className="mt-2 whitespace-pre-wrap leading-8">{details}</p>
          </div>
        ) : null}

        {quickFacts.length || (ctaText && payload.sub_service.cta_url) ? (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-[#0f4f87] dark:text-[#deeeff]">{t("quickFacts")}</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {quickFacts.map((fact, index) => (
                <article key={`${fact.title}-${index}`} className="rounded-xl border border-[#d2dde8] bg-[#f3f5f8] p-4 text-center dark:border-[#355b7e] dark:bg-[#18466d]">
                  <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#dce9f6] text-[#0f4f87] dark:bg-[#24547f] dark:text-[#d6ebff]">
                    <ServiceIcon name={fact.icon} className="h-5 w-5" />
                  </span>
                  {fact.title ? <p className="text-xs font-semibold uppercase tracking-wide text-[#5d7998] dark:text-[#b8d3ee]">{fact.title}</p> : null}
                  <p className="mt-2 text-lg font-bold text-[#0f4f87] dark:text-[#deeeff]">{fact.value}</p>
                </article>
              ))}

              {ctaText && payload.sub_service.cta_url ? (
                <article className="rounded-xl border border-[#9fd38f] bg-[#edf9e9] p-4 text-center dark:border-[#4e7f43] dark:bg-[#255128]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#3d8b2f] dark:text-[#a9e59f]">{t("more")}</p>
                  <a
                    href={payload.sub_service.cta_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-lg font-bold text-[#3d8b2f] underline decoration-2 underline-offset-4 transition hover:text-[#57c943] dark:text-[#bbefb3]"
                  >
                    {ctaText}
                  </a>
                </article>
              ) : null}
            </div>
          </div>
        ) : null}

        {highlights.length ? (
          <div className="mt-6 rounded-xl border border-[#9fd38f] bg-[#edf9e9] p-4 dark:border-[#4e7f43] dark:bg-[#255128]">
            <h2 className="text-lg font-semibold text-[#0f4f87] dark:text-[#deeeff]">{t("highlights")}</h2>
            <ul className="mt-3 space-y-2 text-[#4f7091] dark:text-[#d1f5cb]">
              {highlights.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[#57c943]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {subServiceVideoUrl ? (
          <div className="mt-6 overflow-hidden rounded-xl border border-[#d2dde8] dark:border-[#355b7e]">
            <iframe
              className="aspect-video w-full"
              src={subServiceVideoUrl}
              title={t("videoTitle", { title })}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}

        {ctaText && payload.sub_service.cta_url ? (
          <div className="mt-6">
            <a
              href={payload.sub_service.cta_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg bg-[#57c943] px-4 py-2 text-sm font-bold text-white transition hover:brightness-105"
            >
              {ctaText}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
