"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { ChevronDown, Plus, X } from "lucide-react";

import {
  createServiceSubService,
  deleteServiceSubService,
  getAdminServices,
  type AdminQuickFact,
  type AdminService,
  type AdminSubService,
  updateServiceSubService,
} from "@/lib/admin-api";
import { SERVICE_ICON_OPTIONS, ServiceIcon } from "@/components/services/service-icon";

type SubServiceInput = Omit<AdminSubService, "id" | "service_id">;

function createDefaultQuickFacts(): AdminQuickFact[] {
  return [{ title_ar: null, title_en: null, value_ar: null, value_en: null, icon: "CircleDollarSign" }];
}

function normalizeQuickFacts(facts: AdminQuickFact[] | null | undefined): AdminQuickFact[] {
  const source = Array.isArray(facts) ? facts : [];

  const normalized = source
    .map((item) => ({
      title_ar: item?.title_ar ?? null,
      title_en: item?.title_en ?? null,
      value_ar: item?.value_ar ?? null,
      value_en: item?.value_en ?? null,
      icon: item?.icon ?? SERVICE_ICON_OPTIONS[0],
    }))
    .filter((item) => item.title_ar || item.title_en || item.value_ar || item.value_en || item.icon);

  return normalized;
}

function buildEmptySubService(): SubServiceInput {
  return {
    slug: "",
    title_ar: "",
    title_en: "",
    subtitle_ar: null,
    subtitle_en: null,
    content_ar: null,
    content_en: null,
    cover_image: null,
    youtube_url: null,
    details_ar: null,
    details_en: null,
    highlights_ar: null,
    highlights_en: null,
    cta_text_ar: null,
    cta_text_en: null,
    cta_url: null,
    quick_facts: createDefaultQuickFacts(),
    is_active: true,
    order: 0,
  };
}

