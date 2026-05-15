import { api } from "@/lib/api";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "editor";
  is_active: boolean;
};

export type AdminSlider = {
  id: number;
  title_ar: string | null;
  title_en: string | null;
  subtitle_ar: string | null;
  subtitle_en: string | null;
  image: string;
  is_active: boolean;
  order: number;
};

export type AdminReview = {
  id: number;
  client_name: string;
  client_email: string | null;
  client_company: string | null;
  review_text_ar: string;
  review_text_en: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
};

export type AdminService = {
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
  images: ServiceGalleryImage[];
  sub_services?: AdminSubService[];
};

export type AdminSubService = {
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
  quick_facts?: AdminQuickFact[] | null;
  is_active: boolean;
  order: number;
};

export type AdminQuickFact = {
  title_ar?: string | null;
  title_en?: string | null;
  value_ar?: string | null;
  value_en?: string | null;
  icon?: string | null;
};

export type ServiceGalleryImage = {
  id: number;
  service_id: number;
  image: string;
  alt_ar: string | null;
  alt_en: string | null;
  order: number;
};

export type CompanyRecord = {
  id: number;
  name_ar: string;
  name_en: string;
  logo: string | null;
  description_ar: string | null;
  description_en: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
};

export type CompanyPhone = {
  id: number;
  number: string;
  label_ar: string | null;
  label_en: string | null;
  is_active: boolean;
  order: number;
};

export type CompanyEmail = {
  id: number;
  email: string;
  label_ar: string | null;
  label_en: string | null;
  is_active: boolean;
  order: number;
};

export type CompanyAddress = {
  id: number;
  address_ar: string;
  address_en: string;
  label_ar: string | null;
  label_en: string | null;
  is_active: boolean;
  order: number;
};

export type SocialLink = {
  id: number;
  platform: string;
  url: string | null;
  lucide_icon: string;
  is_active: boolean;
  order: number;
};

export type SiteSetting = {
  id: number;
  key: string;
  value_ar: string | null;
  value_en: string | null;
};

export type WhyChooseItem = {
  id: number;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  icon: string | null;
  is_active: boolean;
  order: number;
};

function appendNullableString(formData: FormData, key: string, value: string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    formData.append(key, "");
    return;
  }

  formData.append(key, value);
}

export async function adminLogin(email: string, password: string) {
  const response = await api.post<{ user: AdminUser; token: string }>("/admin/login", {
    email,
    password,
  });

  return response.data;
}

export async function getDashboardSummary() {
  const response = await api.get<{
    total_services: number;
    active_sliders: number;
    active_socials: number;
    pending_reviews: number;
  }>("/admin/dashboard/summary");

  return response.data;
}

export async function getAdminSliders() {
  const response = await api.get<{ data: AdminSlider[] }>("/admin/sliders");

  return response.data.data;
}

export async function createAdminSlider(
  slider: Pick<AdminSlider, "title_ar" | "title_en" | "subtitle_ar" | "subtitle_en" | "image" | "is_active" | "order">,
  imageFile?: File | null,
) {
  const formData = new FormData();
  appendNullableString(formData, "title_ar", slider.title_ar);
  appendNullableString(formData, "title_en", slider.title_en);
  appendNullableString(formData, "subtitle_ar", slider.subtitle_ar);
  appendNullableString(formData, "subtitle_en", slider.subtitle_en);
  formData.append("is_active", slider.is_active ? "1" : "0");
  formData.append("order", String(slider.order));

  if (imageFile) {
    formData.append("image", imageFile);
  } else {
    appendNullableString(formData, "image_url", slider.image);
  }

  const response = await api.post("/admin/sliders", formData);

  return response.data;
}

