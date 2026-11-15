import apiClient from "@/lib/apiClient";

export async function getLearnCarousels(query = {}) {
  const response = await apiClient("/learn/carousels", {
    query,
    cache: "no-store",
  });
  return response.data;
}

export async function getLearnCarousel(slug) {
  const response = await apiClient(`/learn/carousels/${slug}`, {
    cache: "no-store",
  });
  return response.data;
}
