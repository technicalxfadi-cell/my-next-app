import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDirection(locale: string) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/second/backend/public/api';
  const publicBase = apiBase.replace('/api', '');
  return `${publicBase}${path.startsWith('/') ? path : '/' + path}`;
}

function parseYouTubeStart(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  const match = trimmed.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const total = hours * 3600 + minutes * 60 + seconds;

  return total > 0 ? total : null;
}

export function getYouTubeEmbedUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) {
    return null;
  }

  const input = rawUrl.trim();
  if (!input) {
    return null;
  }

  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = url.pathname;

    let videoId: string | null = null;
    let start = parseYouTubeStart(url.searchParams.get("start") ?? url.searchParams.get("t"));

    if (host === "youtu.be") {
      videoId = path.split("/").filter(Boolean)[0] ?? null;
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (path === "/watch") {
        videoId = url.searchParams.get("v");
      } else if (path.startsWith("/embed/")) {
        videoId = path.split("/")[2] ?? null;
      } else if (path.startsWith("/shorts/")) {
        videoId = path.split("/")[2] ?? null;
      } else if (path.startsWith("/live/")) {
        videoId = path.split("/")[2] ?? null;
      }
    }

    if (!videoId) {
      return input;
    }

    const cleanedId = videoId.replace(/[^A-Za-z0-9_-]/g, "");
    if (!cleanedId) {
      return input;
    }

    const base = `https://www.youtube.com/embed/${cleanedId}`;
    return start ? `${base}?start=${start}` : base;
  } catch {
    const fallbackMatch = input.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{6,})/i);
    if (!fallbackMatch) {
      return input;
    }

    return `https://www.youtube.com/embed/${fallbackMatch[1]}`;
  }
}
