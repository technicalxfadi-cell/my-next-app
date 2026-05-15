"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Link2, Pencil, Plus, Trash2, X } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { FaSnapchatGhost, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import type { IconType } from "react-icons";

import { deleteSectionImage, getSiteSettings, getSocialLinks, type SocialLink, uploadSectionImage, type SiteSetting, updateSocialLinks } from "@/lib/admin-api";

const socialIcons: Record<string, IconType> = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  youtube: FaYoutube,
  yt: FaYoutube,
  twitter: FaXTwitter,
  x: FaXTwitter,
  xtwitter: FaXTwitter,
  linkedin: FaLinkedinIn,
  tiktok: FaTiktok,
  music2: FaTiktok,
  whatsapp: FaWhatsapp,
  messagecircle: FaWhatsapp,
  snapchat: FaSnapchatGhost,
  ghost: FaSnapchatGhost,
  telegram: FaTelegramPlane,
  send: FaTelegramPlane,
};

function normalizeIconKey(value: string | undefined | null) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function SocialLinksAdminPage() {
  const t = useTranslations("adminSocialLinks");
  const [items, setItems] = useState<SocialLink[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<SocialLink | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    id: "",
    url: "",
  });
  const [contactSectionImage, setContactSectionImage] = useState("");
  const [editingSectionFile, setEditingSectionFile] = useState<File | null>(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isSectionSaving, setIsSectionSaving] = useState(false);

  useEffect(() => {
    Promise.all([getSocialLinks(), getSiteSettings()])
      .then(([socials, settings]) => {
        setItems(socials);
        const row = settings.find((item: SiteSetting) => item.key === "section_contact_image");
        setContactSectionImage(row?.value_en ?? row?.value_ar ?? "");
      })
      .catch(() => toast.error(t("loadError")));
  }, [t]);

  async function saveContactSectionImage() {
    if (!editingSectionFile) return;
    setIsSectionSaving(true);
    try {
      const updated = await uploadSectionImage("section_contact_image", editingSectionFile);
      setContactSectionImage(updated.value_en ?? updated.value_ar ?? "");
      setEditingSectionFile(null);
      setIsSectionModalOpen(false);
      toast.success(t("updated"));
    } catch {
      toast.error(t("updateError"));
    } finally {
      setIsSectionSaving(false);
    }
  }

  async function deleteContactSectionImage() {
    if (!window.confirm("Delete this image?")) return;
    try {
      await deleteSectionImage("section_contact_image");
      setContactSectionImage("");
      toast.success(t("updated"));
    } catch {
      toast.error(t("updateError"));
    }
  }

  async function saveAll() {
    setIsSaving(true);
    try {
      await updateSocialLinks(items.map((item) => ({
        id: item.id,
        url: item.url,
        is_active: item.is_active,
        order: item.order,
      })));
      toast.success(t("updated"));
    } catch {
      toast.error(t("updateError"));
    } finally {
      setIsSaving(false);
    }
  }

  function applyDelete(id: number) {
    if (!window.confirm("Delete this link?")) {
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              is_active: false,
              url: "",
            }
          : item,
      ),
    );
  }

  function openAddModal() {
    const candidate = items.find((item) => !item.is_active || !item.url);
    setAddForm({
      id: candidate ? String(candidate.id) : "",
      url: "",
    });
    setIsAddModalOpen(true);
  }

  function submitAdd() {
    const id = Number(addForm.id);
    if (!id || !addForm.url.trim()) {
      toast.error(t("updateError"));
      return;
    }

    const maxOrder = items.reduce((max, item) => Math.max(max, item.order), 0);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              url: addForm.url.trim(),
              is_active: true,
              order: item.order > 0 ? item.order : maxOrder + 1,
            }
          : item,
      ),
    );
    setIsAddModalOpen(false);
  }

  return (
    <section>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{t("subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-transparent border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10"
          >
            <Plus className="h-4 w-4" />
            Add Link
          </button>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Contact Top Image</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsSectionModalOpen(true)} className="rounded border border-slate-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">Edit</button>
            <button type="button" onClick={deleteContactSectionImage} className="rounded border border-red-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-red-300">Delete</button>
          </div>
        </div>
        <div className="mt-3 w-56 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#0b1220]">
          {contactSectionImage ? <img src={contactSectionImage} alt="Contact top" className="h-28 w-full object-cover" /> : <div className="flex h-28 items-center justify-center text-xs text-slate-500">No image</div>}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Icon</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3">{t("active")}</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0b1220]/40">
                <td className="px-4 py-3 font-semibold">{item.platform}</td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-2">
                    {(() => {
                      const iconByName = socialIcons[normalizeIconKey(item.lucide_icon)];
                      const iconByPlatform = socialIcons[normalizeIconKey(item.platform)];
                      const Icon = iconByName ?? iconByPlatform;
                      return Icon ? <Icon className="h-4 w-4 text-emerald-500" /> : <Link2 className="h-4 w-4 text-slate-400" />;
                    })()}
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.lucide_icon || "-"}</span>
                  </div>
                </td>
                <td className="max-w-[240px] truncate px-4 py-3">{item.url || "-"}</td>
                <td className="px-4 py-3">{item.is_active ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{item.order}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="inline-flex items-center gap-1 rounded border border-slate-400 bg-transparent px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDelete(item.id)}
                      className="inline-flex items-center gap-1 rounded border border-red-400 bg-transparent px-2.5 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-400/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingItem ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => setEditingItem(null)}>
          <article
            className="mx-auto my-6 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit {editingItem.platform}</h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">URL</span>
                <input
                  value={editingItem.url ?? ""}
                  onChange={(event) => setEditingItem((prev) => (prev ? { ...prev, url: event.target.value } : prev))}
                  className="h-10 w-full rounded border border-slate-300 bg-transparent px-3 dark:border-slate-700"
                  placeholder="https://..."
                />
              </label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editingItem.is_active}
                    onChange={(event) => setEditingItem((prev) => (prev ? { ...prev, is_active: event.target.checked } : prev))}
                  />
                  {t("active")}
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  Order
                  <input
                    type="number"
                    value={editingItem.order}
                    onChange={(event) =>
                      setEditingItem((prev) => (prev ? { ...prev, order: Number(event.target.value) || 0 } : prev))
                    }
                    className="h-9 w-20 rounded border border-slate-300 bg-transparent px-2 dark:border-slate-700"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!editingItem) return;
                  setItems((prev) => prev.map((item) => (item.id === editingItem.id ? editingItem : item)));
                  setEditingItem(null);
                }}
                className="rounded-lg bg-transparent border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10"
              >
                {t("saveAll")}
              </button>
            </div>
          </article>
        </div>
      ) : null}

      {isAddModalOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => setIsAddModalOpen(false)}>
          <article
            className="mx-auto my-6 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Social Link</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">Platform</span>
                <select
                  value={addForm.id}
                  onChange={(event) => setAddForm((prev) => ({ ...prev, id: event.target.value }))}
                  className="h-10 w-full rounded border border-slate-300 bg-transparent px-3 dark:border-slate-700"
                >
                  <option value="">Select platform</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.platform}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-500 dark:text-slate-400">URL</span>
                <input
                  value={addForm.url}
                  onChange={(event) => setAddForm((prev) => ({ ...prev, url: event.target.value }))}
                  placeholder="https://..."
                  className="h-10 w-full rounded border border-slate-300 bg-transparent px-3 dark:border-slate-700"
                />
              </label>
              <button
                type="button"
                onClick={submitAdd}
                className="rounded-lg bg-transparent border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10"
              >
                Add
              </button>
            </div>
          </article>
        </div>
      ) : null}
      {isSectionModalOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => setIsSectionModalOpen(false)}>
          <article className="mx-auto my-6 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Edit Contact Top Image</h2><button type="button" onClick={() => setIsSectionModalOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700"><X className="h-4 w-4" /></button></div>
            <div className="mt-4">
              <input id="contact-section-image-input" type="file" accept="image/*" onChange={(event) => setEditingSectionFile(event.target.files?.[0] ?? null)} className="hidden" />
              <label htmlFor="contact-section-image-input" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><Pencil className="h-3.5 w-3.5" />Change image</label>
              {editingSectionFile ? <p className="mt-2 text-xs text-emerald-600">{editingSectionFile.name}</p> : null}
            </div>
            <div className="mt-4">
              <button type="button" onClick={saveContactSectionImage} disabled={!editingSectionFile || isSectionSaving} className="rounded-lg border border-emerald-400 bg-transparent px-4 py-2 text-sm font-semibold text-emerald-300 disabled:opacity-60">{isSectionSaving ? t("saving") : t("saveAll")}</button>
            </div>
          </article>
        </div>
      ) : null}

      <div className="sticky bottom-3 mt-6 flex justify-end">
        <button
          type="button"
          onClick={saveAll}
          disabled={isSaving}
          className="rounded-xl border border-emerald-400 bg-transparent px-5 py-2.5 text-sm font-semibold text-emerald-300 shadow-lg transition hover:bg-emerald-400/10 disabled:opacity-60"
        >
          {isSaving ? t("saving") : t("saveAll")}
        </button>
      </div>
    </section>
  );
}




