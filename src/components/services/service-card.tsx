import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ServiceIcon } from "@/components/services/service-icon";
import type { PublicService } from "@/lib/public-api";

type Props = {
  service: PublicService;
  locale: string;
  variant?: "default" | "pdf";
  highlighted?: boolean;
  labels: {
    images: string;
    viewDetails: string;
  };
};

export function ServiceCard({ service, locale, labels, variant = "default", highlighted = false }: Props) {
  const title = locale === "ar" ? service.title_ar : service.title_en;
  const description =
    locale === "ar" ? service.description_ar ?? service.description_en : service.description_en ?? service.description_ar;

  if (variant === "pdf") {
    return (
      <Link
        href={`/${locale}/services/${service.id}`}
        className={`group block overflow-hidden rounded-xl border transition hover:-translate-y-0.5 hover:shadow-md ${
          highlighted
            ? "border-[#2f6ea5] bg-gradient-to-b from-[#1f5f93] to-[#0f4f87]"
            : "border-[#d4dde8] bg-[#f3f4f6] hover:border-[#2f6ea5] hover:bg-gradient-to-b hover:from-[#1f5f93] hover:to-[#0f4f87]"
        }`}
      >
        <div className="relative h-28 overflow-hidden bg-[#dbe7f2] md:h-32">
          {service.main_image ? (
            <Image
              src={service.main_image}
              alt={title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 220px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ServiceIcon name={service.icon} className={`h-8 w-8 ${highlighted ? "text-white" : "text-[#0f4f87]"}`} />
            </div>
          )}
          <div className={`absolute inset-0 ${highlighted ? "bg-[#0f4f87]/25" : "bg-[#0f4f87]/10"}`} />
          <div
            className={`absolute bottom-2 end-2 inline-flex h-7 w-7 items-center justify-center rounded-md ${
              highlighted
                ? "bg-white/90 text-[#0f4f87]"
                : "bg-[#0f4f87] text-white group-hover:bg-white/90 group-hover:text-[#0f4f87]"
            }`}
          >
            <ServiceIcon name={service.icon} className="h-4 w-4" />
          </div>
        </div>
        <div className="p-3">
          <h2
            className={`line-clamp-1 text-center text-sm font-extrabold ${
              highlighted ? "text-white" : "text-[#0f4f87] group-hover:text-white"
            }`}
          >
            {title}
          </h2>
          {description ? (
            <p
              className={`mt-1 line-clamp-2 text-center text-xs leading-5 ${
                highlighted ? "text-white/90" : "text-[#5d7a98] group-hover:text-white/90"
              }`}
            >
              {description}
            </p>
          ) : null}
          <p
            className={`mt-2 text-center text-[11px] font-semibold ${
              highlighted ? "text-[#9df58a]" : "text-[#57c943] group-hover:text-[#9df58a]"
            }`}
          >
            {labels.viewDetails}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#d4dde8] bg-[#f3f4f6] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-[#34597c] dark:bg-[#12385e]">
      <div className="relative h-44 w-full bg-[#e9edf2] dark:bg-[#18476f]">
        {service.main_image ? (
          <Image
            src={service.main_image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ServiceIcon name={service.icon} className="h-12 w-12 text-[#0f4f87] dark:text-[#a6d3ff]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f4f87]/40 to-transparent" />
      </div>

      <div className="relative p-5">
        <div className="absolute -top-7 left-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f4f87] text-white shadow-lg transition-all duration-300 group-hover:scale-105">
          <ServiceIcon name={service.icon} className="h-7 w-7" />
        </div>

        <h2 className="mt-5 line-clamp-1 text-lg font-extrabold text-[#0f4f87] dark:text-[#d6ebff]">{title}</h2>
        {description ? <p className="mt-2 line-clamp-2 text-sm text-[#45688c] dark:text-[#bdd8f2]">{description}</p> : null}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-[#56789d] dark:text-[#b0ccea]">
            {service.images_count ?? 0} {labels.images}
          </span>
          <Link
            href={`/${locale}/services/${service.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-[#57c943] px-3 py-2 text-xs font-bold text-white transition hover:brightness-105"
          >
            {labels.viewDetails}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
