import { getTranslations } from "next-intl/server";

import { SectionHero } from "@/components/layout/section-hero";
import { getLocalizedSettingValue, getPublicFooterData } from "@/lib/public-api";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  const footerData = await getPublicFooterData().catch(() => null);
  const sectionImage = getLocalizedSettingValue(footerData?.settings, "section_contact_image", locale);
  const phones = (footerData?.phones ?? []).filter((phone) => Boolean(phone.number?.trim()));
  const emails = (footerData?.emails ?? []).filter((email) => Boolean(email.email?.trim()));
  const addresses = (footerData?.addresses ?? []).filter((address) => Boolean(address.address_ar?.trim() || address.address_en?.trim()));

  return (
    <>
      <section className="w-full pb-0 pt-0">
        <SectionHero title={t("title")} subtitle={t("subtitle")} imageUrl={sectionImage} edgeToEdge />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 md:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
        <form className="animate-fade-in-left space-y-4 rounded-3xl border border-[#d0dce8] bg-white p-6 shadow-md dark:border-[#2f567b] dark:bg-[#12385d]">
          <input
            className="h-11 w-full rounded-lg border border-[#bcd1e5] bg-transparent px-3 dark:border-[#355f87]"
            placeholder={t("name")}
          />
          <input
            className="h-11 w-full rounded-lg border border-[#bcd1e5] bg-transparent px-3 dark:border-[#355f87]"
            placeholder={t("email")}
          />
          <input
            className="h-11 w-full rounded-lg border border-[#bcd1e5] bg-transparent px-3 dark:border-[#355f87]"
            placeholder={t("subject")}
          />
          <textarea
            className="min-h-32 w-full rounded-lg border border-[#bcd1e5] bg-transparent p-3 dark:border-[#355f87]"
            placeholder={t("message")}
          />
          <button
            type="button"
            className="rounded-xl bg-[#57c943] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-105"
          >
            {t("send")}
          </button>
        </form>

        <div className="animate-fade-in-right rounded-3xl border border-[#d0dce8] bg-white p-6 shadow-md dark:border-[#2f567b] dark:bg-[#12385d]">
          <h2 className="text-xl font-semibold text-[#0f4f87] dark:text-[#deeeff]">{t("contactInfo")}</h2>
          <ul className="mt-4 space-y-2 text-sm text-[#4f7091] dark:text-[#bdd7f2]">
            {phones.map((phone) => (
              <li key={`phone-${phone.id}`}>
                {phone.label_ar || phone.label_en ? `${locale === "ar" ? phone.label_ar ?? phone.label_en : phone.label_en ?? phone.label_ar}: ` : ""}
                <bdi dir="ltr">{phone.number}</bdi>
              </li>
            ))}

            {emails.map((email) => (
              <li key={`email-${email.id}`}>
                {email.label_ar || email.label_en ? `${locale === "ar" ? email.label_ar ?? email.label_en : email.label_en ?? email.label_ar}: ` : ""}
                <bdi dir="ltr">{email.email}</bdi>
              </li>
            ))}

            {addresses.map((address) => (
              <li key={`address-${address.id}`}>
                {address.label_ar || address.label_en ? `${locale === "ar" ? address.label_ar ?? address.label_en : address.label_en ?? address.label_ar}: ` : ""}
                {locale === "ar" ? address.address_ar || address.address_en : address.address_en || address.address_ar}
              </li>
            ))}
          </ul>

          <div className="mt-5 h-56 rounded-2xl border border-dashed border-[#98b6d5] bg-[#edf4fb] text-center text-xs text-[#5c7998] dark:border-[#3c668e] dark:bg-[#0d2f4f] dark:text-[#bdd7f2]">
            <div className="flex h-full items-center justify-center">
              {t("mapPlaceholder")}
            </div>
          </div>
        </div>
        </div>
      </section>
    </>
  );
}
