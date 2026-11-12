import PracticeShell from "@/components/PracticeShell";
import { serverGet } from "@/lib/serverApi";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { chapter } = await params;
  return { title: `Practice · ${chapter}` };
}

export default async function PracticePage({ params }) {
  const { chapter: chapterId } = await params;
  const chapter = await serverGet(`/taxonomy/chapters/${chapterId}`);

  if (!chapter) notFound();

  return <PracticeShell chapter={chapter} />;
}