export async function updateAdminSlider(
  slider: Pick<AdminSlider, "id" | "title_ar" | "title_en" | "subtitle_ar" | "subtitle_en" | "image" | "is_active" | "order">,
  imageFile?: File | null,
) {
  const formData = new FormData();
  appendNullableString(formData, "title_ar", slider.title_ar);
  appendNullableString(formData, "title_en", slider.title_en);
  appendNullableString(formData, "subtitle_ar", slider.subtitle_ar);
  appendNullableString(formData, "subtitle_en", slider.subtitle_en);
  formData.append("is_active", slider.is_active ? "1" : "0");
  formData.append("order", String(slider.order));

  if (imageFile) {
    formData.append("image", imageFile);
  } else {
    appendNullableString(formData, "image_url", slider.image);
  }

  formData.append("_method", "PUT");

  const response = await api.post(`/admin/sliders/${slider.id}`, formData);

  return response.data;
}

export async function deleteAdminSlider(id: number) {
  await api.delete(`/admin/sliders/${id}`);
}

export async function getAdminReviews(filters: {
  status?: string;
  search?: string;
  rating?: string;
}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.rating) params.set("rating", filters.rating);

  const response = await api.get<{ data: AdminReview[] }>(`/admin/reviews?${params.toString()}`);

  return response.data.data;
}

export async function getAdminServices() {
  const response = await api.get<{ data: AdminService[] }>("/admin/services");

  return response.data.data;
}

export async function createAdminService(
  service: Pick<
    AdminService,
    "title_ar" | "title_en" | "description_ar" | "description_en" | "youtube_url" | "main_image" | "icon" | "is_active" | "order"
  >,
  imageFile?: File | null,
) {
  const formData = new FormData();
  formData.append("title_ar", service.title_ar);
  formData.append("title_en", service.title_en);
  appendNullableString(formData, "description_ar", service.description_ar);
  appendNullableString(formData, "description_en", service.description_en);
  appendNullableString(formData, "youtube_url", service.youtube_url);
  appendNullableString(formData, "icon", service.icon);
  formData.append("is_active", service.is_active ? "1" : "0");
  formData.append("order", String(service.order));

  if (imageFile) {
    formData.append("main_image", imageFile);
  } else {
    appendNullableString(formData, "main_image_url", service.main_image);
  }

  const response = await api.post("/admin/services", formData);

  return response.data;
}

export async function updateAdminService(
  service: Pick<
    AdminService,
    "id" | "title_ar" | "title_en" | "description_ar" | "description_en" | "youtube_url" | "main_image" | "icon" | "is_active" | "order"
  >,
  imageFile?: File | null,
) {
  const formData = new FormData();
  formData.append("title_ar", service.title_ar);
  formData.append("title_en", service.title_en);
  appendNullableString(formData, "description_ar", service.description_ar);
  appendNullableString(formData, "description_en", service.description_en);
  appendNullableString(formData, "youtube_url", service.youtube_url);
  appendNullableString(formData, "icon", service.icon);
  formData.append("is_active", service.is_active ? "1" : "0");
  formData.append("order", String(service.order));

  if (imageFile) {
    formData.append("main_image", imageFile);
  } else {
    appendNullableString(formData, "main_image_url", service.main_image);
  }

  formData.append("_method", "PUT");

  const response = await api.post(`/admin/services/${service.id}`, formData);

  return response.data;
}

export async function deleteAdminService(id: number) {
  await api.delete(`/admin/services/${id}`);
}

export async function uploadServiceGalleryImage(serviceId: number, imageFile: File) {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await api.post<{ data: ServiceGalleryImage }>(`/admin/services/${serviceId}/images`, formData);

  return response.data.data;
}

export async function deleteServiceGalleryImage(serviceId: number, imageId: number) {
  await api.delete(`/admin/services/${serviceId}/images/${imageId}`);
}

