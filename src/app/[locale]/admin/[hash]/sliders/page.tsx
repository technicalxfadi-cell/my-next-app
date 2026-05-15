"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Pencil, Plus, X } from "lucide-react";

import { createAdminSlider, deleteAdminSlider, getAdminSliders, type AdminSlider, updateAdminSlider } from "@/lib/admin-api";

export default function AdminSlidersPage() {
  const t = useTranslations("adminSliders");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const englishLabel = isArabic ? "الانجليزية" : "English";
  const arabicLabel = isArabic ? "العربية" : "Arabic";
  const [items, setItems] = useState<AdminSlider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [editingSlider, setEditingSlider] = useState<AdminSlider | null>(null);
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null);
  const [newSlider, setNewSlider] = useState<Pick<AdminSlider, "title_ar" | "title_en" | "subtitle_ar" | "subtitle_en" | "image" | "is_active" | "order">>({
    title_ar: null,
    title_en: null,
    subtitle_ar: null,
    subtitle_en: null,
    image: "",
    is_active: true,
    order: 0,
  });

  const newImagePreview = useMemo(() => {
    if (!newImageFile) {
      return null;
    }

    return URL.createObjectURL(newImageFile);
  }, [newImageFile]);

  const editingImagePreview = useMemo(() => {
    if (editingImageFile) {
      return URL.createObjectURL(editingImageFile);
    }

    return editingSlider?.image ?? null;
  }, [editingImageFile, editingSlider?.image]);

  useEffect(() => {
    getAdminSliders()
      .then((sliders) => {
        setItems(sliders);
      })
      .catch(() => toast.error(t("loadError")))
      .finally(() => setIsLoading(false));
  }, [t]);

  useEffect(() => {
    return () => {
      if (newImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(newImagePreview);
      }
    };
  }, [newImagePreview]);

  useEffect(() => {
    return () => {
      if (editingImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(editingImagePreview);
      }
    };
  }, [editingImagePreview]);

  async function reload() {
    const data = await getAdminSliders();
    setItems(data);
  }

  async function createOne(): Promise<boolean> {
    if (!newImageFile) {
      toast.error(t("imageRequired"));
      return false;
    }

    setIsCreating(true);
    try {
      await createAdminSlider({
        title_ar: newSlider.title_ar,
        title_en: newSlider.title_en,
        subtitle_ar: newSlider.subtitle_ar,
        subtitle_en: newSlider.subtitle_en,
        image: newSlider.image,
        is_active: newSlider.is_active,
        order: newSlider.order,
      }, newImageFile);
      toast.success(t("created"));
      setNewSlider({
        title_ar: null,
        title_en: null,
        subtitle_ar: null,
        subtitle_en: null,
        image: "",
        is_active: true,
        order: items.length + 1,
      });
      setNewImageFile(null);
      await reload();
      return true;
    } catch {
      toast.error(t("createError"));
      return false;
    } finally {
      setIsCreating(false);
    }
  }

  async function saveOne(item: AdminSlider, imageFile?: File | null) {
    setSavingId(item.id);
    try {
      await updateAdminSlider({
        id: item.id,
        title_ar: item.title_ar,
        title_en: item.title_en,
        subtitle_ar: item.subtitle_ar,
        subtitle_en: item.subtitle_en,
        image: item.image,
        is_active: item.is_active,
        order: item.order,
      }, imageFile ?? null);
      toast.success(t("updated"));
      await reload();
    } catch {
      toast.error(t("updateError"));
    } finally {
      setSavingId(null);
    }
  }

  async function removeOne(id: number) {
    if (!window.confirm(t("confirmDelete"))) {
      return;
    }

    try {
      await deleteAdminSlider(id);
      toast.success(t("deleted"));
      await reload();
    } catch {
      toast.error(t("deleteError"));
    }
  }


  if (isLoading) {
    return <div className="text-slate-600 dark:text-slate-300">{t("loading")}</div>;
  }

  return (
    <section>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#24324a]/70">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{t("subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-transparent border border-sky-400 px-4 py-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/10"
          >
            <Plus className="h-4 w-4" />
            {t("addNew")}
          </button>
        </div>
      </div>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => setIsCreateModalOpen(false)}>
          <article
            className="mx-auto my-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#24324a]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t("addNew")}</h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t("titleEn").replace(/\s*EN$/i, "").trim()}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isArabic ? arabicLabel : englishLabel}</span>
                    <input
                      value={isArabic ? (newSlider.title_ar ?? "") : (newSlider.title_en ?? "")}
                      onChange={(event) => setNewSlider((prev) => (isArabic ? { ...prev, title_ar: event.target.value || null } : { ...prev, title_en: event.target.value || null }))}
                      placeholder={isArabic ? t("titleAr") : t("titleEn")}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isArabic ? englishLabel : arabicLabel}</span>
                    <input
                      value={isArabic ? (newSlider.title_en ?? "") : (newSlider.title_ar ?? "")}
                      onChange={(event) => setNewSlider((prev) => (isArabic ? { ...prev, title_en: event.target.value || null } : { ...prev, title_ar: event.target.value || null }))}
                      placeholder={isArabic ? t("titleEn") : t("titleAr")}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]"
                    />
                  </label>
                </div>
              </div>
              <div className="md:col-span-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t("subtitleEn").replace(/\s*EN$/i, "").trim()}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isArabic ? arabicLabel : englishLabel}</span>
                    <input
                      value={isArabic ? (newSlider.subtitle_ar ?? "") : (newSlider.subtitle_en ?? "")}
                      onChange={(event) => setNewSlider((prev) => (isArabic ? { ...prev, subtitle_ar: event.target.value || null } : { ...prev, subtitle_en: event.target.value || null }))}
                      placeholder={isArabic ? t("subtitleAr") : t("subtitleEn")}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isArabic ? englishLabel : arabicLabel}</span>
                    <input
                      value={isArabic ? (newSlider.subtitle_en ?? "") : (newSlider.subtitle_ar ?? "")}
                      onChange={(event) => setNewSlider((prev) => (isArabic ? { ...prev, subtitle_en: event.target.value || null } : { ...prev, subtitle_ar: event.target.value || null }))}
                      placeholder={isArabic ? t("subtitleEn") : t("subtitleAr")}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]"
                    />
                  </label>
                </div>
              </div>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">{t("imageUrl")}</span>
                <input
                  id="new-slider-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setNewImageFile(event.target.files?.[0] ?? null)}
                  className="hidden"
                />
                <label
                  htmlFor="new-slider-image-input"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("changeImage")}
                </label>
                {newImageFile ? <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">{newImageFile.name}</p> : null}
              </label>
              <div className="md:col-span-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#1d2940]">
                {newImagePreview ? (
                  <img src={newImagePreview} alt="New slider preview" className="h-48 w-full object-cover" />
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400">{t("noImage")}</div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  const created = await createOne();
                  if (created) {
                    setIsCreateModalOpen(false);
                  }
                }}
                disabled={isCreating}
                className="rounded-lg bg-transparent border border-sky-400 px-4 py-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/10 disabled:opacity-60"
              >
                {isCreating ? t("creating") : t("create")}
              </button>
            </div>
          </article>
        </div>
      ) : null}

      {editingSlider ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => setEditingSlider(null)}>
          <article
            className="mx-auto my-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#24324a]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t("save")}</h2>
              <button
                type="button"
                onClick={() => setEditingSlider(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t("titleEn").replace(/\s*EN$/i, "").trim()}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isArabic ? arabicLabel : englishLabel}</span>
                    <input
                      value={isArabic ? (editingSlider.title_ar ?? "") : (editingSlider.title_en ?? "")}
                      onChange={(event) => setEditingSlider((prev) => (prev ? (isArabic ? { ...prev, title_ar: event.target.value } : { ...prev, title_en: event.target.value }) : prev))}
                      placeholder={isArabic ? t("titleAr") : t("titleEn")}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isArabic ? englishLabel : arabicLabel}</span>
                    <input
                      value={isArabic ? (editingSlider.title_en ?? "") : (editingSlider.title_ar ?? "")}
                      onChange={(event) => setEditingSlider((prev) => (prev ? (isArabic ? { ...prev, title_en: event.target.value } : { ...prev, title_ar: event.target.value }) : prev))}
                      placeholder={isArabic ? t("titleEn") : t("titleAr")}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]"
                    />
                  </label>
                </div>
              </div>
              <div className="md:col-span-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t("subtitleEn").replace(/\s*EN$/i, "").trim()}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isArabic ? arabicLabel : englishLabel}</span>
                    <input
                      value={isArabic ? (editingSlider.subtitle_ar ?? "") : (editingSlider.subtitle_en ?? "")}
                      onChange={(event) => setEditingSlider((prev) => (prev ? (isArabic ? { ...prev, subtitle_ar: event.target.value } : { ...prev, subtitle_en: event.target.value }) : prev))}
                      placeholder={isArabic ? t("subtitleAr") : t("subtitleEn")}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isArabic ? englishLabel : arabicLabel}</span>
                    <input
                      value={isArabic ? (editingSlider.subtitle_en ?? "") : (editingSlider.subtitle_ar ?? "")}
                      onChange={(event) => setEditingSlider((prev) => (prev ? (isArabic ? { ...prev, subtitle_en: event.target.value } : { ...prev, subtitle_ar: event.target.value }) : prev))}
                      placeholder={isArabic ? t("subtitleEn") : t("subtitleAr")}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]"
                    />
                  </label>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editingSlider.is_active}
                  onChange={(event) => setEditingSlider((prev) => (prev ? { ...prev, is_active: event.target.checked } : prev))}
                />
                {t("active")}
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                {t("order")}
                <input
                  type="number"
                  value={editingSlider.order}
                  onChange={(event) =>
                    setEditingSlider((prev) => (prev ? { ...prev, order: Number(event.target.value) || 0 } : prev))
                  }
                  className="h-9 w-20 rounded border border-slate-300 bg-transparent px-2 dark:border-slate-700 dark:bg-[#1d2940]"
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">{t("imageUrl")}</span>
                <input
                  id="edit-slider-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setEditingImageFile(event.target.files?.[0] ?? null)}
                  className="hidden"
                />
                <label
                  htmlFor="edit-slider-image-input"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("changeImage")}
                </label>
                {editingImageFile ? <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">{editingImageFile.name}</p> : null}
              </label>
              <div className="md:col-span-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#1d2940]">
                {editingImagePreview ? (
                  <img src={editingImagePreview} alt="Slider preview" className="h-48 w-full object-cover" />
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400">{t("noImage")}</div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={async () => {
                  await saveOne(editingSlider, editingImageFile);
                  setEditingSlider(null);
                  setEditingImageFile(null);
                }}
                disabled={savingId === editingSlider.id}
                className="rounded-lg bg-transparent border border-sky-400 px-4 py-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/10 disabled:opacity-60"
              >
                {savingId === editingSlider.id ? t("saving") : t("save")}
              </button>
            </div>
          </article>
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-[#24324a]">
            <tr>
              <th className="w-[170px] px-4 py-3 whitespace-nowrap">{t("tableImage")}</th>
              <th className="px-4 py-3 whitespace-nowrap">{t("title")}</th>
              <th className="w-[100px] px-4 py-3 text-center whitespace-nowrap">{t("active")}</th>
              <th className="w-[170px] px-4 py-3 text-center whitespace-nowrap">{t("tableActions")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-200 bg-white align-top dark:border-slate-800 dark:bg-[#1d2940]/55">
                <td className="px-4 py-3">
                  <div className="w-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#1d2940]">
                    <img src={item.image} alt={item.title_en ?? item.title_ar ?? `slide-${item.id}`} className="h-24 w-full object-cover" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{isArabic ? (item.title_ar || "-") : (item.title_en || "-")}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{isArabic ? (item.subtitle_ar || "-") : (item.subtitle_en || "-")}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t("order")}: {item.order}</p>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">{item.is_active ? t("yes") : t("no")}</td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSlider(item);
                        setEditingImageFile(null);
                      }}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-400 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-700/40"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeOne(item.id)}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-red-300 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/60 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10"
                    >
                      {t("delete")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}





