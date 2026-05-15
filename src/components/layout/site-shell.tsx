"use client";

import {
  Globe,
  Link2,
  Menu,
  MessageCircle,
  Music2,
  Phone,
  Send,
  Mail,
  X,
  type LucideIcon,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { FaSnapchatGhost, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import type { IconType } from "react-icons";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LocaleToggle } from "@/components/layout/locale-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getPublicFooterData, type FooterPayload } from "@/lib/public-api";

const socialIcons: Record<string, IconType> = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  youtube: FaYoutube,
  yt: FaYoutube,
  twitter: FaXTwitter,
  x: FaXTwitter,
  xtwitter: FaXTwitter,
  linkedin: FaLinkedinIn,
  tiktok: FaTiktok,
  music2: FaTiktok,
  whatsapp: FaWhatsapp,
  messagecircle: FaWhatsapp,
  snapchat: FaSnapchatGhost,
  ghost: FaSnapchatGhost,
  telegram: FaTelegramPlane,
  send: FaTelegramPlane,
};

const fallbackSocialIcons: Record<string, LucideIcon> = {
  globe: Globe,
  link: Link2,
  chat: MessageCircle,
  music: Music2,
  send: Send,
};

function normalizeIconKey(value: string | undefined | null) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function SiteShell({ children, locale }: { children: React.ReactNode; locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [footerData, setFooterData] = useState<FooterPayload | null>(null);

  const links = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/services`, label: t("services") },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  useEffect(() => {
    getPublicFooterData()
      .then(setFooterData)
      .catch(() => setFooterData(null));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const companyName =
    locale === "ar"
      ? footerData?.company?.name_ar ?? footerData?.company?.name_en
      : footerData?.company?.name_en ?? footerData?.company?.name_ar;
  const companyDescription =
    locale === "ar"
      ? footerData?.company?.description_ar ?? footerData?.company?.description_en
      : footerData?.company?.description_en ?? footerData?.company?.description_ar;
  const companyLogo = footerData?.company?.logo ?? null;
  const footerText =
    locale === "ar"
      ? footerData?.settings?.footer_text?.value_ar ?? footerData?.settings?.footer_text?.value_en
      : footerData?.settings?.footer_text?.value_en ?? footerData?.settings?.footer_text?.value_ar;
  const activeSocials = (footerData?.socials ?? []).filter((social) => Boolean(social.url));
  const primaryPhone = (footerData?.phones ?? []).find((phone) => Boolean(phone.number?.trim()))?.number ?? null;
  const primaryEmail = (footerData?.emails ?? []).find((email) => Boolean(email.email?.trim()))?.email ?? null;
  const whatsappLink = activeSocials.find((social) => normalizeIconKey(social.platform).includes("whatsapp"))?.url ?? null;
  const basePath = `/${locale}`;
  const hasTopHero =
    pathname === basePath ||
    pathname === `${basePath}/services` ||
    pathname === `${basePath}/about` ||
    pathname === `${basePath}/contact`;
  const heroTop = hasTopHero && !scrolled;

  return (
    <div className="flex min-h-screen flex-col bg-[#eceff3] text-[#0d3257] dark:bg-[#0f2745] dark:text-[#e6eef8]">
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled 
            ? "bg-white/95 dark:bg-[#0a2a49]/95 shadow-xl backdrop-blur-md" 
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-500 ${
              scrolled ? "h-16" : "h-20"
            }`}
          >
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 lg:hidden ${
                heroTop && !scrolled
                  ? "text-white hover:bg-white/10"
                  : "text-[#0f4f87] hover:bg-[#0f4f87]/10 dark:text-white dark:hover:bg-white/10"
              }`}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link href={`/${locale}`} className="lg:absolute lg:left-1/2 lg:-translate-x-1/2">
              {companyLogo ? (
                <div className="relative" style={{ width: scrolled ? 100 : 120, height: scrolled ? 36 : 44 }}>
                  <Image
                    src={companyLogo}
                    alt={companyName ?? t("brand")}
                    fill
                    className="object-contain transition-all duration-500"
                    priority
                  />
                </div>
              ) : (
                <span className={`font-bold transition-all duration-500 ${
                  heroTop && !scrolled ? "text-white" : "text-[#0f4f87] dark:text-white"
                } ${scrolled ? "text-lg" : "text-xl"}`}>
                  {t("brand")}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? heroTop && !scrolled
                        ? "text-white"
                        : "text-[#0f4f87] dark:text-white"
                      : heroTop && !scrolled
                      ? "text-white/80 hover:text-white"
                      : "text-gray-600 hover:text-[#0f4f87] dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                  {pathname === item.href && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-[#57c943]" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <LocaleToggle locale={locale} tone={heroTop && !scrolled ? "hero" : "default"} />
              <ThemeToggle tone={heroTop && !scrolled ? "hero" : "default"} />
              
        <Link
  href={`/${locale}/contact`}
  className="hidden rounded-full px-5 py-2 text-sm font-bold text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg sm:inline-flex bg-[#57c943] hover:bg-[#48b038]"
>
  {locale === "ar" ? "اطلب الآن" : "Request Now"}
</Link>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden absolute left-4 right-4 top-[72px] rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:border-gray-800 dark:bg-[#0a2a49]/95 animate-slideDown">
            <nav className="space-y-1">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-base font-medium transition ${
                    pathname === item.href
                      ? "bg-gradient-to-r from-[#0f4f87]/10 to-transparent text-[#0f4f87] dark:from-white/10 dark:text-white"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={`/${locale}/contact`}
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-xl bg-gradient-to-r from-[#57c943] to-[#69da52] px-4 py-3 text-center font-bold text-white"
              >
                {locale === "ar" ? "اطلب الآن" : "Request Now"}
              </Link>
            </nav>
          </div>
        )}
      </header>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>

      <main className={`flex-1 ${hasTopHero ? "pt-0" : "pt-20 md:pt-24"}`}>{children}</main>

      {primaryPhone || primaryEmail || whatsappLink ? (
        <aside className="fixed bottom-28 left-2 z-30 flex flex-col gap-2 md:bottom-10 md:left-3">
          {primaryPhone ? (
            <a
              href={`tel:${primaryPhone}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f4f87] text-white shadow-md transition hover:scale-105"
              aria-label="Phone"
            >
              <Phone className="h-4 w-4" />
            </a>
          ) : null}
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#57c943] text-white shadow-md transition hover:scale-105"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          ) : null}
          {primaryEmail ? (
            <a
              href={`mailto:${primaryEmail}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f4f87] text-white shadow-md transition hover:scale-105"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
          ) : null}
        </aside>
      ) : null}

<footer className="border-t border-[#d3deea] bg-white text-[#0f4f87] dark:border-[#2a4f73]/50 dark:bg-[#0a2a49] dark:text-[#d9ebff]">
  <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 text-sm md:grid-cols-2 lg:grid-cols-4 md:px-8">
    
    {/* Brand Column */}
    <div className="lg:order-4 flex flex-col items-center justify-center text-center">
      <div className="mb-3">
        {companyLogo ? (
          <div className="relative h-14 w-32 mx-auto">
            <Image
              src={companyLogo}
              alt={companyName ?? t("brand")}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <p className="text-xl font-bold bg-gradient-to-r from-[#0f4f87] to-[#57c943] bg-clip-text text-transparent">
            {companyName ?? t("brand")}
          </p>
        )}
      </div>
      {companyDescription ? (
        <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300 max-w-64">
          {companyDescription}
        </p>
      ) : null}
    </div>

    {/* Quick Links Column */}
    <div className="lg:order-3 text-center">
      <h3 className="mb-4 text-base font-bold text-[#0f4f87] dark:text-[#57c943]">
        {t("quickLinks")}
      </h3>
      <ul className="space-y-2">
        {links.map((item) => (
          <li key={item.href}>
            <Link 
              href={item.href} 
              className="inline-block text-gray-600 transition-all duration-200 hover:text-[#57c943] dark:text-gray-300 dark:hover:text-[#57c943]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>

    {/* Contact Info Column */}
<div className="lg:order-2 text-center" dir="ltr">
  <h3 className="mb-4 text-base font-bold text-[#0f4f87] dark:text-[#57c943]">
    {t("contactInfo")}
  </h3>
  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
    {(footerData?.phones ?? []).map((phone) => (
      <li key={`p-${phone.id}`} className="flex items-center justify-center gap-2">
        <Phone className="h-3.5 w-3.5 text-[#0f4f87] dark:text-[#57c943]" />
        <a 
          href={`tel:${phone.number.replace(/\s+/g, '')}`}
          className="transition-colors duration-200 hover:text-[#57c943]"
        >
          {phone.number}
        </a>
      </li>
    ))}
    {(footerData?.emails ?? []).map((email) => (
      <li key={`e-${email.id}`} className="flex items-center justify-center gap-2">
        <Mail className="h-3.5 w-3.5 text-[#0f4f87] dark:text-[#57c943]" />
        <a 
          href={`mailto:${email.email}`}
          className="break-all transition-colors duration-200 hover:text-[#57c943]"
        >
          {email.email}
        </a>
      </li>
    ))}
    {(footerData?.addresses ?? []).map((address) => (
      <li key={`a-${address.id}`} className="flex items-center justify-center gap-2">
        <Globe className="h-3.5 w-3.5 text-[#0f4f87] dark:text-[#57c943]" />
        <span>{locale === "ar" ? address.address_ar : address.address_en}</span>
      </li>
    ))}
  </ul>
</div>

    {/* Social Links Column */}
    <div className="lg:order-1 text-center" dir="ltr">
      <h3 className="mb-4 text-base font-bold text-[#0f4f87] dark:text-[#57c943]">
        {t("followUs")}
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-3 max-w-56 mx-auto">
        {activeSocials.map((social) => {
          const iconByName = socialIcons[normalizeIconKey(social.lucide_icon)];
          const iconByPlatform = socialIcons[normalizeIconKey(social.platform)];
          const BrandIcon = iconByName ?? iconByPlatform;
          const FallbackIcon = fallbackSocialIcons.link;

          return (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-[#0f4f87] transition-all duration-200 hover:scale-110 hover:bg-[#57c943] hover:text-white dark:bg-white/10 dark:text-[#d9ebff] dark:hover:bg-[#57c943] dark:hover:text-white"
              aria-label={social.platform}
            >
              {BrandIcon ? <BrandIcon className="h-4 w-4" /> : <FallbackIcon className="h-4 w-4" />}
            </a>
          );
        })}
      </div>
    </div>
  </div>

  {/* Bottom Bar - Centered */}
  <div className="border-t border-[#d3deea] bg-gray-50 px-4 py-5 text-center dark:border-[#2a4f73]/30 dark:bg-[#0a2a49]/50">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 text-center text-xs text-gray-500 dark:text-gray-400">
      <p>
        © {new Date().getFullYear()} {companyName ?? t("brand")}. {footerText ?? t("footerLine")}
      </p>
      
      <div className="flex items-center justify-center gap-1">
        <span>Designed & Coded by</span>
        <span className="font-semibold text-[#0f4f87] dark:text-[#57c943]">
          TX Technical-X
        </span>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}