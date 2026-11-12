import apiClient from "@/lib/apiClient";

export async function getModerationReports(query = {}) {
  const response = await apiClient("/moderation/reports", { query });
  return response.data;
}

export async function createModerationReport(payload) {
  const response = await apiClient("/moderation/reports", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function updateModerationReport(id, payload) {
  const response = await apiClient(`/moderation/reports/${id}`, {
    method: "PATCH",
    body: payload,
  });
  return response.data;
}

export async function getSystemLogs(query = {}) {
  const response = await apiClient("/moderation/logs", { query });
  return response.data;
}
