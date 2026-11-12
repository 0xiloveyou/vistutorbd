import ClassView from "@/components/ClassView";
import { serverGet } from "@/lib/serverApi";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { level } = await params;
  return { title: `Class ${level}` };
}

export default async function ClassPage({ params }) {
  const { level: levelId } = await params;
  const level = await serverGet(`/taxonomy/levels/${levelId}`);

  if (!level) notFound();

  const categories = (await serverGet(`/taxonomy/categories?classLevelId=${levelId}`)) ?? [];

  const withChapters = await Promise.all(
    categories.map(async (category) => {
      const chapters = (await serverGet(`/taxonomy/chapters?categoryId=${category.id}`)) ?? [];
      return { ...category, chapters };
    }),
  );

  return <ClassView level={level} categories={withChapters} />;
}