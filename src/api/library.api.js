import apiClient from "@/lib/apiClient";

export async function getLibraryClasses() {
  const response = await apiClient("/library/classes", { cache: "no-store" });
  return response.data;
}

export async function getLibraryChapters(classId) {
  const response = await apiClient(`/library/classes/${classId}/chapters`, {
    cache: "no-store",
  });
  return response.data;
}

export async function getLibraryChapter(chapterId) {
  const response = await apiClient(`/library/chapters/${chapterId}`, {
    cache: "no-store",
  });
  return response.data;
}

export async function getLibraryVisualization(chapterId) {
  const response = await apiClient(
    `/library/chapters/${chapterId}/visualization`,
    { cache: "no-store" },
  );
  return response.data;
}
