import { getTranslations } from "next-intl/server";

import { SectionHero } from "@/components/layout/section-hero";
import { getLocalizedSettingValue, getPublicFooterData } from "@/lib/public-api";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  const footerData = await getPublicFooterData().catch(() => null);
  const sectionImage = getLocalizedSettingValue(footerData?.settings, "section_about_image", locale);

  const intro = getLocalizedSettingValue(footerData?.settings, "about_intro", locale);
  const story = getLocalizedSettingValue(footerData?.settings, "about_story", locale);
  const missionTitle = getLocalizedSettingValue(footerData?.settings, "about_mission_title", locale);
  const missionText = getLocalizedSettingValue(footerData?.settings, "about_mission_text", locale);
  const visionTitle = getLocalizedSettingValue(footerData?.settings, "about_vision_title", locale);
  const visionText = getLocalizedSettingValue(footerData?.settings, "about_vision_text", locale);
  const technologyTitle = getLocalizedSettingValue(footerData?.settings, "about_technology_title", locale);
  const technologyText = getLocalizedSettingValue(footerData?.settings, "about_technology_text", locale);
  const expertsTitle = getLocalizedSettingValue(footerData?.settings, "about_experts_title", locale);
  const expertsText = getLocalizedSettingValue(footerData?.settings, "about_experts_text", locale);
  const valuesTitle = getLocalizedSettingValue(footerData?.settings, "about_values_title", locale);
  const valuesIntro = getLocalizedSettingValue(footerData?.settings, "about_values_intro", locale);
  const coreValueIndexes = Object.keys(footerData?.settings ?? {})
    .map((key) => {
      const match = key.match(/^about_value_(\d+)_(title|text)$/);
      return match ? Number(match[1]) : null;
    })
    .filter((index): index is number => index !== null)
    .sort((a, b) => a - b);

  const uniqueCoreValueIndexes = [...new Set(coreValueIndexes)];

  const values = uniqueCoreValueIndexes
    .map((index) => ({
      key: `value-${index}`,
      title: getLocalizedSettingValue(footerData?.settings, `about_value_${index}_title`, locale),
      text: getLocalizedSettingValue(footerData?.settings, `about_value_${index}_text`, locale),
    }))
    .filter((value) => Boolean(value.title || value.text));

  return (
    <>
      <section className="w-full pb-0 pt-0">
        <SectionHero title={t("title")} subtitle={intro} imageUrl={sectionImage} edgeToEdge />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 md:px-8">
        {story ? (
          <article className="mb-6 rounded-3xl border border-[#d0dce8] bg-white p-6 shadow-md dark:border-[#2f567b] dark:bg-[#12385d]">
            <h2 className="text-2xl font-bold text-[#0f4f87] dark:text-[#deeeff]">{t("storyTitle")}</h2>
            <p className="mt-3 text-sm leading-7 text-[#4f7091] dark:text-[#bdd7f2]">{story}</p>
          </article>
        ) : null}

        {missionTitle || missionText || visionTitle || visionText ? (
          <div className="grid gap-5 md:grid-cols-2">
            {missionTitle || missionText ? (
              <article className="group animate-fade-in-left rounded-3xl border border-[#d0dce8] bg-white p-6 shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:border-[#2f567b] dark:bg-[#12385d]">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f4f87] text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  M
                </div>
                {missionTitle ? <h2 className="text-xl font-semibold text-[#0f4f87] transition-colors group-hover:text-[#57c943] dark:text-[#deeeff]">{missionTitle}</h2> : null}
                {missionText ? <p className="mt-3 text-sm leading-7 text-[#4f7091] dark:text-[#bdd7f2]">{missionText}</p> : null}
              </article>
            ) : null}

            {visionTitle || visionText ? (
              <article className="group animate-fade-in-right rounded-3xl border border-[#d0dce8] bg-white p-6 shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:border-[#2f567b] dark:bg-[#12385d]">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f4f87] text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  V
                </div>
                {visionTitle ? <h2 className="text-xl font-semibold text-[#0f4f87] transition-colors group-hover:text-[#57c943] dark:text-[#deeeff]">{visionTitle}</h2> : null}
                {visionText ? <p className="mt-3 text-sm leading-7 text-[#4f7091] dark:text-[#bdd7f2]">{visionText}</p> : null}
              </article>
            ) : null}
          </div>
        ) : null}

        {technologyTitle || technologyText || expertsTitle || expertsText ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {technologyTitle || technologyText ? (
              <article className="rounded-3xl border border-[#d0dce8] bg-white p-6 shadow-md dark:border-[#2f567b] dark:bg-[#12385d]">
                {technologyTitle ? <h3 className="text-lg font-bold text-[#0f4f87] dark:text-[#deeeff]">{technologyTitle}</h3> : null}
                {technologyText ? <p className="mt-3 text-sm leading-7 text-[#4f7091] dark:text-[#bdd7f2]">{technologyText}</p> : null}
              </article>
            ) : null}

            {expertsTitle || expertsText ? (
              <article className="rounded-3xl border border-[#d0dce8] bg-white p-6 shadow-md dark:border-[#2f567b] dark:bg-[#12385d]">
                {expertsTitle ? <h3 className="text-lg font-bold text-[#0f4f87] dark:text-[#deeeff]">{expertsTitle}</h3> : null}
                {expertsText ? <p className="mt-3 text-sm leading-7 text-[#4f7091] dark:text-[#bdd7f2]">{expertsText}</p> : null}
              </article>
            ) : null}
          </div>
        ) : null}

        {valuesTitle || valuesIntro || values.length ? (
          <article className="mt-5 rounded-3xl border border-[#d0dce8] bg-white p-6 shadow-md dark:border-[#2f567b] dark:bg-[#12385d]">
            {valuesTitle ? <h2 className="text-2xl font-bold text-[#0f4f87] dark:text-[#deeeff]">{valuesTitle}</h2> : null}
            {valuesIntro ? <p className="mt-2 text-sm text-[#4f7091] dark:text-[#bdd7f2]">{valuesIntro}</p> : null}

            {values.length ? (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {values.map((value, index) => (
                  <article key={value.key} className="rounded-2xl border border-[#d4dde8] bg-[#f3f4f6] p-4 dark:border-[#385f84] dark:bg-[#18476f]">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#57c943] text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    {value.title ? <h3 className="mt-3 text-base font-semibold text-[#0f4f87] dark:text-[#deeeff]">{value.title}</h3> : null}
                    {value.text ? <p className="mt-2 text-sm leading-6 text-[#4f7091] dark:text-[#bdd7f2]">{value.text}</p> : null}
                  </article>
                ))}
              </div>
            ) : null}
          </article>
        ) : null}
      </section>
    </>
  );
}
