import { ofetch } from "ofetch";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const apiClient = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
});

export function apiErrorMessage(error, fallback = "Request failed.") {
  return (
    error?.data?.message ||
    error?.data?.error ||
    error?.message ||
    fallback
  );
}

export default apiClient;
