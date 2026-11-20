import apiClient from "@/lib/apiClient";

export async function getPublicAnalyticsStats() {
  const response = await apiClient("/analytics/public-stats", {
    cache: "no-store",
  });
  return response.data;
}
