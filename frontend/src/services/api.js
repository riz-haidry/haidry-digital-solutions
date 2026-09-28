const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:5000/api"
).replace(/\/$/, "");

export function resolveMediaUrl(mediaUrl) {
  if (!mediaUrl) return "";
  if (/^https?:\/\//i.test(mediaUrl)) return mediaUrl;
  return `${API_URL.replace(/\/api$/, "")}${mediaUrl.startsWith("/") ? "" : "/"}${mediaUrl}`;
}

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers ?? {});
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.message ?? `Request failed (${response.status})`);
  return result;
}

export const submitInquiry = (payload) =>
  apiRequest("/inquiries", { method: "POST", body: JSON.stringify(payload) });
