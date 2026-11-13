import SearchView from "@/components/SearchView";
import { serverGet, serverGetWithMeta } from "@/lib/serverApi";

export const metadata = {
  title: "Search topics",
  description:
    "Search every published VizTutorBD math topic and filter the results by class.",
};

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const classLevelId =
    typeof params.classLevelId === "string" ? params.classLevelId.trim() : "";
  const page = Math.max(1, Number.parseInt(String(params.page ?? "1"), 10) || 1);

  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", "9");
  if (q) query.set("q", q);
  if (classLevelId) query.set("classLevelId", classLevelId);

  const [bands, result] = await Promise.all([
    serverGet("/taxonomy/bands"),
    serverGetWithMeta(`/topics?${query.toString()}`),
  ]);

  return (
    <SearchView
      bands={bands ?? []}
      q={q}
      classLevelId={classLevelId}
      page={page}
      topics={result.data ?? []}
      meta={result.meta}
    />
  );
}
