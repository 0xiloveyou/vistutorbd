import TopicDetail from "@/components/TopicDetail";
import { serverGet } from "@/lib/serverApi";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const topic = await serverGet(`/topics/${slug}`);
  const title = topic?.title?.en ?? slug;
  return { title, description: topic?.summary?.en ?? undefined };
}

export default async function TopicPage({ params }) {
  const { slug } = await params;
  const topic = await serverGet(`/topics/${slug}`);

  if (!topic) notFound();

  return <TopicDetail topic={topic} />;
}