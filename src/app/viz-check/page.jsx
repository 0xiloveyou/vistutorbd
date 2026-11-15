import { serverGet } from "@/lib/serverApi";
import { RENDERERS } from "@/viz/renderers";

export const dynamic = "force-dynamic";

function sampleByRenderer(items, perRenderer = 4) {
  const groups = new Map();
  for (const item of items) {
    const renderer = item.renderer ?? "unknown";
    if (!groups.has(renderer)) groups.set(renderer, []);
    groups.get(renderer).push(item);
  }

  const sample = [];
  for (const group of groups.values()) {
    const step = Math.max(1, Math.ceil(group.length / perRenderer));
    for (let index = 0; index < group.length && sample.length < 1000; index += step) {
      sample.push(group[index]);
    }
  }
  return sample;
}

export default async function VizCheckPage() {
  const [band910, band1112] = await Promise.all([
    serverGet("/visualizations?band=C9_10&all=true&limit=500"),
    serverGet("/visualizations?band=C11_12&all=true&limit=800"),
  ]);

  const items = [...(band910 ?? []), ...(band1112 ?? [])].filter((viz) =>
    /^viz\.(class-10|class-11)\./.test(viz.vizId ?? ""),
  );
  const sample = sampleByRenderer(items, 4);
  const specs = await Promise.all(
    sample.map((viz) => serverGet(`/visualizations/${viz.vizId}`)),
  );

  return (
    <main style={{ padding: 24 }}>
      <h1>
        Viz check — {sample.length} specs from {items.length} class 10/11 visualizations
      </h1>
      {specs.map((viz) => {
        if (!viz) return null;
        const spec = viz.spec ?? {};
        const step = spec.steps?.[0] ?? {};
        const Renderer =
          RENDERERS[spec.renderer ?? viz.renderer] ?? RENDERERS.placeholder;
        return (
          <section key={viz.vizId} data-viz={viz.vizId} style={{ marginBottom: 40 }}>
            <h3>
              {viz.vizId} — {spec.renderer ?? viz.renderer} — {spec.data?.mode}
            </h3>
            <Renderer
              spec={{
                ...spec,
                renderer: spec.renderer ?? viz.renderer,
                title: spec.title ?? viz.title,
              }}
              step={step}
              lang="en"
            />
          </section>
        );
      })}
    </main>
  );
}
