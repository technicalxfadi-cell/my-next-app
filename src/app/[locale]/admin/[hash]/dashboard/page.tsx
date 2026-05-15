"use client";

import { Activity, ImageIcon, MessageSquareWarning, Shapes, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getDashboardSummary } from "@/lib/admin-api";

export default function AdminDashboardPage() {
  const t = useTranslations("adminDashboard");
  const params = useParams<{ locale?: string | string[]; hash?: string | string[] }>();
  const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
  const hash = Array.isArray(params.hash) ? params.hash[0] : params.hash;
  const adminBasePath = locale && hash ? `/${locale}/admin/${hash}` : "";
  const [stats, setStats] = useState({
    total_services: 0,
    active_sliders: 0,
    active_socials: 0,
    pending_reviews: 0,
  });

  useEffect(() => {
    getDashboardSummary()
      .then(setStats)
      .catch(() => {
        setStats({
          total_services: 0,
          active_sliders: 0,
          active_socials: 0,
          pending_reviews: 0,
        });
      });
  }, []);

  const metricCards = [
    {
      key: "services",
      label: t("totalServices"),
      value: stats.total_services,
      icon: Shapes,
      href: `${adminBasePath}/services`,
      tone: "from-cyan-500/15 to-sky-500/10 text-cyan-700 dark:text-cyan-300",
      chip: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
    },
    {
      key: "sliders",
      label: t("activeSliders"),
      value: stats.active_sliders,
      icon: ImageIcon,
      href: `${adminBasePath}/sliders`,
      tone: "from-violet-500/15 to-fuchsia-500/10 text-violet-700 dark:text-violet-300",
      chip: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    },
    {
      key: "socials",
      label: t("activeSocials"),
      value: stats.active_socials,
      icon: Activity,
      href: `${adminBasePath}/social-links`,
      tone: "from-emerald-500/15 to-teal-500/10 text-emerald-700 dark:text-emerald-300",
      chip: "bg-emerald-400/15 text-emerald-700 dark:text-emerald-300",
    },
    {
      key: "reviews",
      label: t("pendingReviews"),
      value: stats.pending_reviews,
      icon: MessageSquareWarning,
      href: `${adminBasePath}/reviews`,
      tone: "from-amber-500/15 to-orange-500/10 text-amber-700 dark:text-amber-300",
      chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    },
  ] as const;

  const maxMetric = Math.max(...metricCards.map((card) => card.value), 1);
  const detailItems = [
    {
      key: "services-detail",
      text: t("detailServices", { count: stats.total_services }),
      href: `${adminBasePath}/services`,
    },
    {
      key: "sliders-detail",
      text: t("detailSliders", { count: stats.active_sliders }),
      href: `${adminBasePath}/sliders`,
    },
    {
      key: "socials-detail",
      text: t("detailSocials", { count: stats.active_socials }),
      href: `${adminBasePath}/social-links`,
    },
    {
      key: "reviews-detail",
      text: t("detailReviews", { count: stats.pending_reviews }),
      href: `${adminBasePath}/reviews`,
    },
  ];

  return (
    <section className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-14 h-36 w-36 rounded-full bg-emerald-400/10 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{t("title")}</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-300">{t("subtitle")}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            {t("overviewBadge")}
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="grid gap-4 sm:grid-cols-2 xl:col-span-8">
          {metricCards.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${item.tone} p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{item.label}</p>
                    <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{item.value}</p>
                  </div>
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.chip}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("performanceMixTitle")}</h2>
            <div className="mt-4 space-y-4">
              {metricCards.map((item) => {
                const percentage = Math.round((item.value / maxMetric) * 100);

                return (
                  <div key={`bar-${item.key}`}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{item.label}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{percentage}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("detailsTitle")}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("detailsIntro")}</p>
            <div className="mt-4 space-y-2">
              {detailItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/10"
                >
                  {item.text}
                </Link>
              ))}
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("quickActionsTitle")}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href={`${adminBasePath}/services`} className="rounded-lg border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700/50">{t("actionServices")}</Link>
              <Link href={`${adminBasePath}/sliders`} className="rounded-lg border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700/50">{t("actionSliders")}</Link>
              <Link href={`${adminBasePath}/social-links`} className="rounded-lg border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700/50">{t("actionSocials")}</Link>
              <Link href={`${adminBasePath}/reviews`} className="rounded-lg border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700/50">{t("actionReviews")}</Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

