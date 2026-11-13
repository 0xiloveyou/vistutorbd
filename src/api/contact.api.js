import apiClient from "@/lib/apiClient";

export async function sendContactMessage(payload) {
  const response = await apiClient("/contact", {
    method: "POST",
    body: payload,
  });
  return response.data;
}
