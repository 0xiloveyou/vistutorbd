"use client";

export default function PlaceholderRenderer({ step, lang }) {
  const highlights = step?.highlight ?? [];

  return (
    <div className="viz-placeholder" role="img" aria-label="Visualization preview">
      <div className="viz-placeholder-grid" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} data-state={highlights[index]?.state ?? "idle"} />
        ))}
      </div>
      <p>
        {step?.narration?.[lang] ||
          "The renderer shell is ready. A visualization spec will draw here."}
      </p>
      {highlights.length > 0 ? (
        <ul className="viz-highlights">
          {highlights.map((highlight, index) => (
            <li key={`${highlight.target}-${index}`}>
              <span className={`state-dot state-${highlight.state}`} />
              {highlight.target} · {highlight.state}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}