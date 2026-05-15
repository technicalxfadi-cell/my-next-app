"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronDown, Pencil, Plus, X } from "lucide-react";

import {
  createAdminService,
  deleteSectionImage as deleteSectionImageByKey,
  deleteAdminService,
  getAdminServices,
  getSiteSettings,
  type AdminService,
  updateAdminService,
  uploadSectionImage,
} from "@/lib/admin-api";
import { SERVICE_ICON_OPTIONS, ServiceIcon } from "@/components/services/service-icon";

function IconDropdown({
  value,
  onChange,
  label,
}: {
  value: string | null;
  onChange: (next: string) => void;
  label: string;
}) {
  const selectedIcon = value ?? SERVICE_ICON_OPTIONS[0];

  return (
    <div className="text-sm md:col-span-2">
      <span className="mb-2 block text-slate-500 dark:text-slate-400">{label}</span>
      <details className="group relative">
        <summary className="flex h-10 cursor-pointer list-none items-center justify-between rounded-lg border border-slate-300 bg-transparent px-3 text-sm dark:border-slate-700 dark:bg-[#0b1220]">
          <span className="inline-flex items-center gap-2">
            <ServiceIcon name={selectedIcon} className="h-4 w-4 text-emerald-500" />
            <span>{selectedIcon}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
        </summary>
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {SERVICE_ICON_OPTIONS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={(event) => {
                onChange(name);
                event.currentTarget.closest("details")?.removeAttribute("open");
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              <ServiceIcon name={name} className="h-4 w-4 text-emerald-500" />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}

export default function AdminServicesPage() {
  const t = useTranslations("adminServices");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const englishLabel = isArabic ? "الانجليزية" : "English";
  const arabicLabel = isArabic ? "العربية" : "Arabic";
  const params = useParams<{ locale: string; hash: string }>();

  const [items, setItems] = useState<AdminService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdminService | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newMainImageFile, setNewMainImageFile] = useState<File | null>(null);
  const [editingMainImageFile, setEditingMainImageFile] = useState<File | null>(null);
  const [sectionImage, setSectionImage] = useState("");
  const [editingSectionFile, setEditingSectionFile] = useState<File | null>(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isSectionSaving, setIsSectionSaving] = useState(false);
  const [newService, setNewService] = useState<Pick<AdminService, "title_ar" | "title_en" | "description_ar" | "description_en" | "youtube_url" | "main_image" | "icon" | "is_active" | "order">>({
    title_ar: "",
    title_en: "",
    description_ar: null,
    description_en: null,
    youtube_url: null,
    main_image: null,
    icon: SERVICE_ICON_OPTIONS[0],
    is_active: true,
    order: 0,
  });
  const [newMainImagePreview, setNewMainImagePreview] = useState<string | null>(null);
  const [editingMainImagePreview, setEditingMainImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!newMainImageFile) {
      setNewMainImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(newMainImageFile);
    setNewMainImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [newMainImageFile]);

  useEffect(() => {
    if (!editingMainImageFile) {
      setEditingMainImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(editingMainImageFile);
    setEditingMainImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [editingMainImageFile]);

  useEffect(() => {
    Promise.all([getAdminServices(), getSiteSettings()])
      .then(([services, settings]) => {
        setItems(services);
        const row = settings.find((item) => item.key === "section_services_image");
        setSectionImage(row?.value_en ?? row?.value_ar ?? "");
      })
      .catch(() => toast.error(t("loadError")))
      .finally(() => setIsLoading(false));
  }, [t]);

  async function reload() {
    const [services, settings] = await Promise.all([getAdminServices(), getSiteSettings()]);
    setItems(services);
    const row = settings.find((item) => item.key === "section_services_image");
    setSectionImage(row?.value_en ?? row?.value_ar ?? "");
  }

  async function saveSectionImage() {
    if (!editingSectionFile) return;
    setIsSectionSaving(true);
    try {
      const updated = await uploadSectionImage("section_services_image", editingSectionFile);
      setSectionImage(updated.value_en ?? updated.value_ar ?? "");
      setIsSectionModalOpen(false);
      setEditingSectionFile(null);
      toast.success("Section image updated");
    } catch {
      toast.error(t("updateError"));
    } finally {
      setIsSectionSaving(false);
    }
  }

  async function deleteSectionImage() {
    if (!window.confirm(t("confirmDelete"))) return;
    try {
      await deleteSectionImageByKey("section_services_image");
      setSectionImage("");
      toast.success(t("updated"));
    } catch {
      toast.error(t("updateError"));
    }
  }

  async function createOne() {
    if (!newService.title_ar.trim() || !newService.title_en.trim()) {
      toast.error(t("titleRequired"));
      return;
    }

    setIsCreating(true);
    try {
      await createAdminService(newService, newMainImageFile);
      toast.success(t("created"));
      setNewService({
        title_ar: "",
        title_en: "",
        description_ar: null,
        description_en: null,
        youtube_url: null,
        main_image: null,
        icon: SERVICE_ICON_OPTIONS[0],
        is_active: true,
        order: items.length + 1,
      });
      setNewMainImageFile(null);
      setIsCreateModalOpen(false);
      await reload();
    } catch {
      toast.error(t("createError"));
    } finally {
      setIsCreating(false);
    }
  }

  async function saveOne(item: AdminService, imageFile?: File | null) {
    setSavingId(item.id);
    try {
      await updateAdminService({
        id: item.id,
        title_ar: item.title_ar,
        title_en: item.title_en,
        description_ar: item.description_ar,
        description_en: item.description_en,
        youtube_url: item.youtube_url,
        main_image: item.main_image,
        icon: item.icon,
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
      await deleteAdminService(id);
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("subtitle")}</p>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-transparent border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10"
          >
            <Plus className="h-4 w-4" />
            {t("addNew")}
          </button>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Services Top Image</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsSectionModalOpen(true)} className="rounded border border-slate-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">Edit</button>
            <button type="button" onClick={deleteSectionImage} className="rounded border border-red-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-red-300">Delete</button>
          </div>
        </div>
        <div className="mt-3 w-56 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#0b1220]">
          {sectionImage ? <img src={sectionImage} alt="Services top" className="h-28 w-full object-cover" /> : <div className="flex h-28 items-center justify-center text-xs text-slate-500">{t("noImage")}</div>}
        </div>
      </div>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => setIsCreateModalOpen(false)}>
          <article
            className="mx-auto my-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
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
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</span>
                    <input
                      value={newService.title_en}
                      onChange={(event) => setNewService((prev) => ({ ...prev, title_en: event.target.value }))}
                      placeholder={t("titleEn")}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</span>
                    <input
                      value={newService.title_ar}
                      onChange={(event) => setNewService((prev) => ({ ...prev, title_ar: event.target.value }))}
                      placeholder={t("titleAr")}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]"
                    />
                  </label>
                </div>
              </div>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">{t("imageUrl")}</span>
                <input
                  id="new-service-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setNewMainImageFile(event.target.files?.[0] ?? null)}
                  className="hidden"
                />
                <label
                  htmlFor="new-service-image-input"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("changeImage")}
                </label>
                {newMainImageFile ? <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">{newMainImageFile.name}</p> : null}
                <div className="mt-3 w-64 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#0b1220]">
                  {newMainImagePreview ? (
                    <img src={newMainImagePreview} alt={t("selectedImage")} className="h-32 w-full object-cover" />
                  ) : (
                    <div className="flex h-32 items-center justify-center text-xs text-slate-500 dark:text-slate-400">{t("noImage")}</div>
                  )}
                </div>
              </label>
              <IconDropdown
                value={newService.icon}
                onChange={(next) => setNewService((prev) => ({ ...prev, icon: next }))}
                label={t("icon")}
              />
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={createOne}
                disabled={isCreating}
                className="rounded-lg bg-transparent border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10 disabled:opacity-60"
              >
                {isCreating ? t("creating") : t("create")}
              </button>
            </div>
          </article>
        </div>
      ) : null}

      {editingService ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => setEditingService(null)}>
          <article
            className="mx-auto my-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Edit Service</h2>
              <button
                type="button"
                onClick={() => setEditingService(null)}
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
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</span>
                    <input
                      value={editingService.title_en}
                      onChange={(event) => setEditingService((prev) => (prev ? { ...prev, title_en: event.target.value } : prev))}
                      placeholder={t("titleEn")}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</span>
                    <input
                      value={editingService.title_ar}
                      onChange={(event) => setEditingService((prev) => (prev ? { ...prev, title_ar: event.target.value } : prev))}
                      placeholder={t("titleAr")}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]"
                    />
                  </label>
                </div>
              </div>
              <div className="md:col-span-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t("descriptionEn").replace(/\s*EN$/i, "").trim()}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</span>
                    <textarea
                      value={editingService.description_en ?? ""}
                      onChange={(event) =>
                        setEditingService((prev) => (prev ? { ...prev, description_en: event.target.value || null } : prev))
                      }
                      placeholder={t("descriptionEn")}
                      className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#0b1220]"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</span>
                    <textarea
                      value={editingService.description_ar ?? ""}
                      onChange={(event) =>
                        setEditingService((prev) => (prev ? { ...prev, description_ar: event.target.value || null } : prev))
                      }
                      placeholder={t("descriptionAr")}
                      className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#0b1220]"
                    />
                  </label>
                </div>
              </div>
              <label>
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">{t("youtubeUrl")}</span>
                <input
                  value={editingService.youtube_url ?? ""}
                  onChange={(event) =>
                    setEditingService((prev) => (prev ? { ...prev, youtube_url: event.target.value || null } : prev))
                  }
                  placeholder={t("youtubeUrl")}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]"
                />
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                {t("order")}
                <input
                  type="number"
                  value={editingService.order}
                  onChange={(event) =>
                    setEditingService((prev) => (prev ? { ...prev, order: Number(event.target.value) || 0 } : prev))
                  }
                  className="h-9 w-20 rounded border border-slate-300 bg-transparent px-2 dark:border-slate-700 dark:bg-[#0b1220]"
                />
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editingService.is_active}
                  onChange={(event) =>
                    setEditingService((prev) => (prev ? { ...prev, is_active: event.target.checked } : prev))
                  }
                />
                {t("active")}
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">{t("imageUrl")}</span>
                <div className="mb-3 w-64 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#0b1220]">
                  {editingMainImagePreview || editingService.main_image ? (
                    <img
                      src={editingMainImagePreview || editingService.main_image || ""}
                      alt={t("currentImage")}
                      className="h-32 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center text-xs text-slate-500 dark:text-slate-400">{t("noImage")}</div>
                  )}
                </div>
                <input
                  id="edit-service-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setEditingMainImageFile(event.target.files?.[0] ?? null)}
                  className="hidden"
                />
                <label
                  htmlFor="edit-service-image-input"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("changeImage")}
                </label>
                {editingMainImageFile ? <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">{editingMainImageFile.name}</p> : null}
              </label>
              <IconDropdown
                value={editingService.icon}
                onChange={(next) => setEditingService((prev) => (prev ? { ...prev, icon: next } : prev))}
                label={t("icon")}
              />
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={async () => {
                  await saveOne(editingService, editingMainImageFile);
                  setEditingService(null);
                  setEditingMainImageFile(null);
                }}
                disabled={savingId === editingService.id}
                className="rounded-lg bg-transparent border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10 disabled:opacity-60"
              >
                {savingId === editingService.id ? t("saving") : t("save")}
              </button>
            </div>
          </article>
        </div>
      ) : null}
      {isSectionModalOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => setIsSectionModalOpen(false)}>
          <article className="mx-auto my-6 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Edit Services Top Image</h2><button type="button" onClick={() => setIsSectionModalOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700"><X className="h-4 w-4" /></button></div>
            <div className="mt-4">
              <input id="services-section-image-input" type="file" accept="image/*" onChange={(event) => setEditingSectionFile(event.target.files?.[0] ?? null)} className="hidden" />
              <label htmlFor="services-section-image-input" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><Pencil className="h-3.5 w-3.5" />{t("changeImage")}</label>
              {editingSectionFile ? <p className="mt-2 text-xs text-emerald-600">{editingSectionFile.name}</p> : null}
            </div>
            <div className="mt-4">
              <button type="button" onClick={saveSectionImage} disabled={!editingSectionFile || isSectionSaving} className="rounded-lg border border-emerald-400 bg-transparent px-4 py-2 text-sm font-semibold text-emerald-300 disabled:opacity-60">{isSectionSaving ? t("saving") : t("save")}</button>
            </div>
          </article>
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-900">
            <tr>
              <th className="w-[170px] px-4 py-3 whitespace-nowrap">{t("tableImage")}</th>
              <th className="px-4 py-3 whitespace-nowrap">{t("title")}</th>
              <th className="w-[120px] px-4 py-3 text-center whitespace-nowrap">{t("active")}</th>
              <th className="w-[130px] px-4 py-3 text-center whitespace-nowrap">{t("subServices")}</th>
              <th className="w-[170px] px-4 py-3 text-center whitespace-nowrap">{t("tableActions")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-200 bg-white align-top dark:border-slate-800 dark:bg-[#0b1220]/40">
                <td className="px-4 py-3">
                  <div className="w-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#0b1220]">
                    {item.main_image ? (
                      <img src={item.main_image} alt={item.title_en || item.title_ar} className="h-20 w-full object-cover" />
                    ) : (
                      <div className="flex h-20 items-center justify-center text-xs text-slate-500 dark:text-slate-400">{t("noImage")}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{isArabic ? item.title_ar : item.title_en}</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{isArabic ? item.title_en : item.title_ar}</p>
                  <div className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <ServiceIcon name={item.icon ?? SERVICE_ICON_OPTIONS[0]} className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{item.icon ?? "-"}</span>
                    <span>•</span>
                    <span>{t("order")}: {item.order}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">{item.is_active ? t("yes") : t("no")}</td>
                <td className="px-4 py-3 text-center whitespace-nowrap">{(item.sub_services ?? []).length}</td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingService(item);
                        setEditingMainImageFile(null);
                      }}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-400 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-700/40"
                    >
                      {t("edit")}
                    </button>
                    <Link
                      href={`/${params.locale}/admin/${params.hash}/services/${item.id}/sub-services`}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-amber-400 bg-white px-3 text-center text-sm font-semibold text-amber-600 transition hover:bg-amber-50 dark:bg-transparent dark:text-amber-300 dark:hover:bg-amber-400/10"
                    >
                      {t("subServices")}
                    </Link>
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




