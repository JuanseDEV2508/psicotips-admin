const fallbackApiUrl = "http://localhost:8000";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;

export function getApiUrl(): string | null {
  try {
    const url = new URL(API_URL);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.origin
      : null;
  } catch {
    return null;
  }
}
