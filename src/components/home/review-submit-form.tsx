"use client";

import { Loader2, Send, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useMemo, useState } from "react";

import { submitPublicReview } from "@/lib/public-api";

type Props = {
  locale: string;
};

export function ReviewSubmitForm({ locale }: Props) {
  const t = useTranslations("homeReviews");
  const [isOpen, setIsOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isDisabled = useMemo(() => {
    return isSubmitting || clientName.trim().length < 2 || reviewText.trim().length < 8;
  }, [clientName, reviewText, isSubmitting]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    setIsSubmitting(true);
    try {
      await submitPublicReview({
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || null,
        client_company: clientCompany.trim() || null,
        review_text_ar: locale === "ar" ? reviewText.trim() : null,
        review_text_en: locale === "en" ? reviewText.trim() : null,
        rating,
      });

      setClientName("");
      setClientEmail("");
      setClientCompany("");
      setReviewText("");
      setRating(5);
      setFeedback({ type: "success", message: t("submittedPending") });
      setTimeout(() => setIsOpen(false), 1200);
    } catch {
      setFeedback({ type: "error", message: t("submitError") });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 flex justify-center">
      <button
        type="button"
        onClick={() => {
          setFeedback(null);
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-xl bg-[#57c943] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-105"
      >
        <Send className="h-4 w-4" />
        {t("openReviewModal")}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07213b]/70 p-4" onClick={() => setIsOpen(false)}>
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#b8d0e5] bg-white p-6 shadow-2xl dark:border-[#2b557b] dark:bg-[#12385d]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-[#0f4f87] dark:text-white">{t("leaveReviewTitle")}</h3>
                <p className="mt-2 text-sm text-[#5d7a98] dark:text-[#bfd8f2]">{t("approvalNote")}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-[#b8d0e5] px-2 py-1 text-xs font-semibold text-[#245784] transition hover:bg-[#edf5fc] dark:border-[#2d5c87] dark:text-[#cae0f8] dark:hover:bg-[#1b4d79]"
              >
                {t("close")}
              </button>
            </div>

            <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-[#2f5d86] dark:text-[#d7ebff]">{t("name")}</span>
                <input
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  required
                  minLength={2}
                  className="w-full rounded-xl border border-[#bcd2e6] bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-[#0f4f87] dark:border-[#325d85] dark:bg-[#0e2e4c]"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-[#2f5d86] dark:text-[#d7ebff]">{t("emailOptional")}</span>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(event) => setClientEmail(event.target.value)}
                  className="w-full rounded-xl border border-[#bcd2e6] bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-[#0f4f87] dark:border-[#325d85] dark:bg-[#0e2e4c]"
                />
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span className="text-sm font-semibold text-[#2f5d86] dark:text-[#d7ebff]">{t("companyOptional")}</span>
                <input
                  value={clientCompany}
                  onChange={(event) => setClientCompany(event.target.value)}
                  className="w-full rounded-xl border border-[#bcd2e6] bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-[#0f4f87] dark:border-[#325d85] dark:bg-[#0e2e4c]"
                />
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span className="text-sm font-semibold text-[#2f5d86] dark:text-[#d7ebff]">{t("yourReview")}</span>
                <textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  required
                  minLength={8}
                  rows={4}
                  className="w-full rounded-xl border border-[#bcd2e6] bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-[#0f4f87] dark:border-[#325d85] dark:bg-[#0e2e4c]"
                />
              </label>

              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-semibold text-[#2f5d86] dark:text-[#d7ebff]">{t("rating")}</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    const active = value <= rating;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="rounded-md p-1.5 text-amber-500 transition hover:bg-amber-500/10"
                        aria-label={`${t("rating")} ${value}`}
                      >
                        <Star className={`h-5 w-5 ${active ? "fill-current" : ""}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isDisabled}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#57c943] px-4 py-2 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isSubmitting ? t("submitting") : t("submit")}
                </button>

                {feedback ? (
                  <p className={`mt-3 text-sm ${feedback.type === "success" ? "text-emerald-600" : "text-red-600 dark:text-red-400"}`}>
                    {feedback.message}
                  </p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
