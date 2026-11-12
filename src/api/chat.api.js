import apiClient from "@/lib/apiClient";

export async function askCompanion(payload) {
  const response = await apiClient("/chat/messages", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function analyzeProblemImage(payload) {
  const response = await apiClient("/chat/image-problem", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function getChatSessions() {
  const response = await apiClient("/chat/sessions");
  return response.data;
}

export async function getChatSession(id) {
  const response = await apiClient(`/chat/sessions/${id}`);
  return response.data;
}