import apiClient from "@/lib/apiClient";

export async function listUsers(query = {}) {
  const response = await apiClient("/user", { query, cache: "no-store" });
  return { users: response.data, meta: response.meta };
}

export async function updateUser(id, payload) {
  const response = await apiClient(`/user/${id}`, {
    method: "PATCH",
    body: payload,
  });
  return response.data;
}

export async function deleteUser(id) {
  const response = await apiClient(`/user/${id}`, { method: "DELETE" });
  return response.data;
}
