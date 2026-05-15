"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Languages } from "lucide-react";

type LocaleToggleProps = {
  locale: string;
  tone?: "default" | "hero";
};

function UaeFlagIcon() {
  return (
    <svg viewBox="0 0 24 16" className="h-4 w-5 rounded-sm" aria-hidden>
      <rect width="24" height="16" fill="#fff" />
      <rect width="6" height="16" fill="#ef3340" />
      <rect x="6" width="18" height="5.333" fill="#009a49" />
      <rect x="6" y="10.667" width="18" height="5.333" fill="#000" />
    </svg>
  );
}

function UsFlagIcon() {
  const stripeHeight = 16 / 13;

  return (
    <svg viewBox="0 0 24 16" className="h-4 w-5 rounded-sm" aria-hidden>
      <rect width="24" height="16" fill="#fff" />
      {Array.from({ length: 13 }).map((_, index) => (
        <rect
          key={index}
          x="0"
          y={(index * stripeHeight).toFixed(3)}
          width="24"
          height={stripeHeight.toFixed(3)}
          fill={index % 2 === 0 ? "#b22234" : "#fff"}
        />
      ))}
      <rect x="0" y="0" width="9.6" height={((7 * stripeHeight)).toFixed(3)} fill="#3c3b6e" />
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 6 }).map((__, col) => (
          <circle
            key={`a-${row}-${col}`}
            cx={(1.2 + col * 1.45).toFixed(3)}
            cy={(1.1 + row * 1.7).toFixed(3)}
            r="0.16"
            fill="#fff"
          />
        )),
      )}
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 5 }).map((__, col) => (
          <circle
            key={`b-${row}-${col}`}
            cx={(1.95 + col * 1.45).toFixed(3)}
            cy={(1.95 + row * 1.7).toFixed(3)}
            r="0.16"
            fill="#fff"
          />
        )),
      )}
    </svg>
  );
}

export function LocaleToggle({ locale, tone = "default" }: LocaleToggleProps) {
  const t = useTranslations("locale");
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale = locale === "ar" ? "en" : "ar";
  const nextLocaleLabel = nextLocale === "ar" ? "العربية" : "English";
  
  const toneClass =
    tone === "hero"
      ? "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border-white/20"
      : "bg-gray-100 text-[#0f4f87] hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 border-gray-200 dark:border-gray-700";

  function onSwitch() {
    const segments = pathname.split("/").filter(Boolean);

    if (!segments.length) {
      router.push(`/${nextLocale}`);
      router.refresh();
      return;
    }

    segments[0] = nextLocale;
    router.push(`/${segments.join("/")}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onSwitch}
      aria-label={t("toggle")}
      className={`group flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-all duration-200 hover:scale-105 ${toneClass}`}
    >
      {nextLocale === "ar" ? <UaeFlagIcon /> : <UsFlagIcon />}
      <span className="hidden sm:inline">{nextLocaleLabel}</span>
    </button>
  );
}