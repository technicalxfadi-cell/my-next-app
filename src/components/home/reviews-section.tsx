"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useRef } from "react";

import type { PublicReview } from "@/lib/public-api";
import { ReviewSubmitForm } from "@/components/home/review-submit-form";

type Props = {
  locale: string;
  reviews: PublicReview[];
  fullBleed?: boolean;
  autoSlideInterval?: number;
};

export function ReviewsSection({ 
  locale, 
  reviews, 
  fullBleed = false, 
  autoSlideInterval = 5000 
}: Props) {
  const t = useTranslations("homeReviews");
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const isRTL = locale === "ar";

  if (!reviews.length) {
    return null;
  }

  const canSlide = reviews.length > 1;
  const current = reviews[Math.min(activeIndex, reviews.length - 1)];
  const reviewText = locale === "ar" ? current.review_text_ar : current.review_text_en;
  const sectionTitle = locale === "ar" ? "آراء العملاء" : "Reviews";

  const startAutoSlide = useCallback(() => {
    if (!canSlide) return;
    
    timerRef.current = setInterval(() => {
      setActiveIndex((currentIndex) => 
        currentIndex === reviews.length - 1 ? 0 : currentIndex + 1
      );
    }, autoSlideInterval);
  }, [canSlide, reviews.length, autoSlideInterval]);

  useEffect(() => {
    if (canSlide) {
      startAutoSlide();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [canSlide, startAutoSlide]);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (canSlide && !timerRef.current) {
      startAutoSlide();
    }
  };

  // For RTL, the navigation functions should be swapped
  function goPrev() {
    if (!canSlide) return;
    if (isRTL) {
      // In RTL, "prev" means go to next index
      setActiveIndex((currentIndex) => 
        currentIndex === reviews.length - 1 ? 0 : currentIndex + 1
      );
    } else {
      setActiveIndex((currentIndex) => 
        currentIndex === 0 ? reviews.length - 1 : currentIndex - 1
      );
    }
  }

  function goNext() {
    if (!canSlide) return;
    if (isRTL) {
      // In RTL, "next" means go to previous index
      setActiveIndex((currentIndex) => 
        currentIndex === 0 ? reviews.length - 1 : currentIndex - 1
      );
    } else {
      setActiveIndex((currentIndex) => 
        currentIndex === reviews.length - 1 ? 0 : currentIndex + 1
      );
    }
  }

  return (
    <section
      className={
        fullBleed
          ? "w-full overflow-hidden bg-[#0f4f87] px-4 py-8 text-white md:py-10"
          : "mt-6 overflow-hidden rounded-2xl bg-[#0f4f87] px-4 py-8 text-white"
      }
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={fullBleed ? "mx-auto w-full max-w-6xl" : ""}>
        <div className="text-center">
          <h2 className="text-xl font-extrabold">{sectionTitle}</h2>
        </div>

        <div className="relative mt-4 flex items-center justify-center gap-2">
          {canSlide && (
            <button
              type="button"
              onClick={goPrev}
              aria-label={t("previous")}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            >
              {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          )}

          <article className="mx-auto w-full max-w-2xl rounded-xl bg-white/10 px-4 py-5 text-center backdrop-blur">
            <div className="mt-2 mb-2 flex items-center justify-center gap-1 text-amber-300">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="line-clamp-4 text-sm leading-7 text-white/95">{reviewText}</p>
            <p className="mt-3 text-sm font-bold">{current.client_name}</p>
            {current.client_company ? <p className="text-xs text-white/85">{current.client_company}</p> : null}
          </article>

          {canSlide && (
            <button
              type="button"
              onClick={goNext}
              aria-label={t("next")}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            >
              {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          )}
        </div>

        {canSlide && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {reviews.map((_, idx) => (
              <button
                key={`reviews-dot-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`h-2.5 rounded-full transition ${idx === activeIndex ? "w-6 bg-[#69da52]" : "w-2.5 bg-white/55 hover:bg-white/75"}`}
              />
            ))}
          </div>
        )}

        <ReviewSubmitForm locale={locale} />
      </div>
    </section>
  );
}