export async function createServiceSubService(
  serviceId: number,
  payload: Omit<AdminSubService, "id" | "service_id">,
  imageFile?: File | null,
) {
  const formData = new FormData();
  formData.append("title_ar", payload.title_ar);
  formData.append("title_en", payload.title_en);
  appendNullableString(formData, "slug", payload.slug);
  appendNullableString(formData, "subtitle_ar", payload.subtitle_ar);
  appendNullableString(formData, "subtitle_en", payload.subtitle_en);
  appendNullableString(formData, "content_ar", payload.content_ar);
  appendNullableString(formData, "content_en", payload.content_en);
  appendNullableString(formData, "youtube_url", payload.youtube_url);
  appendNullableString(formData, "details_ar", payload.details_ar);
  appendNullableString(formData, "details_en", payload.details_en);
  appendNullableString(formData, "highlights_ar", payload.highlights_ar);
  appendNullableString(formData, "highlights_en", payload.highlights_en);
  appendNullableString(formData, "cta_text_ar", payload.cta_text_ar);
  appendNullableString(formData, "cta_text_en", payload.cta_text_en);
  appendNullableString(formData, "cta_url", payload.cta_url);
  formData.append("quick_facts", JSON.stringify(payload.quick_facts ?? []));
  formData.append("is_active", payload.is_active ? "1" : "0");
  formData.append("order", String(payload.order));

  if (imageFile) {
    formData.append("cover_image_file", imageFile);
  } else {
    appendNullableString(formData, "cover_image", payload.cover_image);
  }

  const response = await api.post<{ data: AdminSubService }>(`/admin/services/${serviceId}/sub-services`, formData);
  return response.data.data;
}

export async function updateServiceSubService(
  serviceId: number,
  subServiceId: number,
  payload: Omit<AdminSubService, "id" | "service_id">,
  imageFile?: File | null,
) {
  const formData = new FormData();
  formData.append("title_ar", payload.title_ar);
  formData.append("title_en", payload.title_en);
  appendNullableString(formData, "slug", payload.slug);
  appendNullableString(formData, "subtitle_ar", payload.subtitle_ar);
  appendNullableString(formData, "subtitle_en", payload.subtitle_en);
  appendNullableString(formData, "content_ar", payload.content_ar);
  appendNullableString(formData, "content_en", payload.content_en);
  appendNullableString(formData, "youtube_url", payload.youtube_url);
  appendNullableString(formData, "details_ar", payload.details_ar);
  appendNullableString(formData, "details_en", payload.details_en);
  appendNullableString(formData, "highlights_ar", payload.highlights_ar);
  appendNullableString(formData, "highlights_en", payload.highlights_en);
  appendNullableString(formData, "cta_text_ar", payload.cta_text_ar);
  appendNullableString(formData, "cta_text_en", payload.cta_text_en);
  appendNullableString(formData, "cta_url", payload.cta_url);
  formData.append("quick_facts", JSON.stringify(payload.quick_facts ?? []));
  formData.append("is_active", payload.is_active ? "1" : "0");
  formData.append("order", String(payload.order));

  if (imageFile) {
    formData.append("cover_image_file", imageFile);
  } else {
    appendNullableString(formData, "cover_image", payload.cover_image);
  }

  formData.append("_method", "PUT");

  const response = await api.post<{ data: AdminSubService }>(`/admin/services/${serviceId}/sub-services/${subServiceId}`, formData);
  return response.data.data;
}

export async function deleteServiceSubService(serviceId: number, subServiceId: number) {
  await api.delete(`/admin/services/${serviceId}/sub-services/${subServiceId}`);
}

export async function approveReview(id: number) {
  await api.patch(`/admin/reviews/${id}/approve`);
}

export async function rejectReview(id: number, adminNotes?: string) {
  await api.patch(`/admin/reviews/${id}/reject`, {
    admin_notes: adminNotes ?? null,
  });
}

export async function deleteReview(id: number) {
  await api.delete(`/admin/reviews/${id}`);
}

export async function getCompanyBundle() {
  const response = await api.get<{
    company: CompanyRecord | null;
    phones: CompanyPhone[];
    emails: CompanyEmail[];
    addresses: CompanyAddress[];
  }>("/admin/company");

  return response.data;
}

