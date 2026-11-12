import apiClient from "@/lib/apiClient";

export async function getQuizConfig(chapterId) {
  const response = await apiClient("/quiz/config", { query: { chapterId } });
  return response.data;
}

export async function saveQuizConfig(payload) {
  const response = await apiClient("/quiz/config", {
    method: "PUT",
    body: payload,
  });
  return response.data;
}

export async function generateQuiz(payload) {
  const response = await apiClient("/quiz/generate", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function submitQuizAttempt(payload) {
  const response = await apiClient("/quiz/attempts", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function getQuizAttempts(query = {}) {
  const response = await apiClient("/quiz/attempts", { query });
  return response.data;
}

export async function getQuestionTemplates(query = {}) {
  const response = await apiClient("/quiz/templates", { query });
  return response.data;
}