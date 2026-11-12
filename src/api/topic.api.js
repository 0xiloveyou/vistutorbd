import apiClient from "@/lib/apiClient";

export async function getTopics(query = {}) {
  const response = await apiClient("/topics", { query, cache: "no-store" });
  return { topics: response.data, meta: response.meta };
}

export async function getTopic(slug, query = {}) {
  const response = await apiClient(`/topics/${slug}`, { query, cache: "no-store" });
  return response.data;
}

export async function createTopic(payload) {
  const response = await apiClient("/topics", { method: "POST", body: payload });
  return response.data;
}

export async function updateTopic(id, payload) {
  const response = await apiClient(`/topics/${id}`, {
    method: "PUT",
    body: payload,
  });
  return response.data;
}

export async function deleteTopic(id) {
  const response = await apiClient(`/topics/${id}`, { method: "DELETE" });
  return response.data;
}