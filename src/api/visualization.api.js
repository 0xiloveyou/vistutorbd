import apiClient from "@/lib/apiClient";

export async function getVisualizations(query = {}) {
  const response = await apiClient("/visualizations", {
    query,
    cache: "no-store",
  });
  return { visualizations: response.data, meta: response.meta };
}

export async function getVisualization(vizId, query = {}) {
  const response = await apiClient(`/visualizations/${vizId}`, {
    query,
    cache: "no-store",
  });
  return response.data;
}

export async function createVisualization(payload) {
  const response = await apiClient("/visualizations", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function updateVisualization(vizId, payload) {
  const response = await apiClient(`/visualizations/${vizId}`, {
    method: "PUT",
    body: payload,
  });
  return response.data;
}

export async function deleteVisualization(vizId) {
  const response = await apiClient(`/visualizations/${vizId}`, {
    method: "DELETE",
  });
  return response.data;
}