"use client";

import { LayoutDashboard, MessageSquare, Images, LogOut, Menu, Sparkles, PanelLeftClose, Settings2, Share2 } from "lucide-react";
import { Building2, BriefcaseBusiness } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { LocaleToggle } from "@/components/layout/locale-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type Props = {
  locale: string;
  hash: string;
  children: React.ReactNode;
};

export function AdminShell({ locale, hash, children }: Props) {
  const t = useTranslations("adminShell");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isArabic = locale === "ar";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (pathname.endsWith("/login")) {
      if (token) {
        router.replace(`/${locale}/admin/${hash}/dashboard`);
      }

      return;
    }

    if (!token) {
      router.replace(`/${locale}/admin/${hash}/login`);
    }
  }, [hash, locale, pathname, router]);

  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push(`/${locale}/admin/${hash}/login`);
  }

  if (pathname.endsWith("/login")) {
    return <>{children}</>;
  }

  const navSections = [
    {
      title: "Admin",
      items: [
        {
          href: `/${locale}/admin/${hash}/dashboard`,
          label: t("dashboard"),
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Home Page",
      items: [
        {
          href: `/${locale}/admin/${hash}/sliders`,
          label: t("sliders"),
          icon: Images,
        },
        {
          href: `/${locale}/admin/${hash}/settings?group=home&tab=why-choose`,
          label: "Why Choose Us",
          icon: Settings2,
        },
        {
          href: `/${locale}/admin/${hash}/reviews`,
          label: t("reviews"),
          icon: MessageSquare,
        },
      ],
    },
    {
      title: "Services Page",
      items: [
        {
          href: `/${locale}/admin/${hash}/services`,
          label: t("services"),
          icon: BriefcaseBusiness,
        },
      ],
    },
    {
      title: "About Page",
      items: [
        {
          href: `/${locale}/admin/${hash}/company`,
          label: t("company"),
          icon: Building2,
        },
        {
          href: `/${locale}/admin/${hash}/settings?group=about`,
          label: `${t("siteSettings")} (About)`,
          icon: Settings2,
        },
      ],
    },
    {
      title: "Contact Page",
      items: [
        {
          href: `/${locale}/admin/${hash}/social-links`,
          label: t("socialLinks"),
          icon: Share2,
        },
        {
          href: `/${locale}/admin/${hash}/settings?group=contact`,
          label: `${t("siteSettings")} (Contact)`,
          icon: Settings2,
        },
      ],
    },
    {
      title: "Global Website",
      items: [
        {
          href: `/${locale}/admin/${hash}/settings?group=global`,
          label: `${t("siteSettings")} (Global)`,
          icon: Settings2,
        },
      ],
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#e8eff8] text-slate-900 dark:bg-[#162033] dark:text-slate-100">
      <div className="grid h-full md:grid-cols-[280px_1fr]">
        {open ? (
          <button
            type="button"
            aria-label={t("toggleSidebar")}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-20 bg-slate-950/50 backdrop-blur-sm md:hidden"
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 z-30 w-[280px] overflow-y-auto border-e border-sky-950/30 bg-gradient-to-b from-[#0f3f6e] to-[#0b2f52] p-4 text-white shadow-2xl transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 md:shadow-none ${
            isArabic ? "right-0" : "left-0"
          } ${
            open ? "translate-x-0" : isArabic ? "translate-x-full" : "-translate-x-full"
          }`}
        >
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 text-sm font-extrabold text-[#0f3f6e]">
                T
              </span>
              <div>
                <h2 className="text-sm font-extrabold tracking-wide">TECHNICAL-24</h2>
                <p className="text-[11px] text-slate-200/90">{t("workspaceLabel")}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/70">{section.title}</p>
                <nav className="mt-2 space-y-1.5 text-sm">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const [itemPath, itemQuery = ""] = item.href.split("?");
                    const active =
                      pathname === itemPath &&
                      (itemQuery ? searchParams.toString() === itemQuery : true);
                    return (
                      <Link
                        key={item.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                          active
                            ? "bg-lime-400 font-semibold text-[#0c355d] shadow"
                            : "text-sky-100/90 hover:bg-white/10 hover:text-white"
                        }`}
                        href={item.href}
                        onClick={() => setOpen(false)}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          <p className="mt-6 px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/70">{t("contextTitle")}</p>
          <div className="mt-2 rounded-2xl border border-white/15 bg-white/10 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-lime-300/90">{t("contextLabel")}</p>
            <p className="mt-1 text-sm font-bold text-white">{t("contextValue")}</p>
            <p className="text-xs text-sky-100/80">admin@technical-24.com</p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </button>
        </aside>

        <main className="h-screen overflow-y-auto p-3 md:p-6">
          <div className="top-3 z-10 mb-6 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-[#24324a]/90">
            <div className="flex items-center justify-between gap-3">
              <div className="hidden items-center gap-2 text-sm font-semibold text-sky-900 md:flex dark:text-sky-100">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span>{t("title")}</span>
              </div>

              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label={t("toggleSidebar")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-700 md:hidden dark:border-slate-700 dark:text-slate-200"
              >
                {open ? <PanelLeftClose className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>

              <div className="ms-auto flex items-center gap-2">
                <LocaleToggle locale={locale} />
                <ThemeToggle />
              </div>
            </div>

          </div>

          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}



