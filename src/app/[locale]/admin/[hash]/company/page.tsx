"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Pencil, Plus, X } from "lucide-react";

import {
  createAddress,
  createEmail,
  createPhone,
  deleteSectionImage,
  deleteAddress,
  deleteEmail,
  deletePhone,
  getCompanyBundle,
  getSiteSettings,
  type CompanyAddress,
  type CompanyEmail,
  type CompanyPhone,
  type SiteSetting,
  updateAddress,
  updateCompany,
  updateEmail,
  updatePhone,
  uploadSectionImage,
} from "@/lib/admin-api";

type CompanyForm = {
  name_ar: string;
  name_en: string;
  logo: string | null;
  description_ar: string | null;
  description_en: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
};

type EntityType = "phone" | "email" | "address";
type CompanyTab = "basic" | "phones" | "emails" | "addresses";

export default function CompanyAdminPage() {
  const t = useTranslations("adminCompany");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const englishLabel = isArabic ? "الانجليزية" : "English";
  const arabicLabel = isArabic ? "العربية" : "Arabic";

  const [company, setCompany] = useState<CompanyForm>({
    name_ar: "",
    name_en: "",
    logo: null,
    description_ar: null,
    description_en: null,
    gps_lat: null,
    gps_lng: null,
  });
  const [phones, setPhones] = useState<CompanyPhone[]>([]);
  const [emails, setEmails] = useState<CompanyEmail[]>([]);
  const [addresses, setAddresses] = useState<CompanyAddress[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([]);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [editingCompany, setEditingCompany] = useState<CompanyForm | null>(null);
  const [editingItem, setEditingItem] = useState<{ type: EntityType; item: CompanyPhone | CompanyEmail | CompanyAddress } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<false | EntityType>(false);
  const [isCreatingEntity, setIsCreatingEntity] = useState(false);
  const [newPhone, setNewPhone] = useState<Omit<CompanyPhone, "id">>({
    number: "",
    label_ar: null,
    label_en: null,
    is_active: true,
    order: 1,
  });
  const [newEmail, setNewEmail] = useState<Omit<CompanyEmail, "id">>({
    email: "",
    label_ar: null,
    label_en: null,
    is_active: true,
    order: 1,
  });
  const [newAddress, setNewAddress] = useState<Omit<CompanyAddress, "id">>({
    address_ar: "",
    address_en: "",
    label_ar: null,
    label_en: null,
    is_active: true,
    order: 1,
  });
  const [activeTab, setActiveTab] = useState<CompanyTab>("basic");
  const [editingAboutImageFile, setEditingAboutImageFile] = useState<File | null>(null);
  const [isAboutImageModalOpen, setIsAboutImageModalOpen] = useState(false);
  const [isAboutImageSaving, setIsAboutImageSaving] = useState(false);

  const sortedPhones = useMemo(() => [...phones].sort((a, b) => a.order - b.order), [phones]);
  const sortedEmails = useMemo(() => [...emails].sort((a, b) => a.order - b.order), [emails]);
  const sortedAddresses = useMemo(() => [...addresses].sort((a, b) => a.order - b.order), [addresses]);
  const aboutSectionImage = useMemo(() => {
    const row = siteSettings.find((item) => item.key === "section_about_image");
    return row?.value_en ?? row?.value_ar ?? "";
  }, [siteSettings]);

  async function loadData() {
    try {
      const [data, settings] = await Promise.all([getCompanyBundle(), getSiteSettings()]);
      if (data.company) {
        setCompany({
          name_ar: data.company.name_ar,
          name_en: data.company.name_en,
          logo: data.company.logo,
          description_ar: data.company.description_ar,
          description_en: data.company.description_en,
          gps_lat: data.company.gps_lat,
          gps_lng: data.company.gps_lng,
        });
      }
      setPhones(data.phones);
      setEmails(data.emails);
      setAddresses(data.addresses);
      setSiteSettings(settings);
    } catch {
      toast.error(t("loadError"));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveCompany() {
    if (!editingCompany) return;
    setIsSavingCompany(true);
    try {
      await updateCompany(editingCompany, logoFile);
      toast.success(t("companySaved"));
      setEditingCompany(null);
      setLogoFile(null);
      await loadData();
    } catch {
      toast.error(t("companySaveError"));
    } finally {
      setIsSavingCompany(false);
    }
  }

  async function deleteRow(type: EntityType, id: number) {
    if (!window.confirm(t("confirmDelete"))) return;
    try {
      if (type === "phone") await deletePhone(id);
      if (type === "email") await deleteEmail(id);
      if (type === "address") await deleteAddress(id);
      toast.success(t("delete"));
      await loadData();
    } catch {
      toast.error(t("loadError"));
    }
  }

  async function saveEditedRow() {
    if (!editingItem) return;
    try {
      if (editingItem.type === "phone") await updatePhone((editingItem.item as CompanyPhone).id, editingItem.item as CompanyPhone);
      if (editingItem.type === "email") await updateEmail((editingItem.item as CompanyEmail).id, editingItem.item as CompanyEmail);
      if (editingItem.type === "address") await updateAddress((editingItem.item as CompanyAddress).id, editingItem.item as CompanyAddress);
      setEditingItem(null);
      toast.success(t("save"));
      await loadData();
    } catch {
      toast.error(t("loadError"));
    }
  }

  async function createRow(type: EntityType) {
    setIsCreatingEntity(true);
    try {
      if (type === "phone") {
        if (!newPhone.number.trim()) {
          toast.error(isArabic ? "رقم الهاتف مطلوب" : "Phone number is required");
          return;
        }
        await createPhone({
          number: newPhone.number.trim(),
          label_ar: newPhone.label_ar?.trim() || null,
          label_en: newPhone.label_en?.trim() || null,
          is_active: newPhone.is_active,
          order: newPhone.order,
        });
      }
      if (type === "email") {
        if (!newEmail.email.trim()) {
          toast.error(isArabic ? "البريد الإلكتروني مطلوب" : "Email is required");
          return;
        }
        await createEmail({
          email: newEmail.email.trim(),
          label_ar: newEmail.label_ar?.trim() || null,
          label_en: newEmail.label_en?.trim() || null,
          is_active: newEmail.is_active,
          order: newEmail.order,
        });
      }
      if (type === "address") {
        if (!newAddress.address_ar.trim() && !newAddress.address_en.trim()) {
          toast.error(isArabic ? "أدخل عنواناً واحداً على الأقل" : "Enter at least one address");
          return;
        }
        await createAddress({
          address_ar: newAddress.address_ar.trim(),
          address_en: newAddress.address_en.trim(),
          label_ar: newAddress.label_ar?.trim() || null,
          label_en: newAddress.label_en?.trim() || null,
          is_active: newAddress.is_active,
          order: newAddress.order,
        });
      }
      setIsAddModalOpen(false);
      setNewPhone({ number: "", label_ar: null, label_en: null, is_active: true, order: phones.length + 1 });
      setNewEmail({ email: "", label_ar: null, label_en: null, is_active: true, order: emails.length + 1 });
      setNewAddress({ address_ar: "", address_en: "", label_ar: null, label_en: null, is_active: true, order: addresses.length + 1 });
      await loadData();
      toast.success(t("add"));
    } catch {
      toast.error(t("loadError"));
    } finally {
      setIsCreatingEntity(false);
    }
  }

  async function saveAboutImage() {
    if (!editingAboutImageFile) return;
    setIsAboutImageSaving(true);
    try {
      await uploadSectionImage("section_about_image", editingAboutImageFile);
      setIsAboutImageModalOpen(false);
      setEditingAboutImageFile(null);
      await loadData();
      toast.success(t("save"));
    } catch {
      toast.error(t("loadError"));
    } finally {
      setIsAboutImageSaving(false);
    }
  }

  async function deleteAboutImage() {
    if (!window.confirm(t("confirmDelete"))) return;
    try {
      await deleteSectionImage("section_about_image");
      await loadData();
      toast.success(t("delete"));
    } catch {
      toast.error(t("loadError"));
    }
  }

  const companyTabs: { key: CompanyTab; label: string }[] = [
    { key: "basic", label: t("basicInfo") },
    { key: "phones", label: t("phonesTitle") },
    { key: "emails", label: t("emailsTitle") },
    { key: "addresses", label: t("addressesTitle") },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#24324a]/70">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t("subtitle")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {companyTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === tab.key
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-300"
                  : "border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200 dark:hover:text-emerald-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "basic" ? (
      <article id="company-basic-info" className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#24324a]/70">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t("basicInfo")}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{isArabic ? (company.name_ar || "-") : (company.name_en || "-")}</p>
          </div>
          <button
            type="button"
            onClick={() => setEditingCompany(company)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-400/10 dark:text-slate-200"
          >
            <Pencil className="h-3.5 w-3.5" />
            {isArabic ? "تعديل" : "Edit"}
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-8">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#1d2940]/60">
              <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{isArabic ? "اسم الشركة" : "Company Name"}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-100">{company.name_en || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-100">{company.name_ar || "-"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#1d2940]/60">
              <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{isArabic ? "وصف الشركة" : "Company Description"}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</p>
                  <p className="mt-1 text-base leading-7 text-slate-800 dark:text-slate-100">{company.description_en || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</p>
                  <p className="mt-1 text-base leading-7 text-slate-800 dark:text-slate-100">{company.description_ar || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="h-full rounded-xl border border-slate-200 bg-gradient-to-b from-slate-100 to-white p-3 dark:border-slate-800 dark:from-[#2b3a57] dark:to-[#1d2940]">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("logoUrl")}</p>
              <div className="mt-3 flex min-h-[220px] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-[#101a2f]">
                {company.logo ? (
                  <img src={company.logo} alt={company.name_en} className="max-h-48 w-full object-contain drop-shadow-[0_8px_24px_rgba(15,23,42,0.22)]" />
                ) : (
                  <div className="text-center text-xs text-slate-500 dark:text-slate-400">{t("logoUrl")}</div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-12 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{isArabic ? "صورة أعلى صفحة من نحن" : "About Top Image"}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsAboutImageModalOpen(true)} className="rounded border border-slate-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">{isArabic ? "تعديل" : "Edit"}</button>
                <button type="button" onClick={deleteAboutImage} className="rounded border border-red-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-red-300">{t("delete")}</button>
              </div>
            </div>
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#1d2940]">
              {aboutSectionImage ? (
                <img src={aboutSectionImage} alt="About top" className="h-44 w-full object-cover md:h-52" />
              ) : (
                <div className="flex h-44 items-center justify-center text-xs text-slate-500 md:h-52">{t("logoUrl")}</div>
              )}
            </div>
          </div>
        </div>
      </article>
      ) : null}

      {activeTab === "phones" ? (
      <SimpleTable
        sectionId="company-phones"
        title={t("phonesTitle")}
        addLabel={t("add")}
        headers={["Value", isArabic ? "Label AR" : "Label EN", t("active"), t("order"), "Actions"]}
        rows={sortedPhones.map((item) => [item.number, isArabic ? (item.label_ar || "-") : (item.label_en || "-"), item.is_active ? "Yes" : "No", String(item.order), item.id])}
        onAdd={() => {
          setNewPhone({ number: "", label_ar: null, label_en: null, is_active: true, order: phones.length + 1 });
          setIsAddModalOpen("phone");
        }}
        onEdit={(id) => {
          const found = sortedPhones.find((p) => p.id === id);
          if (found) setEditingItem({ type: "phone", item: found });
        }}
        onDelete={(id) => deleteRow("phone", id)}
      />
      ) : null}

      {activeTab === "emails" ? (
      <SimpleTable
        sectionId="company-emails"
        title={t("emailsTitle")}
        addLabel={t("add")}
        headers={["Value", isArabic ? "Label AR" : "Label EN", t("active"), t("order"), "Actions"]}
        rows={sortedEmails.map((item) => [item.email, isArabic ? (item.label_ar || "-") : (item.label_en || "-"), item.is_active ? "Yes" : "No", String(item.order), item.id])}
        onAdd={() => {
          setNewEmail({ email: "", label_ar: null, label_en: null, is_active: true, order: emails.length + 1 });
          setIsAddModalOpen("email");
        }}
        onEdit={(id) => {
          const found = sortedEmails.find((p) => p.id === id);
          if (found) setEditingItem({ type: "email", item: found });
        }}
        onDelete={(id) => deleteRow("email", id)}
      />
      ) : null}

      {activeTab === "addresses" ? (
      <SimpleTable
        sectionId="company-addresses"
        title={t("addressesTitle")}
        addLabel={t("add")}
        headers={[isArabic ? t("addressAr") : t("addressEn"), t("active"), t("order"), "Actions"]}
        rows={sortedAddresses.map((item) => [isArabic ? item.address_ar : item.address_en, item.is_active ? "Yes" : "No", String(item.order), item.id])}
        onAdd={() => {
          setNewAddress({ address_ar: "", address_en: "", label_ar: null, label_en: null, is_active: true, order: addresses.length + 1 });
          setIsAddModalOpen("address");
        }}
        onEdit={(id) => {
          const found = sortedAddresses.find((p) => p.id === id);
          if (found) setEditingItem({ type: "address", item: found });
        }}
        onDelete={(id) => deleteRow("address", id)}
      />
      ) : null}

      {editingCompany ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => setEditingCompany(null)}>
          <article className="mx-auto my-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#24324a]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{t("basicInfo")}</h2><button onClick={() => setEditingCompany(null)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700"><X className="h-4 w-4" /></button></div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{isArabic ? "اسم الشركة" : "Company Name"}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</span>
                    <input className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" value={editingCompany.name_en} onChange={(e) => setEditingCompany((p) => (p ? { ...p, name_en: e.target.value } : p))} placeholder={t("nameEn")} />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</span>
                    <input className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" value={editingCompany.name_ar} onChange={(e) => setEditingCompany((p) => (p ? { ...p, name_ar: e.target.value } : p))} placeholder={t("nameAr")} />
                  </label>
                </div>
              </div>
              <div className="md:col-span-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{isArabic ? "وصف الشركة" : "Company Description"}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</span>
                    <textarea className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#1d2940]" value={editingCompany.description_en ?? ""} onChange={(e) => setEditingCompany((p) => (p ? { ...p, description_en: e.target.value || null } : p))} placeholder={t("descriptionEn")} />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</span>
                    <textarea className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#1d2940]" value={editingCompany.description_ar ?? ""} onChange={(e) => setEditingCompany((p) => (p ? { ...p, description_ar: e.target.value || null } : p))} placeholder={t("descriptionAr")} />
                  </label>
                </div>
              </div>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">{t("logoUrl")}</span>
                <input id="company-logo-input" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} className="hidden" />
                <label htmlFor="company-logo-input" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"><Pencil className="h-3.5 w-3.5" />{t("changeImage")}</label>
              </label>
            </div>
            <div className="mt-4"><button onClick={saveCompany} disabled={isSavingCompany} className="rounded-lg border border-sky-400 bg-transparent px-4 py-2 text-sm font-semibold text-sky-300 hover:bg-sky-400/10 disabled:opacity-60">{isSavingCompany ? t("saving") : t("saveCompany")}</button></div>
          </article>
        </div>
      ) : null}

      {editingItem ? (
        <EditEntityModal
          t={t}
          editingItem={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={saveEditedRow}
          setEditingItem={setEditingItem}
        />
      ) : null}

      {isAddModalOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => setIsAddModalOpen(false)}>
          <article className="mx-auto my-6 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#24324a]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{t("add")}</h2><button onClick={() => setIsAddModalOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700"><X className="h-4 w-4" /></button></div>

            {isAddModalOpen === "phone" ? (
              <div className="mt-4 grid gap-3">
                <label>
                  <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">Phone Number</span>
                  <input value={newPhone.number} onChange={(e) => setNewPhone((p) => ({ ...p, number: e.target.value }))} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</span>
                    <input value={newPhone.label_en ?? ""} onChange={(e) => setNewPhone((p) => ({ ...p, label_en: e.target.value || null }))} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</span>
                    <input value={newPhone.label_ar ?? ""} onChange={(e) => setNewPhone((p) => ({ ...p, label_ar: e.target.value || null }))} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" />
                  </label>
                </div>
              </div>
            ) : null}

            {isAddModalOpen === "email" ? (
              <div className="mt-4 grid gap-3">
                <label>
                  <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">Email</span>
                  <input type="email" value={newEmail.email} onChange={(e) => setNewEmail((p) => ({ ...p, email: e.target.value }))} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</span>
                    <input value={newEmail.label_en ?? ""} onChange={(e) => setNewEmail((p) => ({ ...p, label_en: e.target.value || null }))} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</span>
                    <input value={newEmail.label_ar ?? ""} onChange={(e) => setNewEmail((p) => ({ ...p, label_ar: e.target.value || null }))} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" />
                  </label>
                </div>
              </div>
            ) : null}

            {isAddModalOpen === "address" ? (
              <div className="mt-4 grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</span>
                    <textarea value={newAddress.address_en} onChange={(e) => setNewAddress((p) => ({ ...p, address_en: e.target.value }))} className="min-h-20 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#1d2940]" />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</span>
                    <textarea value={newAddress.address_ar} onChange={(e) => setNewAddress((p) => ({ ...p, address_ar: e.target.value }))} className="min-h-20 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#1d2940]" />
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel} Label</span>
                    <input value={newAddress.label_en ?? ""} onChange={(e) => setNewAddress((p) => ({ ...p, label_en: e.target.value || null }))} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel} Label</span>
                    <input value={newAddress.label_ar ?? ""} onChange={(e) => setNewAddress((p) => ({ ...p, label_ar: e.target.value || null }))} className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" />
                  </label>
                </div>
              </div>
            ) : null}

            <div className="mt-4"><button disabled={isCreatingEntity} onClick={() => createRow(isAddModalOpen)} className="rounded-lg border border-sky-400 bg-transparent px-4 py-2 text-sm font-semibold text-sky-300 hover:bg-sky-400/10 disabled:opacity-60">{isCreatingEntity ? t("saving") : t("add")}</button></div>
          </article>
        </div>
      ) : null}
      {isAboutImageModalOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => setIsAboutImageModalOpen(false)}>
          <article className="mx-auto my-6 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#24324a]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Edit About Top Image</h2><button onClick={() => setIsAboutImageModalOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700"><X className="h-4 w-4" /></button></div>
            <div className="mt-4">
              <input id="about-section-image-input" type="file" accept="image/*" onChange={(e) => setEditingAboutImageFile(e.target.files?.[0] ?? null)} className="hidden" />
              <label htmlFor="about-section-image-input" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><Pencil className="h-3.5 w-3.5" />{t("changeImage")}</label>
              {editingAboutImageFile ? <p className="mt-2 text-xs text-emerald-600">{editingAboutImageFile.name}</p> : null}
            </div>
            <div className="mt-4"><button onClick={saveAboutImage} disabled={!editingAboutImageFile || isAboutImageSaving} className="rounded-lg border border-sky-400 bg-transparent px-4 py-2 text-sm font-semibold text-sky-300 disabled:opacity-60">{isAboutImageSaving ? t("saving") : t("save")}</button></div>
          </article>
        </div>
      ) : null}
    </section>
  );
}

