const isRecord = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/**
 * The API stores the player data inside `visualization.spec` (see
 * docs/api/visualizations.md) while the player and renderers expect the
 * frames at the top level. Normalise both shapes into one flat object so
 * lesson content keeps rendering no matter which shape reaches the client.
 */
export function normalizeVizSpec(raw) {
  if (!isRecord(raw)) return raw ?? null;

  const inner = isRecord(raw.spec) ? raw.spec : {};
  const innerData = isRecord(inner.data) ? inner.data : {};
  const rawData = isRecord(raw.data) ? raw.data : {};

  return {
    ...inner,
    ...raw,
    kind: raw.kind ?? inner.kind,
    renderer: raw.renderer ?? inner.renderer,
    title: raw.title ?? inner.title,
    summary: raw.summary ?? inner.summary,
    data: { ...innerData, ...rawData },
    steps: Array.isArray(raw.steps)
      ? raw.steps
      : Array.isArray(inner.steps)
        ? inner.steps
        : [],
    spec: inner,
  };
}
