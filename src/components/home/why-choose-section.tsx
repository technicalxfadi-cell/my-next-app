"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { ServiceIcon } from "@/components/services/service-icon";

type WhyChooseItem = {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
};

type WhyChooseSectionProps = {
  title: string;
  items: WhyChooseItem[];
};

export function WhyChooseSection({ title, items }: WhyChooseSectionProps) {
  const [activePage, setActivePage] = useState(0);
  const pages = useMemo(() => {
    const chunks: WhyChooseItem[][] = [];

    for (let index = 0; index < items.length; index += 4) {
      chunks.push(items.slice(index, index + 4));
    }

    return chunks;
  }, [items]);

  if (!items.length) {
    return null;
  }

  const pageCount = pages.length;
  const currentPage = pages[Math.min(activePage, pageCount - 1)] ?? [];

  function goPrev() {
    if (pageCount <= 1) {
      return;
    }

    setActivePage((current) => (current === 0 ? pageCount - 1 : current - 1));
  }

  function goNext() {
    if (pageCount <= 1) {
      return;
    }

    setActivePage((current) => (current === pageCount - 1 ? 0 : current + 1));
  }

  return (
    <section className="mt-5 px-1 pb-3 pt-2">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-extrabold text-[#0f4f87] dark:text-[#deeeff]">{title}</h2>
      </div>

      <div className="relative px-8 md:px-10">
        {pageCount > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous"
              className="absolute left-0 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[#0f4f87] transition hover:text-[#0a3d6d] dark:text-[#deeeff] dark:hover:text-[#69da52]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next"
              className="absolute right-0 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[#0f4f87] transition hover:text-[#0a3d6d] dark:text-[#deeeff] dark:hover:text-[#69da52]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}

        <div className="flex flex-wrap justify-center gap-4">
          {currentPage.map((item) => {
          return (
            <article key={item.id} className="w-full text-center sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
              <ServiceIcon name={item.icon} className="mx-auto mb-3 h-9 w-9 text-[#0f4f87] dark:text-[#69da52]" />
              <h3 className="text-base font-extrabold text-[#0f4f87] dark:text-[#69da52] lg:min-h-[3.5rem]">{item.title}</h3>
              {item.description ? <p className="mt-1 text-sm leading-6 text-[#5a7896] dark:text-[#b2c8df] lg:min-h-[7.5rem]">{item.description}</p> : null}
            </article>
          );
          })}
        </div>

        {pageCount > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-2">
            {pages.map((_, pageIndex) => (
              <button
                key={`why-page-${pageIndex}`}
                type="button"
                onClick={() => setActivePage(pageIndex)}
                aria-label={`Page ${pageIndex + 1}`}
                className={`h-2.5 rounded-full transition ${pageIndex === activePage ? "w-6 bg-[#69da52]" : "w-2.5 bg-[#9eb7ce] hover:bg-[#6f90af] dark:bg-[#5f7f9d] dark:hover:bg-[#86a8c8]"}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}