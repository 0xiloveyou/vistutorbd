import apiClient from "@/lib/apiClient";

export async function searchKnowledge(query = {}) {
  const response = await apiClient("/knowledge/search", { query });
  return response.data;
}

export async function getKnowledgeChunks(query = {}) {
  const response = await apiClient("/knowledge/chunks", { query });
  return response.data;
}

export async function ingestKnowledgeChunk(payload) {
  const response = await apiClient("/knowledge/chunks", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function reindexTopic(topicId) {
  const response = await apiClient(`/knowledge/reindex/topic/${topicId}`, {
    method: "POST",
  });
  return response.data;
}

export async function deleteKnowledgeChunk(id) {
  const response = await apiClient(`/knowledge/chunks/${id}`, {
    method: "DELETE",
  });
  return response.data;
}