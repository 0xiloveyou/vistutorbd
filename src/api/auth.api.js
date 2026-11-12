import apiClient from "@/lib/apiClient";

export function userLogin(payload) {
  return apiClient("/auth/login", { method: "POST", body: payload });
}

export function userRegistration(payload) {
  return apiClient("/auth/register", { method: "POST", body: payload });
}

export function verifyAccount(payload) {
  return apiClient("/auth/verify-email", { method: "POST", body: payload });
}

export function userLogout() {
  return apiClient("/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiClient("/auth/me");
}

export function googleOAuth(payload) {
  return apiClient("/auth/google", { method: "POST", body: payload });
}

export function googleStart() {
  return apiClient("/auth/google/start");
}

export function googleCallback(payload) {
  return apiClient("/auth/google/callback", { method: "POST", body: payload });
}

export function forgotPassword(payload) {
  return apiClient("/auth/forgot-password", { method: "POST", body: payload });
}

export function resetPassword(payload) {
  return apiClient("/auth/reset-password", { method: "POST", body: payload });
}