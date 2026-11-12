import apiClient from "@/lib/apiClient";

export async function getBands(query = {}) {
  const response = await apiClient("/taxonomy/bands", { query, cache: "no-store" });
  return response.data;
}

export async function getLevels(bandId) {
  const response = await apiClient("/taxonomy/levels", {
    query: bandId ? { bandId } : {},
  });
  return response.data;
}

export async function getLevel(id) {
  const response = await apiClient(`/taxonomy/levels/${id}`);
  return response.data;
}

export async function getCategories(query = {}) {
  const response = await apiClient("/taxonomy/categories", { query });
  return response.data;
}

export async function getCategory(id) {
  const response = await apiClient(`/taxonomy/categories/${id}`);
  return response.data;
}

export async function createCategory(payload) {
  const response = await apiClient("/taxonomy/categories", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function updateCategory(id, payload) {
  const response = await apiClient(`/taxonomy/categories/${id}`, {
    method: "PUT",
    body: payload,
  });
  return response.data;
}

export async function deleteCategory(id) {
  const response = await apiClient(`/taxonomy/categories/${id}`, {
    method: "DELETE",
  });
  return response.data;
}

export async function getChapters(query = {}) {
  const response = await apiClient("/taxonomy/chapters", { query });
  return response.data;
}

export async function getChapter(id) {
  const response = await apiClient(`/taxonomy/chapters/${id}`);
  return response.data;
}

export async function createChapter(payload) {
  const response = await apiClient("/taxonomy/chapters", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function updateChapter(id, payload) {
  const response = await apiClient(`/taxonomy/chapters/${id}`, {
    method: "PUT",
    body: payload,
  });
  return response.data;
}

export async function deleteChapter(id) {
  const response = await apiClient(`/taxonomy/chapters/${id}`, {
    method: "DELETE",
  });
  return response.data;
}