function SimpleTable({
  sectionId,
  title,
  addLabel,
  headers,
  rows,
  onAdd,
  onEdit,
  onDelete,
}: {
  sectionId: string;
  title: string;
  addLabel: string;
  headers: string[];
  rows: (string | number)[][];
  onAdd: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <article id={sectionId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#24324a]/70">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-lg border border-sky-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-400/10"><Plus className="h-3.5 w-3.5" />{addLabel}</button>
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-slate-100 dark:bg-[#24324a]">
            <tr>{headers.map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = Number(row[row.length - 1]);
              return (
                <tr key={id} className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1d2940]/55">
                  {row.slice(0, -1).map((cell, i) => <td key={`${id}-${i}`} className="max-w-60 truncate px-4 py-3">{cell || "-"}</td>)}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <button type="button" onClick={() => onEdit(id)} className="rounded border border-slate-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-400/10 dark:text-slate-200">Edit</button>
                      <button type="button" onClick={() => onDelete(id)} className="rounded border border-red-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-400/10">Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function EditEntityModal({
  t,
  editingItem,
  onClose,
  onSave,
  setEditingItem,
}: {
  t: (key: string) => string;
  editingItem: { type: EntityType; item: CompanyPhone | CompanyEmail | CompanyAddress };
  onClose: () => void;
  onSave: () => Promise<void>;
  setEditingItem: (value: { type: EntityType; item: CompanyPhone | CompanyEmail | CompanyAddress } | null | ((prev: { type: EntityType; item: CompanyPhone | CompanyEmail | CompanyAddress } | null) => { type: EntityType; item: CompanyPhone | CompanyEmail | CompanyAddress } | null)) => void;
}) {
  const { type, item } = editingItem;
  const isAddress = type === "address";
  const isPhone = type === "phone";
  const isEmail = type === "email";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={onClose}>
      <article className="mx-auto my-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#24324a]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Edit</h2><button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700"><X className="h-4 w-4" /></button></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {isPhone ? (
            <>
              <label><span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">Number</span><input className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" value={(item as CompanyPhone).number} onChange={(e) => setEditingItem((p) => (p ? { ...p, item: { ...(p.item as CompanyPhone), number: e.target.value } } : p))} placeholder="Number" /></label>
              <label><span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">Label EN</span><input className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" value={(item as CompanyPhone).label_en ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, item: { ...(p.item as CompanyPhone), label_en: e.target.value || null } } : p))} placeholder="Label EN" /></label>
              <label><span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">Label AR</span><input className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" value={(item as CompanyPhone).label_ar ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, item: { ...(p.item as CompanyPhone), label_ar: e.target.value || null } } : p))} placeholder="Label AR" /></label>
            </>
          ) : null}
          {isEmail ? (
            <>
              <label><span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">Email</span><input className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" value={(item as CompanyEmail).email} onChange={(e) => setEditingItem((p) => (p ? { ...p, item: { ...(p.item as CompanyEmail), email: e.target.value } } : p))} placeholder="Email" /></label>
              <label><span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">Label EN</span><input className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" value={(item as CompanyEmail).label_en ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, item: { ...(p.item as CompanyEmail), label_en: e.target.value || null } } : p))} placeholder="Label EN" /></label>
              <label><span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">Label AR</span><input className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" value={(item as CompanyEmail).label_ar ?? ""} onChange={(e) => setEditingItem((p) => (p ? { ...p, item: { ...(p.item as CompanyEmail), label_ar: e.target.value || null } } : p))} placeholder="Label AR" /></label>
            </>
          ) : null}
          {isAddress ? (
            <>
              <label><span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">Address EN</span><textarea className="min-h-20 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#1d2940]" value={(item as CompanyAddress).address_en} onChange={(e) => setEditingItem((p) => (p ? { ...p, item: { ...(p.item as CompanyAddress), address_en: e.target.value } } : p))} placeholder="Address EN" /></label>
              <label><span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">Address AR</span><textarea className="min-h-20 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#1d2940]" value={(item as CompanyAddress).address_ar} onChange={(e) => setEditingItem((p) => (p ? { ...p, item: { ...(p.item as CompanyAddress), address_ar: e.target.value } } : p))} placeholder="Address AR" /></label>
            </>
          ) : null}
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={item.is_active} onChange={(e) => setEditingItem((p) => (p ? { ...p, item: { ...(p.item as any), is_active: e.target.checked } } : p))} />
            {t("active")}
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            {t("order")}
            <input type="number" className="h-9 w-20 rounded border border-slate-300 bg-transparent px-2 dark:border-slate-700 dark:bg-[#1d2940]" value={item.order} onChange={(e) => setEditingItem((p) => (p ? { ...p, item: { ...(p.item as any), order: Number(e.target.value) || 0 } } : p))} />
          </label>
        </div>
        <div className="mt-4"><button onClick={onSave} className="rounded-lg border border-sky-400 bg-transparent px-4 py-2 text-sm font-semibold text-sky-300 hover:bg-sky-400/10">{t("save")}</button></div>
      </article>
    </div>
  );
}


