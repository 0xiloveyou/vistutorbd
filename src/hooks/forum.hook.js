"use client";

import {
  askForumPostAi,
  createForumComment,
  createForumPost,
  getForumPosts,
  getForumTags,
} from "@/api";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export function useForumPosts(params) {
  return useInfiniteQuery({
    queryKey: ["forum-posts", params],
    queryFn: ({ pageParam }) => getForumPosts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = lastPage?.meta?.page ?? 1;
      const totalPages = lastPage?.meta?.totalPages ?? 1;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 15_000,
  });
}

export function useForumTags() {
  return useQuery({
    queryKey: ["forum-tags"],
    queryFn: getForumTags,
    staleTime: 60_000,
  });
}

export function useCreateForumPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createForumPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      queryClient.invalidateQueries({ queryKey: ["forum-tags"] });
    },
  });
}

export function useCreateForumComment(postId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createForumComment(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      queryClient.invalidateQueries({ queryKey: ["forum-post", postId] });
    },
  });
}

export function useAskForumAi(postId) {
  return useMutation({
    mutationFn: (payload) => askForumPostAi(postId, payload),
  });
}