export async function updateCompany(payload: Omit<CompanyRecord, "id">, logoFile?: File | null) {
  const formData = new FormData();
  formData.append("name_ar", payload.name_ar);
  formData.append("name_en", payload.name_en);
  appendNullableString(formData, "description_ar", payload.description_ar);
  appendNullableString(formData, "description_en", payload.description_en);
  appendNullableString(formData, "logo_url", payload.logo);
  if (logoFile) {
    formData.append("logo", logoFile);
  }
  if (payload.gps_lat !== null && payload.gps_lat !== undefined) {
    formData.append("gps_lat", String(payload.gps_lat));
  }
  if (payload.gps_lng !== null && payload.gps_lng !== undefined) {
    formData.append("gps_lng", String(payload.gps_lng));
  }

  formData.append("_method", "PUT");

  await api.post("/admin/company", formData);
}

export async function createPhone(payload: Omit<CompanyPhone, "id">) {
  await api.post("/admin/phones", payload);
}

export async function updatePhone(id: number, payload: Omit<CompanyPhone, "id">) {
  await api.put(`/admin/phones/${id}`, payload);
}

export async function deletePhone(id: number) {
  await api.delete(`/admin/phones/${id}`);
}

export async function createEmail(payload: Omit<CompanyEmail, "id">) {
  await api.post("/admin/emails", payload);
}

export async function updateEmail(id: number, payload: Omit<CompanyEmail, "id">) {
  await api.put(`/admin/emails/${id}`, payload);
}

export async function deleteEmail(id: number) {
  await api.delete(`/admin/emails/${id}`);
}

export async function createAddress(payload: Omit<CompanyAddress, "id">) {
  await api.post("/admin/addresses", payload);
}

export async function updateAddress(id: number, payload: Omit<CompanyAddress, "id">) {
  await api.put(`/admin/addresses/${id}`, payload);
}

export async function deleteAddress(id: number) {
  await api.delete(`/admin/addresses/${id}`);
}

export async function getSocialLinks() {
  const response = await api.get<{ data: SocialLink[] }>("/admin/social-links");

  return response.data.data;
}

export async function updateSocialLinks(platforms: Pick<SocialLink, "id" | "url" | "is_active" | "order">[]) {
  await api.put("/admin/social-links", {
    platforms,
  });
}

export async function getSiteSettings() {
  const response = await api.get<{ data: SiteSetting[] }>("/admin/settings");

  return response.data.data;
}

export async function updateSiteSettings(settings: Pick<SiteSetting, "key" | "value_ar" | "value_en">[]) {
  await api.put("/admin/settings", {
    settings,
  });
}

export async function uploadSectionImage(key: string, imageFile: File) {
  const formData = new FormData();
  formData.append("key", key);
  formData.append("image", imageFile);

  const response = await api.post<{ data: SiteSetting }>("/admin/settings/section-image", formData);
  return response.data.data;
}

export async function deleteSectionImage(key: string) {
  const response = await api.delete<{ data: SiteSetting }>(`/admin/settings/section-image/${key}`);
  return response.data.data;
}

export async function getWhyChooseItems() {
  const response = await api.get<{ data: WhyChooseItem[] }>("/admin/why-choose-items");

  return response.data.data;
}

export async function createWhyChooseItem(
  payload: Pick<WhyChooseItem, "title_ar" | "title_en" | "description_ar" | "description_en" | "icon" | "is_active" | "order">,
) {
  await api.post("/admin/why-choose-items", payload);
}

export async function updateWhyChooseItem(
  id: number,
  payload: Pick<WhyChooseItem, "title_ar" | "title_en" | "description_ar" | "description_en" | "icon" | "is_active" | "order">,
) {
  await api.put(`/admin/why-choose-items/${id}`, payload);
}

export async function deleteWhyChooseItem(id: number) {
  await api.delete(`/admin/why-choose-items/${id}`);
}

