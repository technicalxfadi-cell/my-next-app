"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronDown, Plus, X } from "lucide-react";

import {
  createWhyChooseItem,
  deleteWhyChooseItem,
  getSiteSettings,
  getWhyChooseItems,
  type SiteSetting,
  type WhyChooseItem,
  updateSiteSettings,
  updateWhyChooseItem,
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
        <summary className="flex h-10 cursor-pointer list-none items-center justify-between rounded-lg border border-slate-300 bg-transparent px-3 text-sm dark:border-slate-700 dark:bg-[#1d2940]">
          <span className="inline-flex items-center gap-2">
            <ServiceIcon name={selectedIcon} className="h-4 w-4 text-emerald-500" />
            <span>{selectedIcon}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
        </summary>
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-[#24324a]">
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

export default function SiteSettingsAdminPage() {
  const t = useTranslations("adminSiteSettings");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const isArabic = locale === "ar";
  const englishLabel = isArabic ? "الانجليزية" : "English";
  const arabicLabel = isArabic ? "العربية" : "Arabic";
  const group = searchParams.get("group") ?? "all";
  const tabFromQuery = searchParams.get("tab");
  const canManageWhyChoose = group === "home" || group === "all";
  const isWhyChooseMode = group === "home" && tabFromQuery === "why-choose";

  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [whyChooseItems, setWhyChooseItems] = useState<WhyChooseItem[]>([]);
  const [activeTab, setActiveTab] = useState<"settings" | "why-choose">("settings");
  const [editingSetting, setEditingSetting] = useState<SiteSetting | null>(null);
  const [editingCoreValue, setEditingCoreValue] = useState<{
    index: number;
    title_en: string;
    title_ar: string;
    text_en: string;
    text_ar: string;
  } | null>(null);
  const [editingWhyChoose, setEditingWhyChoose] = useState<WhyChooseItem | null>(null);
  const [isAddWhyChooseOpen, setIsAddWhyChooseOpen] = useState(false);
  const [savingId, setSavingId] = useState<number | string | null>(null);
  const [newWhyChoose, setNewWhyChoose] = useState<Pick<WhyChooseItem, "title_ar" | "title_en" | "description_ar" | "description_en" | "icon" | "is_active" | "order">>({
    title_ar: "",
    title_en: "",
    description_ar: null,
    description_en: null,
    icon: SERVICE_ICON_OPTIONS[0],
    is_active: true,
    order: 0,
  });

  useEffect(() => {
    Promise.all([getSiteSettings(), getWhyChooseItems()])
      .then(([siteData, whyData]) => {
        setSettings(siteData);
        setWhyChooseItems(whyData);
      })
      .catch(() => toast.error(t("loadError")));
  }, [t]);

  useEffect(() => {
    if (isWhyChooseMode) {
      setActiveTab("why-choose");
      return;
    }

    if (!canManageWhyChoose) {
      setActiveTab("settings");
      return;
    }

    if (tabFromQuery === "why-choose") {
      setActiveTab("why-choose");
    } else {
      setActiveTab("settings");
    }
  }, [canManageWhyChoose, tabFromQuery, group, isWhyChooseMode]);

  function inGroup(key: string, currentGroup: string) {
    if (currentGroup === "all") return true;
    if (currentGroup === "home") return key.startsWith("home_") || key === "section_home_image";
    if (currentGroup === "services") return key.startsWith("services_") || key === "section_services_image";
    if (currentGroup === "about") return key.startsWith("about_") || key === "section_about_image";
    if (currentGroup === "contact") return key.startsWith("contact_") || key === "section_contact_image";
    if (currentGroup === "global") {
      return !(
        key.startsWith("home_") ||
        key.startsWith("services_") ||
        key.startsWith("about_") ||
        key.startsWith("contact_") ||
        key === "section_home_image" ||
        key === "section_services_image" ||
        key === "section_about_image" ||
        key === "section_contact_image"
      );
    }
    return true;
  }

  function sectionKeyForSetting(key: string) {
    if (key === "section_home_image") return "home";
    if (key === "section_services_image") return "services";
    if (key === "section_about_image") return "about";
    if (key === "section_contact_image") return "contact";
    if (key.startsWith("home_")) return "home";
    if (key.startsWith("services_")) return "services";
    if (key.startsWith("about_")) return "about";
    if (key.startsWith("contact_")) return "contact";
    if (key.startsWith("footer_")) return "footer";
    if (key.startsWith("meta_") || key.includes("seo")) return "meta";
    if (key.startsWith("review_")) return "review";
    return "global";
  }

  function sectionMeta(section: string) {
    if (section === "home") {
      return {
        title: isArabic ? "صفحة الرئيسية" : "Home Page",
        description: isArabic ? "محتوى الصفحة الرئيسية والعناصر الظاهرة أولاً للزائر." : "Homepage content and first impression elements.",
      };
    }
    if (section === "services") {
      return {
        title: isArabic ? "صفحة الخدمات" : "Services Page",
        description: isArabic ? "النصوص والإعدادات الخاصة بعرض الخدمات." : "Text and settings used in services pages.",
      };
    }
    if (section === "about") {
      return {
        title: isArabic ? "صفحة من نحن" : "About Page",
        description: isArabic ? "الإعدادات الخاصة بمحتوى صفحة من نحن." : "Settings used in the About page content.",
      };
    }
    if (section === "contact") {
      return {
        title: isArabic ? "صفحة التواصل" : "Contact Page",
        description: isArabic ? "بيانات الاتصال ورسائل صفحة التواصل." : "Contact details and contact page texts.",
      };
    }
    if (section === "footer") {
      return {
        title: isArabic ? "الفوتر" : "Footer",
        description: isArabic ? "النصوص والعناصر المشتركة أسفل الموقع." : "Shared footer texts and labels.",
      };
    }
    if (section === "meta") {
      return {
        title: isArabic ? "SEO و Meta" : "SEO & Meta",
        description: isArabic ? "إعدادات الظهور في نتائج البحث والمنصات." : "Search and social preview settings.",
      };
    }
    if (section === "review") {
      return {
        title: isArabic ? "قسم المراجعات" : "Reviews Section",
        description: isArabic ? "النصوص المستخدمة في منطقة آراء العملاء." : "Texts used in the customer reviews area.",
      };
    }
    return {
      title: isArabic ? "إعدادات عامة" : "Global Settings",
      description: isArabic ? "إعدادات مشتركة تؤثر على أكثر من صفحة." : "Shared settings affecting multiple pages.",
    };
  }

  function orderedKeysForSection(section: string) {
    if (section === "home") {
      return [
        "section_home_image",
        "home_hero_title",
        "home_hero_subtitle",
        "home_cta",
        "home_featured_services",
        "home_why_choose_title",
        "home_show_more",
      ];
    }

    if (section === "services") {
      return [
        "section_services_image",
        "services_title",
        "services_subtitle",
        "services_empty_title",
        "services_empty_description",
        "services_view_details",
      ];
    }

    if (section === "about") {
      return [
        "section_about_image",
        "about_intro",
        "about_story",
        "about_mission_title",
        "about_mission_text",
        "about_vision_title",
        "about_vision_text",
        "about_technology_title",
        "about_technology_text",
        "about_experts_title",
        "about_experts_text",
        "about_values_title",
        "about_values_intro",
        "about_title",
        "about_story_title",
        "about_story_text",
      ];
    }

    if (section === "contact") {
      return [
        "section_contact_image",
        "contact_title",
        "contact_subtitle",
        "contact_name",
        "contact_email",
        "contact_subject",
        "contact_message",
        "contact_send",
      ];
    }

    if (section === "footer") {
      return [
        "footer_line",
        "footer_quick_links",
        "footer_contact_info",
        "footer_follow_us",
      ];
    }

    return [];
  }

  function aboutSubgroupForKey(key: string): "hero" | "story" | "missionVision" | "expertise" | "valuesIntro" | "other" {
    if (key === "section_about_image" || key === "about_intro" || key === "about_title") {
      return "hero";
    }
    if (key === "about_story" || key.startsWith("about_story_")) {
      return "story";
    }
    if (key.startsWith("about_mission_") || key.startsWith("about_vision_")) {
      return "missionVision";
    }
    if (key.startsWith("about_technology_") || key.startsWith("about_experts_")) {
      return "expertise";
    }
    if (key === "about_values_title" || key === "about_values_intro") {
      return "valuesIntro";
    }

    return "other";
  }

  function aboutSubgroupMeta(subgroup: "hero" | "story" | "missionVision" | "expertise" | "valuesIntro" | "other") {
    if (subgroup === "hero") {
      return {
        title: isArabic ? "قسم البداية" : "Hero Section",
        description: isArabic ? "صورة الهيدر والعنوان والنبذة الافتتاحية." : "Header image, page title, and opening intro.",
      };
    }
    if (subgroup === "story") {
      return {
        title: isArabic ? "قصتنا" : "Our Story",
        description: isArabic ? "النص الذي يظهر في قسم قصتنا." : "Content shown in the Our Story section.",
      };
    }
    if (subgroup === "missionVision") {
      return {
        title: isArabic ? "الرسالة والرؤية" : "Mission & Vision",
        description: isArabic ? "عناوين ونصوص الرسالة والرؤية." : "Mission and vision titles and texts.",
      };
    }
    if (subgroup === "expertise") {
      return {
        title: isArabic ? "الخبرة والتقنية" : "Expertise & Technology",
        description: isArabic ? "عناصر الخبراء والتقنيات كما تظهر في الصفحة." : "Experts and technology blocks as shown on page.",
      };
    }
    if (subgroup === "valuesIntro") {
      return {
        title: isArabic ? "مقدمة القيم" : "Core Values Intro",
        description: isArabic ? "عنوان ووصف مقدمة قسم القيم الأساسية." : "Heading and intro text for core values section.",
      };
    }

    return {
      title: isArabic ? "عناصر أخرى" : "Other About Settings",
      description: isArabic ? "إعدادات إضافية تخص صفحة من نحن" : "Additional About-related settings.",
    };
  }

  function settingIntent(key: string) {
    const normalized = key.toLowerCase();

    if (normalized.includes("hero_title")) {
      return isArabic ? "العنوان الرئيسي الظاهر أعلى الصفحة." : "Main heading shown at the top of the page.";
    }
    if (normalized.includes("hero_subtitle")) {
      return isArabic ? "النص التعريفي تحت العنوان الرئيسي." : "Supporting text under the main heading.";
    }
    if (normalized.includes("cta") || normalized.includes("button") || normalized.includes("btn")) {
      return isArabic ? "نص زر الإجراء الذي يضغط عليه المستخدم." : "Call-to-action button text users click.";
    }
    if (normalized.includes("title")) {
      return isArabic ? "عنوان القسم كما يظهر للزوار." : "Section title as shown to visitors.";
    }
    if (normalized.includes("subtitle")) {
      return isArabic ? "وصف قصير أسفل عنوان القسم." : "Short description shown under section title.";
    }
    if (normalized.includes("description") || normalized.includes("text") || normalized.includes("intro")) {
      return isArabic ? "النص الوصفي الظاهر في هذا الجزء." : "Descriptive text displayed in this part.";
    }
    if (normalized.includes("email") || normalized.includes("phone") || normalized.includes("address")) {
      return isArabic ? "معلومة تواصل تظهر في صفحة التواصل أو الفوتر." : "Contact information shown in contact/footer areas.";
    }
    if (normalized.includes("meta") || normalized.includes("seo")) {
      return isArabic ? "محتوى يستخدم في محركات البحث والمنصات." : "Content used for search and social previews.";
    }

    return isArabic ? "قيمة نصية تؤثر على واجهة الموقع." : "Text value that affects the website UI.";
  }

  function parseCoreValueKey(key: string): { index: number; field: "title" | "text" } | null {
    const match = key.match(/^about_value_(\d+)_(title|text)$/);
    if (!match) {
      return null;
    }

    return {
      index: Number(match[1]),
      field: match[2] as "title" | "text",
    };
  }


  const filteredSettings = useMemo(
    () => settings.filter((row) => !parseCoreValueKey(row.key) && inGroup(row.key, group)),
    [settings, group],
  );

  const coreValues = useMemo(() => {
    const bucket = new Map<number, {
      index: number;
      title_en: string;
      title_ar: string;
      text_en: string;
      text_ar: string;
    }>();

    settings.forEach((row) => {
      const parsed = parseCoreValueKey(row.key);
      if (!parsed) {
        return;
      }

      const current = bucket.get(parsed.index) ?? {
        index: parsed.index,
        title_en: "",
        title_ar: "",
        text_en: "",
        text_ar: "",
      };

      if (parsed.field === "title") {
        current.title_en = row.value_en ?? "";
        current.title_ar = row.value_ar ?? "";
      } else {
        current.text_en = row.value_en ?? "";
        current.text_ar = row.value_ar ?? "";
      }

      bucket.set(parsed.index, current);
    });

    return [...bucket.values()]
      .map((value) => ({
        ...value,
        title_en: value.title_en.trim(),
        title_ar: value.title_ar.trim(),
        text_en: value.text_en.trim(),
        text_ar: value.text_ar.trim(),
      }))
      .filter((value) => value.title_en || value.title_ar || value.text_en || value.text_ar)
      .sort((a, b) => a.index - b.index);
  }, [settings]);

  const coreValueIndexes = useMemo(() => {
    const indexes = new Set<number>();

    settings.forEach((row) => {
      const parsed = parseCoreValueKey(row.key);
      if (parsed) {
        indexes.add(parsed.index);
      }
    });

    return [...indexes].sort((a, b) => a - b);
  }, [settings]);

  function buildCoreValuesSyncPayload(values: Array<{ title_en: string; title_ar: string; text_en: string; text_ar: string }>) {
    const payload: Array<Pick<SiteSetting, "key" | "value_ar" | "value_en">> = [];

    coreValueIndexes.forEach((oldIndex) => {
      payload.push({ key: `about_value_${oldIndex}_title`, value_en: null, value_ar: null });
      payload.push({ key: `about_value_${oldIndex}_text`, value_en: null, value_ar: null });
    });

    values.forEach((value, position) => {
      const nextIndex = position + 1;
      payload.push({
        key: `about_value_${nextIndex}_title`,
        value_en: value.title_en || null,
        value_ar: value.title_ar || null,
      });
      payload.push({
        key: `about_value_${nextIndex}_text`,
        value_en: value.text_en || null,
        value_ar: value.text_ar || null,
      });
    });

    return payload;
  }

  const groupedSettings = useMemo(() => {
    const order = ["home", "services", "about", "contact", "footer", "meta", "review", "global"] as const;
    const bucket: Record<string, SiteSetting[]> = {
      home: [],
      services: [],
      about: [],
      contact: [],
      footer: [],
      meta: [],
      review: [],
      global: [],
    };

    filteredSettings.forEach((item) => {
      bucket[sectionKeyForSetting(item.key)].push(item);
    });

    return order
      .map((key) => {
        const priority = orderedKeysForSection(key);
        const sortedItems = [...bucket[key]].sort((a, b) => {
          const ai = priority.indexOf(a.key);
          const bi = priority.indexOf(b.key);

          if (ai !== -1 && bi !== -1) {
            return ai - bi;
          }
          if (ai !== -1) {
            return -1;
          }
          if (bi !== -1) {
            return 1;
          }

          return a.key.localeCompare(b.key);
        });

        return { key, items: sortedItems };
      })
      .filter((section) => section.items.length > 0);
  }, [filteredSettings, isArabic]);

  function settingLabel(key: string) {
    return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function settingPlacement(key: string) {
    if (key === "section_home_image") return t("placement.sectionHomeImage");
    if (key === "section_services_image") return t("placement.sectionServicesImage");
    if (key === "section_about_image") return t("placement.sectionAboutImage");
    if (key === "section_contact_image") return t("placement.sectionContactImage");
    if (key.startsWith("home_")) return t("placement.home");
    if (key.startsWith("services_")) return t("placement.services");
    if (key.startsWith("about_")) return t("placement.about");
    if (key.startsWith("contact_")) return t("placement.contact");
    if (key.startsWith("footer_")) return t("placement.footer");
    if (key.startsWith("meta_") || key.includes("seo")) return t("placement.meta");
    if (key.startsWith("review_")) return t("placement.review");
    return t("placement.global");
  }

  function groupGuide(currentGroup: string) {
    if (currentGroup === "home") return t("groupGuide.home");
    if (currentGroup === "services") return t("groupGuide.services");
    if (currentGroup === "about") return t("groupGuide.about");
    if (currentGroup === "contact") return t("groupGuide.contact");
    if (currentGroup === "global") return t("groupGuide.global");
    return t("groupGuide.all");
  }

  async function saveSettingRow(item: SiteSetting) {
    setSavingId(item.id);
    try {
      await updateSiteSettings([{ key: item.key, value_ar: item.value_ar, value_en: item.value_en }]);
      toast.success(t("updated"));
      setEditingSetting(null);
      const refreshed = await getSiteSettings();
      setSettings(refreshed);
    } catch {
      toast.error(t("updateError"));
    } finally {
      setSavingId(null);
    }
  }

  async function saveWhyChooseRow(item: WhyChooseItem) {
    setSavingId(item.id);
    try {
      await updateWhyChooseItem(item.id, {
        title_ar: item.title_ar,
        title_en: item.title_en,
        description_ar: item.description_ar,
        description_en: item.description_en,
        icon: item.icon,
        is_active: item.is_active,
        order: item.order,
      });
      toast.success(t("updated"));
      setEditingWhyChoose(null);
      const refreshed = await getWhyChooseItems();
      setWhyChooseItems(refreshed);
    } catch {
      toast.error(t("updateError"));
    } finally {
      setSavingId(null);
    }
  }

  async function deleteWhyChooseRow(id: number) {
    if (!window.confirm(t("confirmDelete"))) return;
    try {
      await deleteWhyChooseItem(id);
      toast.success(t("deleted"));
      setWhyChooseItems((prev) => prev.filter((row) => row.id !== id));
    } catch {
      toast.error(t("deleteError"));
    }
  }

  async function addWhyChooseRow() {
    if (!newWhyChoose.title_ar.trim() || !newWhyChoose.title_en.trim()) {
      toast.error(t("titleRequired"));
      return;
    }
    setSavingId("new-why");
    try {
      await createWhyChooseItem(newWhyChoose);
      const refreshed = await getWhyChooseItems();
      setWhyChooseItems(refreshed);
      setNewWhyChoose({
        title_ar: "",
        title_en: "",
        description_ar: null,
        description_en: null,
        icon: SERVICE_ICON_OPTIONS[0],
        is_active: true,
        order: whyChooseItems.length + 1,
      });
      setIsAddWhyChooseOpen(false);
      toast.success(t("created"));
    } catch {
      toast.error(t("createError"));
    } finally {
      setSavingId(null);
    }
  }

  async function addCoreValue() {
    const nextIndex = coreValues.length + 1;
    setEditingCoreValue({
      index: nextIndex,
      title_en: "",
      title_ar: "",
      text_en: "",
      text_ar: "",
    });
  }

  async function removeCoreValue(index: number) {
    if (!window.confirm(isArabic ? "حذف هذه القيمة؟" : "Delete this core value?")) {
      return;
    }

    setSavingId(`core-delete-${index}`);
    try {
      const remainingValues = coreValues
        .filter((value) => value.index !== index)
        .map((value) => ({
          title_en: value.title_en.trim(),
          title_ar: value.title_ar.trim(),
          text_en: value.text_en.trim(),
          text_ar: value.text_ar.trim(),
        }));

      await updateSiteSettings(buildCoreValuesSyncPayload(remainingValues));

      const refreshed = await getSiteSettings();
      setSettings(refreshed);
      toast.success(isArabic ? "تم حذف القيمة" : "Core value removed");
    } catch {
      toast.error(t("updateError"));
    } finally {
      setSavingId(null);
    }
  }

  async function saveCoreValue() {
    if (!editingCoreValue) {
      return;
    }

    const normalizedEditingValue = {
      title_en: editingCoreValue.title_en.trim(),
      title_ar: editingCoreValue.title_ar.trim(),
      text_en: editingCoreValue.text_en.trim(),
      text_ar: editingCoreValue.text_ar.trim(),
    };

    if (!normalizedEditingValue.title_en && !normalizedEditingValue.title_ar && !normalizedEditingValue.text_en && !normalizedEditingValue.text_ar) {
      toast.error(isArabic ? "أدخل عنوانًا أو وصفًا قبل الحفظ" : "Enter a title or description before saving");
      return;
    }

    setSavingId(`core-save-${editingCoreValue.index}`);
    try {
      const nextValues = [...coreValues];
      const existingIndex = nextValues.findIndex((value) => value.index === editingCoreValue.index);

      if (existingIndex === -1) {
        nextValues.push({
          index: editingCoreValue.index,
          ...normalizedEditingValue,
        });
      } else {
        nextValues[existingIndex] = {
          ...nextValues[existingIndex],
          ...normalizedEditingValue,
        };
      }

      const normalizedValues = nextValues
        .map((value) => ({
          title_en: value.title_en.trim(),
          title_ar: value.title_ar.trim(),
          text_en: value.text_en.trim(),
          text_ar: value.text_ar.trim(),
        }))
        .filter((value) => value.title_en || value.title_ar || value.text_en || value.text_ar);

      await updateSiteSettings(buildCoreValuesSyncPayload(normalizedValues));

      const refreshed = await getSiteSettings();
      setSettings(refreshed);
      setEditingCoreValue(null);
      toast.success(t("updated"));
    } catch {
      toast.error(t("updateError"));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#24324a]/70">
        <h1 className="text-3xl font-bold">{isWhyChooseMode ? (isArabic ? "لماذا تختارنا" : "Why Choose Us") : t("title")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{isWhyChooseMode ? (isArabic ? "إدارة عناصر قسم لماذا تختارنا." : "Manage why choose us section items.") : t("subtitle")}</p>
        {activeTab === "settings" || !canManageWhyChoose ? (
          <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/90 p-3 text-sm text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-100">
            <p className="font-semibold">{t("groupGuideTitle")}</p>
            <p className="mt-1 text-xs md:text-sm">{groupGuide(group)}</p>
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!isWhyChooseMode ? (
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${activeTab === "settings" ? "bg-transparent border border-sky-400 text-sky-300" : "bg-transparent border border-slate-400 text-slate-300 hover:bg-slate-400/10 dark:bg-slate-200 dark:text-slate-900"}`}
            >
              {isArabic ? "الإعدادات" : "Settings"}
            </button>
          ) : null}
          {canManageWhyChoose && !isWhyChooseMode ? (
            <button
              type="button"
              onClick={() => setActiveTab("why-choose")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${activeTab === "why-choose" ? "bg-transparent border border-sky-400 text-sky-300" : "bg-transparent border border-slate-400 text-slate-300 hover:bg-slate-400/10 dark:bg-slate-200 dark:text-slate-900"}`}
            >
              {isArabic ? "لماذا تختارنا" : "Why Choose"}
            </button>
          ) : null}
          {activeTab === "why-choose" && canManageWhyChoose ? (
            <button
              type="button"
              onClick={() => setIsAddWhyChooseOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-sky-400 bg-transparent px-4 py-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/10"
            >
              <Plus className="h-4 w-4" />
              {t("addNewItem")}
            </button>
          ) : null}
        </div>
      </div>

      {activeTab === "settings" || !canManageWhyChoose ? (
        <div className="mt-6 space-y-4">
          {groupedSettings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-[#1d2940]/55 dark:text-slate-300">
              {isArabic ? "لا توجد إعدادات في هذا القسم حالياً." : "No settings found in this section yet."}
            </div>
          ) : null}

          {groupedSettings.map((section) => {
            const meta = sectionMeta(section.key);

            return (
              <article key={section.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1d2940]/55">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{meta.title}</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{meta.description}</p>
                  </div>
                  <span className="inline-flex rounded-full border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                    {section.items.length} {isArabic ? "عنصر" : "items"}
                  </span>
                </div>

                {section.key === "about" ? (
                  <div className="mt-4 space-y-3">
                    {(["hero", "story", "missionVision", "expertise", "valuesIntro", "other"] as const)
                      .map((subgroup) => ({
                        subgroup,
                        items: section.items.filter((item) => aboutSubgroupForKey(item.key) === subgroup),
                      }))
                      .filter((entry) => entry.items.length > 0)
                      .map((entry) => {
                        const subgroupMeta = aboutSubgroupMeta(entry.subgroup);

                        return (
                          <div key={entry.subgroup} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-[#24324a]/70">
                            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{subgroupMeta.title}</h4>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subgroupMeta.description}</p>
                              </div>
                              <span className="inline-flex rounded-full border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                {entry.items.length} {isArabic ? "عنصر" : "items"}
                              </span>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              {entry.items.map((item, index) => (
                                <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-[#1d2940]">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="inline-flex items-center gap-2">
                                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-slate-300 px-1 text-[10px] font-bold text-slate-600 dark:border-slate-600 dark:text-slate-300">
                                          {index + 1}
                                        </span>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{settingLabel(item.key)}</p>
                                      </div>
                                      <p className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{item.key}</p>
                                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{settingIntent(item.key)}</p>
                                    </div>
                                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                                      {settingPlacement(item.key)}
                                    </span>
                                  </div>

                                  <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-[#24324a] dark:text-slate-200">
                                    <div className="grid gap-2 md:grid-cols-2">
                                      <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</p>
                                        <p className="mt-1">{item.value_en || "-"}</p>
                                      </div>
                                      <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</p>
                                        <p className="mt-1">{item.value_ar || "-"}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-3 flex gap-2">
                                    <button type="button" onClick={() => setEditingSetting(item)} className="flex-1 rounded border border-slate-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-400/10 dark:text-slate-200">{isArabic ? "تعديل القيمة" : "Edit Value"}</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {section.items.map((item, index) => (
                      <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-[#24324a]/70">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="inline-flex items-center gap-2">
                              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-slate-300 px-1 text-[10px] font-bold text-slate-600 dark:border-slate-600 dark:text-slate-300">
                                {index + 1}
                              </span>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{settingLabel(item.key)}</p>
                            </div>
                            <p className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{item.key}</p>
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{settingIntent(item.key)}</p>
                          </div>
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                            {settingPlacement(item.key)}
                          </span>
                        </div>

                        <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-[#1d2940] dark:text-slate-200">
                          <div className="grid gap-2 md:grid-cols-2">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</p>
                              <p className="mt-1">{item.value_en || "-"}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</p>
                              <p className="mt-1">{item.value_ar || "-"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button type="button" onClick={() => setEditingSetting(item)} className="flex-1 rounded border border-slate-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-400/10 dark:text-slate-200">{isArabic ? "تعديل القيمة" : "Edit Value"}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {section.key === "about" ? (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-[#24324a]/70">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{isArabic ? "القيم الأساسية" : "Core Values"}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{isArabic ? "إضافة أو حذف أو تعديل عناصر القيم الأساسية." : "Add, remove, and edit core value items."}</p>
                      </div>
                      <button
                        type="button"
                        onClick={addCoreValue}
                        disabled={String(savingId).startsWith("core-add-")}
                        className="inline-flex items-center gap-2 rounded-lg border border-sky-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-400/10 disabled:opacity-60"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {isArabic ? "إضافة قيمة" : "Add Value"}
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {coreValues.map((value, position) => (
                        <div key={value.index} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-[#1d2940]">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isArabic ? `القيمة ${position + 1}` : `Value ${position + 1}`}</p>
                            <span className="inline-flex rounded-full border border-slate-300 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">#{position + 1}</span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{(isArabic ? value.title_ar : value.title_en) || "-"}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{(isArabic ? value.text_ar : value.text_en) || "-"}</p>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingCoreValue(value)}
                              className="flex-1 rounded border border-slate-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-400/10 dark:text-slate-200"
                            >
                              {isArabic ? "تعديل" : "Edit"}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCoreValue(value.index)}
                              disabled={savingId === `core-delete-${value.index}`}
                              className="flex-1 rounded border border-red-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-400/10 disabled:opacity-60"
                            >
                              {isArabic ? "حذف" : "Remove"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="bg-slate-100 dark:bg-[#24324a]">
              <tr>
                <th className="px-4 py-3">{isArabic ? t("titleAr") : t("titleEn")}</th>
                <th className="px-4 py-3">{isArabic ? t("descriptionAr") : t("descriptionEn")}</th>
                <th className="px-4 py-3">{t("icon")}</th>
                <th className="px-4 py-3">{t("active")}</th>
                <th className="px-4 py-3">{t("order")}</th>
                <th className="px-4 py-3">{isArabic ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {whyChooseItems.map((item) => (
                <tr key={item.id} className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1d2940]/55">
                  <td className="max-w-56 truncate px-4 py-3">{isArabic ? item.title_ar : item.title_en}</td>
                  <td className="max-w-72 truncate px-4 py-3">{isArabic ? (item.description_ar || "-") : (item.description_en || "-")}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <ServiceIcon name={item.icon ?? SERVICE_ICON_OPTIONS[0]} className="h-4 w-4 text-emerald-500" />
                      <span>{item.icon ?? "-"}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.is_active ? (isArabic ? "نعم" : "Yes") : (isArabic ? "لا" : "No")}</td>
                  <td className="px-4 py-3">{item.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <button type="button" onClick={() => setEditingWhyChoose(item)} className="rounded border border-slate-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-400/10 dark:text-slate-200">{isArabic ? "تعديل" : "Edit"}</button>
                      <button type="button" onClick={() => deleteWhyChooseRow(item.id)} className="rounded border border-red-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-400/10">{isArabic ? "حذف" : "Delete"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingSetting ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => setEditingSetting(null)}>
          <article className="mx-auto my-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#24324a]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{isArabic ? "تعديل الإعداد" : "Edit Setting"}</h2>
              <button type="button" onClick={() => setEditingSetting(null)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 grid gap-3">
              <input value={editingSetting.key} disabled className="h-10 rounded-lg border border-slate-300 bg-slate-100 px-3 dark:border-slate-700 dark:bg-[#1d2940]" />
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                {t("whereUsed")} {settingPlacement(editingSetting.key)}
              </div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{isArabic ? "قيمة الإعداد" : "Setting Value"}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</span>
                    <textarea value={editingSetting.value_en ?? ""} onChange={(e) => setEditingSetting((p) => (p ? { ...p, value_en: e.target.value } : p))} placeholder={t("valueEn")} className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#1d2940]" />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</span>
                    <textarea value={editingSetting.value_ar ?? ""} onChange={(e) => setEditingSetting((p) => (p ? { ...p, value_ar: e.target.value } : p))} placeholder={t("valueAr")} className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#1d2940]" />
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button type="button" onClick={() => saveSettingRow(editingSetting)} disabled={savingId === editingSetting.id} className="rounded-lg border border-sky-400 bg-transparent px-4 py-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/10 disabled:opacity-60">{savingId === editingSetting.id ? t("saving") : t("save")}</button>
            </div>
          </article>
        </div>
      ) : null}

      {editingCoreValue ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => setEditingCoreValue(null)}>
          <article className="mx-auto my-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#24324a]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{isArabic ? `تعديل القيمة ${editingCoreValue.index}` : `Edit Value ${editingCoreValue.index}`}</h2>
              <button type="button" onClick={() => setEditingCoreValue(null)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700"><X className="h-4 w-4" /></button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{isArabic ? "عنوان القيمة" : "Value Title"}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</span>
                    <input
                      value={editingCoreValue.title_en}
                      onChange={(e) => setEditingCoreValue((prev) => (prev ? { ...prev, title_en: e.target.value } : prev))}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</span>
                    <input
                      value={editingCoreValue.title_ar}
                      onChange={(e) => setEditingCoreValue((prev) => (prev ? { ...prev, title_ar: e.target.value } : prev))}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]"
                    />
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{isArabic ? "وصف القيمة" : "Value Description"}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{englishLabel}</span>
                    <textarea
                      value={editingCoreValue.text_en}
                      onChange={(e) => setEditingCoreValue((prev) => (prev ? { ...prev, text_en: e.target.value } : prev))}
                      className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#1d2940]"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{arabicLabel}</span>
                    <textarea
                      value={editingCoreValue.text_ar}
                      onChange={(e) => setEditingCoreValue((prev) => (prev ? { ...prev, text_ar: e.target.value } : prev))}
                      className="min-h-24 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#1d2940]"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button type="button" onClick={saveCoreValue} disabled={savingId === `core-save-${editingCoreValue.index}`} className="rounded-lg border border-sky-400 bg-transparent px-4 py-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/10 disabled:opacity-60">
                {savingId === `core-save-${editingCoreValue.index}` ? t("saving") : t("save")}
              </button>
            </div>
          </article>
        </div>
      ) : null}

      {editingWhyChoose ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => setEditingWhyChoose(null)}>
          <article className="mx-auto my-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#24324a]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{isArabic ? "تعديل العنصر" : "Edit Item"}</h2>
              <button type="button" onClick={() => setEditingWhyChoose(null)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={editingWhyChoose.title_en} onChange={(e) => setEditingWhyChoose((p) => (p ? { ...p, title_en: e.target.value } : p))} placeholder={t("titleEn")} className="h-10 rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" />
              <input value={editingWhyChoose.title_ar} onChange={(e) => setEditingWhyChoose((p) => (p ? { ...p, title_ar: e.target.value } : p))} placeholder={t("titleAr")} className="h-10 rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" />
              <textarea value={editingWhyChoose.description_en ?? ""} onChange={(e) => setEditingWhyChoose((p) => (p ? { ...p, description_en: e.target.value || null } : p))} placeholder={t("descriptionEn")} className="min-h-24 rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#1d2940]" />
              <textarea value={editingWhyChoose.description_ar ?? ""} onChange={(e) => setEditingWhyChoose((p) => (p ? { ...p, description_ar: e.target.value || null } : p))} placeholder={t("descriptionAr")} className="min-h-24 rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#1d2940]" />
              <IconDropdown value={editingWhyChoose.icon} onChange={(next) => setEditingWhyChoose((p) => (p ? { ...p, icon: next } : p))} label={t("icon")} />
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={editingWhyChoose.is_active} onChange={(e) => setEditingWhyChoose((p) => (p ? { ...p, is_active: e.target.checked } : p))} />{t("active")}</label>
              <label className="inline-flex items-center gap-2 text-sm">{t("order")}<input type="number" value={editingWhyChoose.order} onChange={(e) => setEditingWhyChoose((p) => (p ? { ...p, order: Number(e.target.value) || 0 } : p))} className="h-9 w-20 rounded border border-slate-300 bg-transparent px-2 dark:border-slate-700 dark:bg-[#1d2940]" /></label>
            </div>
            <div className="mt-4">
              <button type="button" onClick={() => saveWhyChooseRow(editingWhyChoose)} disabled={savingId === editingWhyChoose.id} className="rounded-lg border border-sky-400 bg-transparent px-4 py-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/10 disabled:opacity-60">{savingId === editingWhyChoose.id ? t("saving") : t("save")}</button>
            </div>
          </article>
        </div>
      ) : null}

      {isAddWhyChooseOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4" onClick={() => setIsAddWhyChooseOpen(false)}>
          <article className="mx-auto my-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#24324a]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("addNewItem")}</h2>
              <button type="button" onClick={() => setIsAddWhyChooseOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={newWhyChoose.title_en} onChange={(e) => setNewWhyChoose((p) => ({ ...p, title_en: e.target.value }))} placeholder={t("titleEn")} className="h-10 rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" />
              <input value={newWhyChoose.title_ar} onChange={(e) => setNewWhyChoose((p) => ({ ...p, title_ar: e.target.value }))} placeholder={t("titleAr")} className="h-10 rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700 dark:bg-[#1d2940]" />
              <textarea value={newWhyChoose.description_en ?? ""} onChange={(e) => setNewWhyChoose((p) => ({ ...p, description_en: e.target.value || null }))} placeholder={t("descriptionEn")} className="min-h-24 rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#1d2940]" />
              <textarea value={newWhyChoose.description_ar ?? ""} onChange={(e) => setNewWhyChoose((p) => ({ ...p, description_ar: e.target.value || null }))} placeholder={t("descriptionAr")} className="min-h-24 rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:bg-[#1d2940]" />
              <IconDropdown value={newWhyChoose.icon} onChange={(next) => setNewWhyChoose((p) => ({ ...p, icon: next }))} label={t("icon")} />
            </div>
            <div className="mt-4">
              <button type="button" onClick={addWhyChooseRow} disabled={savingId === "new-why"} className="rounded-lg border border-sky-400 bg-transparent px-4 py-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/10 disabled:opacity-60">{savingId === "new-why" ? t("saving") : t("create")}</button>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}



