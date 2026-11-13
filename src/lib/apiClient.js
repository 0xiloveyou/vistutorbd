import { ofetch } from "ofetch";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const apiClient = ofetch.create({
  baseURL: API_BASE_URL,
  credentials: "include",
  // The chat fallback chain is capped at 75 s on the backend; leave headroom so
  // a hung connection surfaces as an error instead of spinning forever.
  timeout: 120_000,
});

const NETWORK_ERROR =
  /failed to fetch|fetch failed|networkerror|network error|load failed|econnrefused|econnreset|timed out/i;

export function apiErrorMessage(error, fallback = "Request failed.") {
  const message = error?.data?.message || error?.data?.error || error?.message;
  const raw = String(error?.message ?? "");

  if (error?.name === "FetchError" || NETWORK_ERROR.test(raw)) {
    return "Could not reach the server. Check your connection and that the backend is running, then try again.";
  }

  if (Array.isArray(message)) return message.join(" ");
  if (typeof message === "string" && message.trim()) return message;

  return fallback;
}

export default apiClient;