function IconDropdown({
  value,
  onChange,
  label,
}: {
  value: string | null | undefined;
  onChange: (next: string) => void;
  label: string;
}) {
  const selectedIcon = value ?? SERVICE_ICON_OPTIONS[0];

  return (
    <div className="md:col-span-2 text-sm">
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

function BilingualPair({
  label,
  englishLabel,
  arabicLabel,
  englishField,
  arabicField,
}: {
  label: string;
  englishLabel: string;
  arabicLabel: string;
  englishField: ReactNode;
  arabicField: ReactNode;
}) {
  return (
    <div className="md:col-span-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</span>
          {englishField}
        </div>
        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</span>
          {arabicField}
        </div>
      </div>
    </div>
  );
}

export default function AdminSubServicesPage() {
  const params = useParams<{ locale: string; hash: string; id: string }>();
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = useTranslations("adminSubServices");
  const [service, setService] = useState<AdminService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminSubService | null>(null);
  const [createCoverImageFile, setCreateCoverImageFile] = useState<File | null>(null);
  const [editingCoverImageFile, setEditingCoverImageFile] = useState<File | null>(null);
  const [createForm, setCreateForm] = useState<SubServiceInput>(buildEmptySubService());
  const [items, setItems] = useState<AdminSubService[]>([]);
  const englishLabel = isArabic ? "الانجليزية" : "English";
  const arabicLabel = isArabic ? "العربية" : "Arabic";

  const createCoverPreview = useMemo(() => {
    if (createCoverImageFile) {
      return URL.createObjectURL(createCoverImageFile);
    }

    return createForm.cover_image ?? null;
  }, [createCoverImageFile, createForm.cover_image]);

  const editingCoverPreview = useMemo(() => {
    if (editingCoverImageFile) {
      return URL.createObjectURL(editingCoverImageFile);
    }

    return editingItem?.cover_image ?? null;
  }, [editingCoverImageFile, editingItem?.cover_image]);

  const serviceId = Number(params.id);

  const serviceTitle = useMemo(() => {
    if (!service) {
      return "";
    }

    return params.locale === "ar" ? service.title_ar : service.title_en;
  }, [service, params.locale]);

  async function loadData() {
    setIsLoading(true);
    try {
      const all = await getAdminServices();
      const selected = all.find((entry) => entry.id === serviceId) ?? null;
      setService(selected);
      setItems(selected?.sub_services ?? []);
      if (!selected) {
        toast.error(t("serviceNotFound"));
      }
    } catch {
      toast.error(t("loadError"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(serviceId)) {
      setIsLoading(false);
      return;
    }

    loadData();
  }, [serviceId]);

  useEffect(() => {
    return () => {
      if (createCoverPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(createCoverPreview);
      }
    };
  }, [createCoverPreview]);

  useEffect(() => {
    return () => {
      if (editingCoverPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(editingCoverPreview);
      }
    };
  }, [editingCoverPreview]);

  async function createOne() {
    if (!createForm.title_ar.trim() || !createForm.title_en.trim()) {
      toast.error(t("titleRequired"));
      return;
    }

    setIsCreating(true);
    try {
      await createServiceSubService(serviceId, createForm, createCoverImageFile);
      toast.success(t("created"));
      setCreateForm({ ...buildEmptySubService(), order: items.length + 1 });
      setCreateCoverImageFile(null);
      setIsCreateModalOpen(false);
      await loadData();
    } catch {
      toast.error(t("createError"));
    } finally {
      setIsCreating(false);
    }
  }

  async function saveOne(item: AdminSubService, imageFile?: File | null) {
    if (!item.title_ar.trim() || !item.title_en.trim()) {
      toast.error(t("titleRequired"));
      return;
    }

    setSavingId(item.id);
    try {
      await updateServiceSubService(serviceId, item.id, {
        slug: item.slug,
        title_ar: item.title_ar,
        title_en: item.title_en,
        subtitle_ar: item.subtitle_ar,
        subtitle_en: item.subtitle_en,
        content_ar: item.content_ar,
        content_en: item.content_en,
        cover_image: item.cover_image ?? null,
        youtube_url: item.youtube_url ?? null,
        details_ar: item.details_ar ?? null,
        details_en: item.details_en ?? null,
        highlights_ar: item.highlights_ar ?? null,
        highlights_en: item.highlights_en ?? null,
        cta_text_ar: item.cta_text_ar ?? null,
        cta_text_en: item.cta_text_en ?? null,
        cta_url: item.cta_url ?? null,
        quick_facts: normalizeQuickFacts(item.quick_facts),
        is_active: item.is_active,
        order: item.order,
      }, imageFile ?? null);
      toast.success(t("updated"));
      setEditingItem(null);
      setEditingCoverImageFile(null);
      await loadData();
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

    setDeletingId(id);
    try {
      await deleteServiceSubService(serviceId, id);
      toast.success(t("deleted"));
      await loadData();
    } catch {
      toast.error(t("deleteError"));
    } finally {
      setDeletingId(null);
    }
  }

  if (!Number.isFinite(serviceId)) {
    return <div className="text-sm text-red-600 dark:text-red-400">{t("invalidService")}</div>;
  }

  if (isLoading) {
    return <div className="text-slate-600 dark:text-slate-300">{t("loading")}</div>;
  }

  return (
    <section>
      <Link
        href={`/${params.locale}/admin/${params.hash}/services`}
        className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
      >
        ← {t("back")}
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        {service ? <p className="mt-2 text-slate-600 dark:text-slate-300">{t("forService", { title: serviceTitle })}</p> : null}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              setCreateCoverImageFile(null);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-transparent border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10"
          >
            <Plus className="h-4 w-4" />
            {t("addNew")}
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-900">
            <tr>
              <th className="w-[170px] px-4 py-3 whitespace-nowrap">{t("tableImage")}</th>
              <th className="px-4 py-3 whitespace-nowrap">{t("title")}</th>
              <th className="w-[180px] px-4 py-3 whitespace-nowrap">{t("slug")}</th>
              <th className="w-[95px] px-4 py-3 text-center whitespace-nowrap">{t("active")}</th>
              <th className="w-[170px] px-4 py-3 text-center whitespace-nowrap">{t("tableActions")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-200 bg-white align-top dark:border-slate-800 dark:bg-[#0b1220]/40">
                <td className="px-4 py-3">
                  <div className="w-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#0b1220]">
                    {item.cover_image ? (
                      <img src={item.cover_image} alt={item.title_en || item.title_ar} className="h-20 w-full object-cover" />
                    ) : (
                      <div className="flex h-20 items-center justify-center text-xs text-slate-500 dark:text-slate-400">{t("noImage")}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{isArabic ? item.title_ar : item.title_en}</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{isArabic ? item.title_en : item.title_ar}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t("order")}: {item.order}</p>
                </td>
                <td className="px-4 py-3"><p className="max-w-[160px] truncate" title={item.slug}>{item.slug}</p></td>
                <td className="px-4 py-3 text-center whitespace-nowrap">{item.is_active ? t("yes") : t("no")}</td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCoverImageFile(null);
                        setEditingItem({
                          ...item,
                          quick_facts: normalizeQuickFacts(item.quick_facts),
                        });
                      }}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-400 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-700/40"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeOne(item.id)}
                      disabled={deletingId === item.id}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-red-300 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-500/60 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10"
                    >
                      {deletingId === item.id ? t("deleting") : t("delete")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => {
          setCreateCoverImageFile(null);
          setIsCreateModalOpen(false);
        }}>
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
              <BilingualPair
                label={t("titleEn").replace(/\s*EN$/i, "").trim()}
                englishLabel={englishLabel}
                arabicLabel={arabicLabel}
                englishField={<input value={createForm.title_en} onChange={(e) => setCreateForm((p) => ({ ...p, title_en: e.target.value }))} placeholder={t("titleEn")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
                arabicField={<input value={createForm.title_ar} onChange={(e) => setCreateForm((p) => ({ ...p, title_ar: e.target.value }))} placeholder={t("titleAr")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
              />
              <BilingualPair
                label={t("subtitleEn").replace(/\s*EN$/i, "").trim()}
                englishLabel={englishLabel}
                arabicLabel={arabicLabel}
                englishField={<input value={createForm.subtitle_en ?? ""} onChange={(e) => setCreateForm((p) => ({ ...p, subtitle_en: e.target.value || null }))} placeholder={t("subtitleEn")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
                arabicField={<input value={createForm.subtitle_ar ?? ""} onChange={(e) => setCreateForm((p) => ({ ...p, subtitle_ar: e.target.value || null }))} placeholder={t("subtitleAr")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
              />
              <label>
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">{t("slug")}</span>
                <input value={createForm.slug} onChange={(e) => setCreateForm((p) => ({ ...p, slug: e.target.value }))} placeholder={t("slug")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">{t("youtubeUrl")}</span>
                <input value={createForm.youtube_url ?? ""} onChange={(e) => setCreateForm((p) => ({ ...p, youtube_url: e.target.value || null }))} placeholder={t("youtubeUrl")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />
              </label>
              <div className="md:col-span-2">
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">{t("coverImage")}</span>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-[#0b1220]">
                  {createCoverPreview ? (
                    <img src={createCoverPreview} alt={createForm.title_en || createForm.title_ar || "Sub-service cover"} className="h-44 w-full object-cover" />
                  ) : (
                    <div className="flex h-44 items-center justify-center text-sm text-slate-500 dark:text-slate-400">{t("noImage")}</div>
                  )}
                </div>
                <input
                  id="create-sub-service-cover"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCreateCoverImageFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
                <label
                  htmlFor="create-sub-service-cover"
                  className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  {t("changeImage")}
                </label>
              </div>
              <BilingualPair
                label={t("contentEn").replace(/\s*EN$/i, "").trim()}
                englishLabel={englishLabel}
                arabicLabel={arabicLabel}
                englishField={<textarea value={createForm.content_en ?? ""} onChange={(e) => setCreateForm((p) => ({ ...p, content_en: e.target.value || null }))} placeholder={t("contentEn")} className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
                arabicField={<textarea value={createForm.content_ar ?? ""} onChange={(e) => setCreateForm((p) => ({ ...p, content_ar: e.target.value || null }))} placeholder={t("contentAr")} className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
              />
              <BilingualPair
                label={t("detailsEn").replace(/\s*EN$/i, "").trim()}
                englishLabel={englishLabel}
                arabicLabel={arabicLabel}
                englishField={<textarea value={createForm.details_en ?? ""} onChange={(e) => setCreateForm((p) => ({ ...p, details_en: e.target.value || null }))} placeholder={t("detailsEn")} className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
                arabicField={<textarea value={createForm.details_ar ?? ""} onChange={(e) => setCreateForm((p) => ({ ...p, details_ar: e.target.value || null }))} placeholder={t("detailsAr")} className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
              />
              <div className="md:col-span-2 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-[#0b1220]/40">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t("quickFactsSection")}</p>
                {(createForm.quick_facts ?? []).map((fact, index) => (
                  <div key={`create-fact-${index}`} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-[#0b1220]">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("quickFactItem")}</p>
                      <button
                        type="button"
                        onClick={() => setCreateForm((prev) => {
                          const next = (prev.quick_facts ?? []).filter((_, i) => i !== index);
                          return {
                            ...prev,
                            quick_facts: next,
                          };
                        })}
                        className="rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/60 dark:text-red-300 dark:hover:bg-red-500/10"
                      >
                        {t("removeQuickFact")}
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">{t("quickFactTitleEn")}</span>
                        <input
                          value={fact.title_en ?? ""}
                          onChange={(e) => setCreateForm((prev) => ({
                            ...prev,
                            quick_facts: (prev.quick_facts ?? []).map((entry, i) => (i === index ? { ...entry, title_en: e.target.value || null } : entry)),
                          }))}
                          placeholder={t("quickFactTitleEn")}
                          className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]"
                        />
                      </div>
                      <div>
                        <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">{t("quickFactTitleAr")}</span>
                        <input
                          value={fact.title_ar ?? ""}
                          onChange={(e) => setCreateForm((prev) => ({
                            ...prev,
                            quick_facts: (prev.quick_facts ?? []).map((entry, i) => (i === index ? { ...entry, title_ar: e.target.value || null } : entry)),
                          }))}
                          placeholder={t("quickFactTitleAr")}
                          className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]"
                        />
                      </div>
                      <div>
                        <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">{t("quickFactValueEn")}</span>
                        <input
                          value={fact.value_en ?? ""}
                          onChange={(e) => setCreateForm((prev) => ({
                            ...prev,
                            quick_facts: (prev.quick_facts ?? []).map((entry, i) => (i === index ? { ...entry, value_en: e.target.value || null } : entry)),
                          }))}
                          placeholder={t("quickFactValueEn")}
                          className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]"
                        />
                      </div>
                      <div>
                        <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">{t("quickFactValueAr")}</span>
                        <input
                          value={fact.value_ar ?? ""}
                          onChange={(e) => setCreateForm((prev) => ({
                            ...prev,
                            quick_facts: (prev.quick_facts ?? []).map((entry, i) => (i === index ? { ...entry, value_ar: e.target.value || null } : entry)),
                          }))}
                          placeholder={t("quickFactValueAr")}
                          className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]"
                        />
                      </div>
                      <IconDropdown
                        value={fact.icon}
                        onChange={(next) => setCreateForm((prev) => ({
                          ...prev,
                          quick_facts: (prev.quick_facts ?? []).map((entry, i) => (i === index ? { ...entry, icon: next } : entry)),
                        }))}
                        label={t("quickFactIcon")}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setCreateForm((prev) => ({
                    ...prev,
                    quick_facts: [
                      ...(prev.quick_facts ?? []),
                      { title_ar: null, title_en: null, value_ar: null, value_en: null, icon: SERVICE_ICON_OPTIONS[0] },
                    ],
                  }))}
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-400 bg-transparent px-3 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("addQuickFact")}
                </button>
              </div>
              <BilingualPair
                label={t("highlightsEn").replace(/\s*EN.*$/i, "").trim()}
                englishLabel={englishLabel}
                arabicLabel={arabicLabel}
                englishField={<textarea value={createForm.highlights_en ?? ""} onChange={(e) => setCreateForm((p) => ({ ...p, highlights_en: e.target.value || null }))} placeholder={t("highlightsEn")} className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
                arabicField={<textarea value={createForm.highlights_ar ?? ""} onChange={(e) => setCreateForm((p) => ({ ...p, highlights_ar: e.target.value || null }))} placeholder={t("highlightsAr")} className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
              />
              <BilingualPair
                label={t("ctaTextEn").replace(/\s*EN$/i, "").trim()}
                englishLabel={englishLabel}
                arabicLabel={arabicLabel}
                englishField={<input value={createForm.cta_text_en ?? ""} onChange={(e) => setCreateForm((p) => ({ ...p, cta_text_en: e.target.value || null }))} placeholder={t("ctaTextEn")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
                arabicField={<input value={createForm.cta_text_ar ?? ""} onChange={(e) => setCreateForm((p) => ({ ...p, cta_text_ar: e.target.value || null }))} placeholder={t("ctaTextAr")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
              />
              <input value={createForm.cta_url ?? ""} onChange={(e) => setCreateForm((p) => ({ ...p, cta_url: e.target.value || null }))} placeholder={t("ctaUrl")} className="h-10 rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220] md:col-span-2" />
              <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 md:col-span-2"><input type="checkbox" checked={createForm.is_active} onChange={(e) => setCreateForm((p) => ({ ...p, is_active: e.target.checked }))} />{t("active")}</label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 md:col-span-2">
                {t("order")}
                <input type="number" value={createForm.order} onChange={(e) => setCreateForm((p) => ({ ...p, order: Number(e.target.value) || 0 }))} className="h-9 w-20 rounded border border-slate-300 bg-transparent px-2 dark:border-slate-700 dark:bg-[#0b1220]" />
              </label>
            </div>
            <div className="mt-4">
              <button type="button" onClick={createOne} disabled={isCreating} className="rounded-lg bg-transparent border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10 disabled:opacity-60">
                {isCreating ? t("creating") : t("create")}
              </button>
            </div>
          </article>
        </div>
      ) : null}

      {editingItem ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => {
          setEditingCoverImageFile(null);
          setEditingItem(null);
        }}>
          <article
            className="mx-auto my-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Edit Sub-service</h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <BilingualPair
                label={t("titleEn").replace(/\s*EN$/i, "").trim()}
                englishLabel={englishLabel}
                arabicLabel={arabicLabel}
                englishField={<input value={editingItem.title_en} onChange={(e) => setEditingItem((p) => (p ? { ...p, title_en: e.target.value } : p))} placeholder={t("titleEn")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
                arabicField={<input value={editingItem.title_ar} onChange={(e) => setEditingItem((p) => (p ? { ...p, title_ar: e.target.value } : p))} placeholder={t("titleAr")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
              />
              <BilingualPair
                label={t("subtitleEn").replace(/\s*EN$/i, "").trim()}
                englishLabel={englishLabel}
                arabicLabel={arabicLabel}
                englishField={<input value={editingItem.subtitle_en ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, subtitle_en: e.target.value || null } : p))} placeholder={t("subtitleEn")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
                arabicField={<input value={editingItem.subtitle_ar ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, subtitle_ar: e.target.value || null } : p))} placeholder={t("subtitleAr")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
              />
              <label>
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">{t("slug")}</span>
                <input value={editingItem.slug} onChange={(e) => setEditingItem((p) => (p ? { ...p, slug: e.target.value } : p))} placeholder={t("slug")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">{t("youtubeUrl")}</span>
                <input value={editingItem.youtube_url ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, youtube_url: e.target.value || null } : p))} placeholder={t("youtubeUrl")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />
              </label>
              <div className="md:col-span-2">
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">{t("coverImage")}</span>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-[#0b1220]">
                  {editingCoverPreview ? (
                    <img src={editingCoverPreview} alt={editingItem.title_en || editingItem.title_ar || "Sub-service cover"} className="h-44 w-full object-cover" />
                  ) : (
                    <div className="flex h-44 items-center justify-center text-sm text-slate-500 dark:text-slate-400">{t("noImage")}</div>
                  )}
                </div>
                <input
                  id="edit-sub-service-cover"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditingCoverImageFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
                <label
                  htmlFor="edit-sub-service-cover"
                  className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  {t("changeImage")}
                </label>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 md:col-span-2"><input type="checkbox" checked={editingItem.is_active} onChange={(e) => setEditingItem((p) => (p ? { ...p, is_active: e.target.checked } : p))} />{t("active")}</label>
              <BilingualPair
                label={t("contentEn").replace(/\s*EN$/i, "").trim()}
                englishLabel={englishLabel}
                arabicLabel={arabicLabel}
                englishField={<textarea value={editingItem.content_en ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, content_en: e.target.value || null } : p))} placeholder={t("contentEn")} className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
                arabicField={<textarea value={editingItem.content_ar ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, content_ar: e.target.value || null } : p))} placeholder={t("contentAr")} className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
              />
              <BilingualPair
                label={t("detailsEn").replace(/\s*EN$/i, "").trim()}
                englishLabel={englishLabel}
                arabicLabel={arabicLabel}
                englishField={<textarea value={editingItem.details_en ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, details_en: e.target.value || null } : p))} placeholder={t("detailsEn")} className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
                arabicField={<textarea value={editingItem.details_ar ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, details_ar: e.target.value || null } : p))} placeholder={t("detailsAr")} className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
              />
              <div className="md:col-span-2 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-[#0b1220]/40">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t("quickFactsSection")}</p>
                {(editingItem.quick_facts ?? []).map((fact, index) => (
                  <div key={`edit-fact-${index}`} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-[#0b1220]">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("quickFactItem")}</p>
                      <button
                        type="button"
                        onClick={() => setEditingItem((prev) => {
                          if (!prev) {
                            return prev;
                          }

                          const next = (prev.quick_facts ?? []).filter((_, i) => i !== index);
                          return {
                            ...prev,
                            quick_facts: next,
                          };
                        })}
                        className="rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/60 dark:text-red-300 dark:hover:bg-red-500/10"
                      >
                        {t("removeQuickFact")}
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">{t("quickFactTitleEn")}</span>
                        <input
                          value={fact.title_en ?? ""}
                          onChange={(e) => setEditingItem((prev) => (prev ? {
                            ...prev,
                            quick_facts: (prev.quick_facts ?? []).map((entry, i) => (i === index ? { ...entry, title_en: e.target.value || null } : entry)),
                          } : prev))}
                          placeholder={t("quickFactTitleEn")}
                          className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]"
                        />
                      </div>
                      <div>
                        <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">{t("quickFactTitleAr")}</span>
                        <input
                          value={fact.title_ar ?? ""}
                          onChange={(e) => setEditingItem((prev) => (prev ? {
                            ...prev,
                            quick_facts: (prev.quick_facts ?? []).map((entry, i) => (i === index ? { ...entry, title_ar: e.target.value || null } : entry)),
                          } : prev))}
                          placeholder={t("quickFactTitleAr")}
                          className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]"
                        />
                      </div>
                      <div>
                        <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">{t("quickFactValueEn")}</span>
                        <input
                          value={fact.value_en ?? ""}
                          onChange={(e) => setEditingItem((prev) => (prev ? {
                            ...prev,
                            quick_facts: (prev.quick_facts ?? []).map((entry, i) => (i === index ? { ...entry, value_en: e.target.value || null } : entry)),
                          } : prev))}
                          placeholder={t("quickFactValueEn")}
                          className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]"
                        />
                      </div>
                      <div>
                        <span className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">{t("quickFactValueAr")}</span>
                        <input
                          value={fact.value_ar ?? ""}
                          onChange={(e) => setEditingItem((prev) => (prev ? {
                            ...prev,
                            quick_facts: (prev.quick_facts ?? []).map((entry, i) => (i === index ? { ...entry, value_ar: e.target.value || null } : entry)),
                          } : prev))}
                          placeholder={t("quickFactValueAr")}
                          className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]"
                        />
                      </div>
                      <IconDropdown
                        value={fact.icon}
                        onChange={(next) => setEditingItem((prev) => (prev ? {
                          ...prev,
                          quick_facts: (prev.quick_facts ?? []).map((entry, i) => (i === index ? { ...entry, icon: next } : entry)),
                        } : prev))}
                        label={t("quickFactIcon")}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setEditingItem((prev) => {
                    if (!prev) {
                      return prev;
                    }

                    return {
                      ...prev,
                      quick_facts: [
                        ...(prev.quick_facts ?? []),
                        { title_ar: null, title_en: null, value_ar: null, value_en: null, icon: SERVICE_ICON_OPTIONS[0] },
                      ],
                    };
                  })}
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-400 bg-transparent px-3 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("addQuickFact")}
                </button>
              </div>
              <BilingualPair
                label={t("highlightsEn").replace(/\s*EN.*$/i, "").trim()}
                englishLabel={englishLabel}
                arabicLabel={arabicLabel}
                englishField={<textarea value={editingItem.highlights_en ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, highlights_en: e.target.value || null } : p))} placeholder={t("highlightsEn")} className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
                arabicField={<textarea value={editingItem.highlights_ar ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, highlights_ar: e.target.value || null } : p))} placeholder={t("highlightsAr")} className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
              />
              <BilingualPair
                label={t("ctaTextEn").replace(/\s*EN$/i, "").trim()}
                englishLabel={englishLabel}
                arabicLabel={arabicLabel}
                englishField={<input value={editingItem.cta_text_en ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, cta_text_en: e.target.value || null } : p))} placeholder={t("ctaTextEn")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
                arabicField={<input value={editingItem.cta_text_ar ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, cta_text_ar: e.target.value || null } : p))} placeholder={t("ctaTextAr")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />}
              />
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">{t("ctaUrl")}</span>
                <input value={editingItem.cta_url ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, cta_url: e.target.value || null } : p))} placeholder={t("ctaUrl")} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#0b1220]" />
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                {t("order")}
                <input type="number" value={editingItem.order} onChange={(e) => setEditingItem((p) => (p ? { ...p, order: Number(e.target.value) || 0 } : p))} className="h-9 w-20 rounded border border-slate-300 bg-transparent px-2 dark:border-slate-700 dark:bg-[#0b1220]" />
              </label>
            </div>
            <div className="mt-4">
              <button type="button" onClick={() => saveOne(editingItem, editingCoverImageFile)} disabled={savingId === editingItem.id} className="rounded-lg bg-transparent border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10 disabled:opacity-60">
                {savingId === editingItem.id ? t("saving") : t("save")}
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}



