import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/my-company-4/backend/public/api",
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use((response) => {
  function transformImages(data: any): any {
    if (!data) return data;
    if (Array.isArray(data)) return data.map(transformImages);
    if (typeof data === 'object') {
      const mapped: any = {};
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost/my-company-4/backend/public/api';
      for (const k in data) {
        if (typeof data[k] === 'string') {
          const storageMatch = data[k].match(/\/storage\/(.+)$/);
          if (storageMatch) {
            mapped[k] = `${apiBase}/public/media/${storageMatch[1]}`;
            continue;
          }
        }

        if (typeof data[k] === 'string') {
          mapped[k] = data[k];
        } else {
          mapped[k] = transformImages(data[k]);
        }
      }
      return mapped;
    }
    return data;
  }
  if (response.data) {
    response.data = transformImages(response.data);
  }
  return response;
});
