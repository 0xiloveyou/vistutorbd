import apiClient from "@/lib/apiClient";

export async function getBookmarks() {
  const response = await apiClient("/user-state/bookmarks");
  return response.data;
}

export async function addBookmark(topicId) {
  const response = await apiClient("/user-state/bookmarks", {
    method: "POST",
    body: { topicId },
  });
  return response.data;
}

export async function removeBookmark(topicId) {
  const response = await apiClient(`/user-state/bookmarks/${topicId}`, {
    method: "DELETE",
  });
  return response.data;
}

export async function getProgress(chapterId) {
  const response = await apiClient("/user-state/progress", {
    query: chapterId ? { chapterId } : {},
  });
  return response.data;
}

export async function saveProgress(topicId, payload) {
  const response = await apiClient(`/user-state/progress/${topicId}`, {
    method: "PUT",
    body: payload,
  });
  return response.data;
}

export async function savePreferences(payload) {
  const response = await apiClient("/user-state/preferences", {
    method: "PATCH",
    body: payload,
  });
  return response.data;
}