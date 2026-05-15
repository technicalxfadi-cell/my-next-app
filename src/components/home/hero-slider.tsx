"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import type { PublicSlider } from "@/lib/public-api";

type Props = {
  locale: string;
  slides: PublicSlider[];
};

export function HeroSlider({ locale, slides }: Props) {
  const t = useTranslations("homeSlider");
  const [active, setActive] = useState(0);
  const [showArrows, setShowArrows] = useState(true);
  const hideArrowsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queueArrowsHide = useCallback(() => {
    if (hideArrowsTimer.current) {
      clearTimeout(hideArrowsTimer.current);
    }

    hideArrowsTimer.current = setTimeout(() => {
      setShowArrows(false);
    }, 1400);
  }, []);

  const revealArrows = useCallback(() => {
    setShowArrows(true);
    queueArrowsHide();
  }, [queueArrowsHide]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % slides.length;
        revealArrows();
        return next;
      });
    }, 5500);

    return () => clearInterval(timer);
  }, [revealArrows, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    queueArrowsHide();
  }, [queueArrowsHide, slides.length]);

  useEffect(() => {
    return () => {
      if (hideArrowsTimer.current) {
        clearTimeout(hideArrowsTimer.current);
      }
    };
  }, []);

  const current = slides[active];
  const title =
    (locale === "ar" ? current.title_ar ?? current.title_en : current.title_en ?? current.title_ar) ??
    (locale === "ar" ? "خدمات فنية فورية\nفي جميع أنحاء الإمارات" : "Fast Technical Services\nAcross UAE");
  const subtitle =
    (locale === "ar" ? current.subtitle_ar ?? current.subtitle_en : current.subtitle_en ?? current.subtitle_ar) ??
    (locale === "ar" ? "منصة ذكية تربطك بأقرب الفنيين المعتمدين" : "A smart platform connecting you with trusted technicians");

  return (
    <section
      className="relative h-screen overflow-hidden bg-[#0a2a49]"
      onMouseEnter={revealArrows}
      onMouseMove={revealArrows}
      onTouchStart={revealArrows}
    >
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === active ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={slide.image}
              alt={(locale === "ar" ? slide.title_ar : slide.title_en) ?? t("slideAlt")}
              fill
              priority={index === active}
              className={`object-cover ${index === active ? "animate-ken-burns" : ""}`}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/55 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d3157]/20 via-[#0a2a49]/55 to-[#07213b]/40" />
      </div>

      <div className="relative z-10 flex min-h-[560px] items-center p-5 text-white md:min-h-[680px] md:p-10">
        <div className="mx-auto w-full max-w-3xl text-center">
          {title ? (
            <motion.h1
              key={`title-${current.id}`}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="mx-auto max-w-[16ch] whitespace-pre-line text-4xl font-extrabold leading-[1.25] drop-shadow-[0_4px_14px_rgba(0,0,0,0.55)] md:text-5xl"
            >
              {title}
            </motion.h1>
          ) : null}

          {subtitle ? (
            <motion.p
              key={`subtitle-${current.id}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.05, ease: "easeOut" }}
              className="mx-auto mt-5 max-w-[36ch] text-xl text-white/95"
            >
              {subtitle}
            </motion.p>
          ) : null}

        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label={t("previous")}
            onClick={() => {
              revealArrows();
              setActive((prev) => (prev - 1 + slides.length) % slides.length);
            }}
            className={`absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 p-2.5 text-white backdrop-blur transition hover:scale-105 hover:bg-emerald-500 ${
              showArrows ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={t("next")}
            onClick={() => {
              revealArrows();
              setActive((prev) => (prev + 1) % slides.length);
            }}
            className={`absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 p-2.5 text-white backdrop-blur transition hover:scale-105 hover:bg-emerald-500 ${
              showArrows ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#0a2a49]/45 px-3 py-1.5 backdrop-blur-sm">
            {slides.map((slide, index) => {
              const isActive = index === active;

              return (
                <button
                  key={`hero-dot-${slide.id}`}
                  type="button"
                  onClick={() => {
                    revealArrows();
                    setActive(index);
                  }}
                  aria-label={`${locale === "ar" ? "شريحة" : "Slide"} ${index + 1}`}
                  className={`h-3 rounded-full transition ${isActive ? "w-9 bg-[#69da52]" : "w-3 bg-[#9eb7ce] hover:bg-[#bdd1e3]"}`}
                />
              );
            })}
          </div>

        </>
      ) : null}
    </section>
  );
}
