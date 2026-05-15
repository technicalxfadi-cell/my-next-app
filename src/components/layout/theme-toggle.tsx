"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/providers/theme-provider";

type ThemeToggleProps = {
  tone?: "default" | "hero";
};

export function ThemeToggle({ tone = "default" }: ThemeToggleProps) {
  const t = useTranslations("theme");
  const { theme, setTheme, mounted } = useTheme();
  const isDark = theme === "dark";
  
  const toneClass =
    tone === "hero"
      ? "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border-white/20"
      : "bg-gray-100 text-[#0f4f87] hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 border-gray-200 dark:border-gray-700";

  return (
    <button
      type="button"
      aria-label={t("toggle")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 ${toneClass}`}
    >
      {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}