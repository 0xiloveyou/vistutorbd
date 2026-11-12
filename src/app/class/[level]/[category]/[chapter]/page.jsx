import ChapterView from "@/components/ChapterView";
import { serverGet } from "@/lib/serverApi";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { chapter } = await params;
  return { title: chapter };
}

export default async function ChapterPage({ params }) {
  const { level: levelId, category: categorySlug, chapter: chapterSlug } =
    await params;

  const level = await serverGet(`/taxonomy/levels/${levelId}`);
  if (!level) notFound();

  const categories =
    (await serverGet(`/taxonomy/categories?classLevelId=${levelId}`)) ?? [];
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) notFound();

  const chapters =
    (await serverGet(`/taxonomy/chapters?categoryId=${category.id}`)) ?? [];
  const chapter = chapters.find((item) => item.slug === chapterSlug);
  if (!chapter) notFound();

  const topics = (await serverGet(`/topics?chapterId=${chapter.id}&limit=50`)) ?? [];

  return (
    <ChapterView
      level={level}
      category={category}
      chapter={chapter}
      topics={topics}
    />
  );
}