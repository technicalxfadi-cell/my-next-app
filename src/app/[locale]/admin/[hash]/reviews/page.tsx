"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { approveReview, deleteReview, getAdminReviews, rejectReview, type AdminReview } from "@/lib/admin-api";

const tabs = ["all", "pending", "approved", "rejected"] as const;

type Tab = (typeof tabs)[number];

export default function AdminReviewsPage() {
  const t = useTranslations("adminReviews");
  const [tab, setTab] = useState<Tab>("pending");
  const [items, setItems] = useState<AdminReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadData(nextTab: Tab) {
    try {
      const data = await getAdminReviews({
        status: nextTab === "all" ? "" : nextTab,
      });
      setItems(data);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getAdminReviews({
          status: tab === "all" ? "" : tab,
        });

        if (!cancelled) {
          setItems(data);
        }
      } catch {
        if (!cancelled) {
          toast.error(t("loadError"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tab, t]);

  async function onApprove(id: number) {
    try {
      await approveReview(id);
      toast.success(t("approved"));
      setIsLoading(true);
      loadData(tab);
    } catch {
      toast.error(t("approveError"));
    }
  }

  async function onReject(id: number) {
    try {
      await rejectReview(id, "Rejected from admin panel");
      toast.success(t("rejected"));
      setIsLoading(true);
      loadData(tab);
    } catch {
      toast.error(t("rejectError"));
    }
  }

  async function onDelete(id: number) {
    if (!window.confirm(t("confirmDelete"))) {
      return;
    }

    try {
      await deleteReview(id);
      toast.success(t("deleted"));
      setIsLoading(true);
      loadData(tab);
    } catch {
      toast.error(t("deleteError"));
    }
  }

  return (
    <section>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("subtitle")}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setIsLoading(true);
              setTab(value);
            }}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition ${
              tab === value
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400 dark:bg-transparent dark:text-emerald-300 dark:hover:bg-emerald-400/10"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-400/10"
            }`}
          >
            {value === "all" ? t("tabAll") : value === "pending" ? t("tabPending") : value === "approved" ? t("tabApproved") : t("tabRejected")}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/70">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 text-sm dark:border-slate-700 dark:bg-[#0b1220]"
        />
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3">{t("tableClient")}</th>
              <th className="px-4 py-3">{t("tableRating")}</th>
              <th className="px-4 py-3">{t("tableStatus")}</th>
              <th className="px-4 py-3">{t("tableText")}</th>
              <th className="px-4 py-3">{t("tableActions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-5 text-slate-500 dark:text-slate-400" colSpan={5}>
                  {t("loading")}
                </td>
              </tr>
            ) : items.length ? (
              items
                .filter((item) => {
                  const text = `${item.client_name} ${item.client_company ?? ""} ${item.review_text_en}`.toLowerCase();
                  return text.includes(search.trim().toLowerCase());
                })
                .map((item) => (
                <tr key={item.id} className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0b1220]/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{item.client_name}</p>
                    {item.client_company ? <p className="text-xs text-slate-500 dark:text-slate-400">{item.client_company}</p> : null}
                  </td>
                  <td className="px-4 py-3">{item.rating}/5</td>
                  <td className="px-4 py-3 capitalize">{item.status}</td>
                  <td className="max-w-sm px-4 py-3 text-slate-600 dark:text-slate-300">
                    {item.review_text_en.slice(0, 90)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {item.status === "pending" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onApprove(item.id)}
                            className="rounded border border-emerald-400 bg-transparent px-2.5 py-1 text-xs font-semibold text-emerald-300"
                          >
                            {t("approve")}
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(item.id)}
                            className="rounded border border-amber-400 bg-transparent px-2.5 py-1 text-xs font-semibold text-amber-300"
                          >
                            {t("reject")}
                          </button>
                        </>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="rounded border border-red-400 bg-transparent px-2.5 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-400/10"
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-5 text-slate-500 dark:text-slate-400" colSpan={5}>
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}




