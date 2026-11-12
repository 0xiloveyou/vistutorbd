"use client";

import {
  addBookmark,
  askCompanion,
  deleteUser,
  generateQuiz,
  getBookmarks,
  getModerationReports,
  getProgress,
  getQuestionTemplates,
  getQuizAttempts,
  getQuizConfig,
  listUsers,
  removeBookmark,
  savePreferences,
  saveProgress,
  saveQuizConfig,
  submitQuizAttempt,
  updateModerationReport,
  updateUser,
} from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBookmarks(enabled = true) {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
    enabled,
    staleTime: 30_000,
  });
}

export function useAddBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBookmark,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}

export function useRemoveBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeBookmark,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}

export function useSaveProgress() {
  return useMutation({
    mutationFn: ({ topicId, payload }) => saveProgress(topicId, payload),
  });
}

export function useProgress(chapterId, enabled = true) {
  return useQuery({
    queryKey: ["progress", chapterId ?? "all"],
    queryFn: () => getProgress(chapterId),
    enabled,
    staleTime: 30_000,
  });
}

export function useSavePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savePreferences,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
  });
}

export function useQuizConfig(chapterId, enabled = true) {
  return useQuery({
    queryKey: ["quiz-config", chapterId],
    queryFn: () => getQuizConfig(chapterId),
    enabled: Boolean(chapterId) && enabled,
    retry: false,
  });
}

export function useSaveQuizConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveQuizConfig,
    onSuccess: (data) =>
      queryClient.invalidateQueries({
        queryKey: ["quiz-config", data?.chapterId],
      }),
  });
}

export function useGenerateQuiz() {
  return useMutation({ mutationFn: generateQuiz });
}

export function useSubmitAttempt() {
  return useMutation({ mutationFn: submitQuizAttempt });
}

export function useQuizAttempts(chapterId, enabled = true) {
  return useQuery({
    queryKey: ["quiz-attempts", chapterId ?? "all"],
    queryFn: () => getQuizAttempts(chapterId ? { chapterId } : {}),
    enabled,
    staleTime: 10_000,
  });
}

export function useAskCompanion() {
  return useMutation({ mutationFn: askCompanion });
}

export function useQuestionTemplates(enabled = true) {
  return useQuery({
    queryKey: ["question-templates"],
    queryFn: () => getQuestionTemplates(),
    enabled,
    staleTime: 30_000,
  });
}

export function useUsers(query = {}, enabled = true) {
  return useQuery({
    queryKey: ["users", query],
    queryFn: () => listUsers(query),
    enabled,
    staleTime: 15_000,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useModerationReports(status, enabled = true) {
  return useQuery({
    queryKey: ["moderation-reports", status ?? "all"],
    queryFn: () => getModerationReports(status ? { status } : {}),
    enabled,
    staleTime: 10_000,
  });
}

export function useUpdateModerationReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateModerationReport(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["moderation-reports"] }),
  });
}