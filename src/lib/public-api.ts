export type PublicService = {
  id: number;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  youtube_url: string | null;
  main_image: string | null;
  icon: string | null;
  is_active: boolean;
  order: number;
  images_count?: number;
  sub_services?: PublicSubService[];
  images?: {
    id: number;
    image: string;
    alt_ar: string | null;
    alt_en: string | null;
    order: number;
  }[];
};

export type PublicSubService = {
  id: number;
  service_id: number;
  slug: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string | null;
  subtitle_en: string | null;
  content_ar: string | null;
  content_en: string | null;
  cover_image?: string | null;
  youtube_url?: string | null;
  details_ar?: string | null;
  details_en?: string | null;
  highlights_ar?: string | null;
  highlights_en?: string | null;
  cta_text_ar?: string | null;
  cta_text_en?: string | null;
  cta_url?: string | null;
  quick_facts?: PublicQuickFact[] | null;
  is_active: boolean;
  order: number;
};

export type PublicQuickFact = {
  title_ar?: string | null;
  title_en?: string | null;
  value_ar?: string | null;
  value_en?: string | null;
  icon?: string | null;
};

export type PublicSubServiceDetails = {
  service: PublicService;
  sub_service: PublicSubService;
};

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/my-company-4/backend/public/api";
}

function rewriteStorageUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  const storageMatch = trimmed.match(/\/storage\/(.+)$/);
  if (!storageMatch) {
    return trimmed;
  }

  return `${getApiBaseUrl()}/public/media/${storageMatch[1]}`;
}

function mapStorageUrlsDeep(value: unknown): unknown {
  if (typeof value === "string") {
    return rewriteStorageUrl(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => mapStorageUrlsDeep(item));
  }

  if (value && typeof value === "object") {
    const mapped: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      mapped[key] = mapStorageUrlsDeep(nested);
    }
    return mapped;
  }

  return value;
}

export type PublicSlider = {
  id: number;
  title_ar: string | null;
  title_en: string | null;
  subtitle_ar: string | null;
  subtitle_en: string | null;
  image: string;
  is_active: boolean;
  order: number;
};

export type PublicReview = {
  id: number;
  client_name: string;
  client_company: string | null;
  review_text_ar: string;
  review_text_en: string;
  rating: number;
  created_at: string;
};

export type PublicReviewSubmission = {
  client_name: string;
  client_email?: string | null;
  client_company?: string | null;
  review_text_ar?: string | null;
  review_text_en?: string | null;
  rating: number;
};

export type FooterPayload = {
  company: {
    name_ar: string;
    name_en: string;
    logo: string | null;
    description_ar: string | null;
    description_en: string | null;
  } | null;
  phones: Array<{ id: number; number: string; label_ar: string | null; label_en: string | null }>;
  emails: Array<{ id: number; email: string; label_ar: string | null; label_en: string | null }>;
  addresses: Array<{ id: number; address_ar: string; address_en: string; label_ar: string | null; label_en: string | null }>;
  socials: Array<{ id: number; platform: string; url: string; lucide_icon: string }>;
  why_choose_items: Array<{
    id: number;
    title_ar: string;
    title_en: string;
    description_ar: string | null;
    description_en: string | null;
    icon: string | null;
    is_active: boolean;
    order: number;
  }>;
  settings: Record<
    string,
    | {
        value_ar: string | null;
        value_en: string | null;
      }
    | undefined
  >;
};

export function getLocalizedSettingValue(
  settings: FooterPayload["settings"] | undefined,
  key: string,
  locale: string,
): string | null {
  const entry = settings?.[key];
  if (!entry) {
    return null;
  }

  const value = locale === "ar" ? entry.value_ar ?? entry.value_en : entry.value_en ?? entry.value_ar;
  return value && value.trim() ? value.trim() : null;
}

export async function getPublicServices(): Promise<PublicService[]> {
  const response = await fetch(`${getApiBaseUrl()}/public/services`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Failed to load services.");
  }

  const payload = mapStorageUrlsDeep(await response.json()) as { data: PublicService[] };

  return payload.data ?? [];
}

export async function getPublicServiceDetails(id: number): Promise<PublicService | null> {
  const response = await fetch(`${getApiBaseUrl()}/public/services/${id}`, {
    next: { revalidate: 60 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load service details.");
  }

  const payload = mapStorageUrlsDeep(await response.json()) as { data: PublicService };

  return payload.data;
}

export async function getPublicSubServiceDetails(serviceId: number, slug: string): Promise<PublicSubServiceDetails | null> {
  const response = await fetch(`${getApiBaseUrl()}/public/services/${serviceId}/sub-services/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load sub-service details.");
  }

  const payload = mapStorageUrlsDeep(await response.json()) as { data: PublicSubServiceDetails };

  return payload.data;
}

export async function getPublicSliders(): Promise<PublicSlider[]> {
  const response = await fetch(`${getApiBaseUrl()}/public/sliders`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Failed to load sliders.");
  }

  const payload = mapStorageUrlsDeep(await response.json()) as { data: PublicSlider[] };

  return payload.data ?? [];
}

export async function getPublicReviews(perPage = 8): Promise<PublicReview[]> {
  const response = await fetch(`${getApiBaseUrl()}/public/reviews?per_page=${perPage}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Failed to load reviews.");
  }

  const payload = mapStorageUrlsDeep(await response.json()) as { data: PublicReview[] };

  return payload.data ?? [];
}

export async function submitPublicReview(payload: PublicReviewSubmission): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/public/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to submit review.");
  }
}

export async function getPublicFooterData(): Promise<FooterPayload> {
  const response = await fetch(`${getApiBaseUrl()}/public/footer`, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error("Failed to load footer data.");
  }

  return mapStorageUrlsDeep(await response.json()) as FooterPayload;
}
