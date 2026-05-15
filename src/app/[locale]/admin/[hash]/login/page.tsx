"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { LocaleToggle } from "@/components/layout/locale-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { adminLogin } from "@/lib/admin-api";

export default function AdminLoginPage() {
  const t = useTranslations("adminLogin");
  const router = useRouter();
  const params = useParams<{ locale?: string; hash?: string }>();
  const locale = params.locale ?? "en";
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = await adminLogin(email.trim(), password);
      localStorage.setItem("admin_token", payload.token);
      localStorage.setItem("admin_user", JSON.stringify(payload.user));
      toast.success(t("success"));

      const hash = params.hash ?? "7f9k2x-admin";
      const dashboardPath = `/${locale}/admin/${hash}/dashboard`;

      router.replace(dashboardPath);
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string } | undefined)?.message
          : undefined;

      toast.error(message ?? t("invalid"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#e8eff8] p-4 text-slate-900 dark:bg-[#0b1220] dark:text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0ea5e922_0%,transparent_45%),radial-gradient(circle_at_bottom_left,#10b98122_0%,transparent_40%)]" />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/95 p-8 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mb-6 flex items-center justify-end gap-2">
          <LocaleToggle locale={locale} />
          <ThemeToggle />
        </div>

        <h1 className="mb-6 text-center text-2xl font-bold text-sky-900 dark:text-emerald-400">{t("title")}</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="sr-only">{t("email")}</span>
            <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-[#0b1220]">
              <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                className="h-11 w-full bg-transparent px-3 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("emailPlaceholder")}
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="sr-only">{t("password")}</span>
            <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-[#0b1220]">
              <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                className="h-11 w-full bg-transparent px-3 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("passwordPlaceholder")}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={t("togglePassword")}
                className="text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl border border-emerald-400 bg-transparent py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t("signingIn") : t("signIn")}
          </button>
        </form>
      </div>
    </div>
  );
}




