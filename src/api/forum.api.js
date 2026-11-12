import apiClient from "@/lib/apiClient";

export async function getForumPosts(params = {}) {
  const response = await apiClient("/forum/posts", { query: params });
  return { posts: response.data, meta: response.meta };
}

export async function getForumPost(id) {
  const response = await apiClient(`/forum/posts/${id}`);
  return response.data;
}

export async function getForumTags() {
  const response = await apiClient("/forum/tags");
  return response.data;
}

export async function createForumPost(payload) {
  const response = await apiClient("/forum/posts", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function createForumComment(id, payload) {
  const response = await apiClient(`/forum/posts/${id}/comments`, {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function askForumPostAi(id, payload = {}) {
  const response = await apiClient(`/forum/posts/${id}/ask-ai`, {
    method: "POST",
    body: payload,
  });
  return response.data;
}
