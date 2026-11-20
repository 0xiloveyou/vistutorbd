import Link from "next/link";

const links = [
  ["/app", "Open the app", "Try visual lessons, practice and the bilingual AI companion."],
  ["/presentation", "Presentation", "The learning gap and the VizTutorBD response."],
  ["/pitchdeck", "Pitch deck", "Market, product, rollout and business model."],
  ["/architecture", "Architecture", "How the web app, API, data and AI services connect."],
  ["/data", "Data", "Content, ingestion, APIs and data boundaries."],
  ["/security", "Security", "Authentication, roles and privacy controls."],
];

export function ShowcaseHome() {
  return <main className="showcase"><section className="showcase-hero"><span className="showcase-kicker">JUDGE TOUR · VISTUTORBD</span><h1>See the math.<br/>Use the math.</h1><p>Interactive, bilingual math learning for Bangladesh. Start with the live product or explore the project brief.</p><div className="showcase-actions"><Link className="btn btn-primary" href="/learn">Explore the app</Link><Link className="btn" href="/demo-user">Enter as demo learner</Link><Link className="btn" href="/demo-admin">Enter as demo admin</Link></div></section><section className="showcase-grid">{links.map(([href,title,body])=><Link className="showcase-card" href={href} key={href}><span>↗</span><h2>{title}</h2><p>{body}</p></Link>)}<Link className="showcase-card" href="/admin"><span>↗</span><h2>Admin console</h2><p>Manage users, roles and available platform controls.</p></Link></section></main>;
}

export function ShowcasePage({ kicker, title, intro, children }) {
  return <main className="showcase showcase-document"><header className="showcase-pagehead"><span className="showcase-kicker">{kicker}</span><h1>{title}</h1><p>{intro}</p></header>{children}</main>;
}

export function ShowcaseSection({ title, children }) {
  return <section className="showcase-section"><h2>{title}</h2>{children}</section>;
}

export function ShowcaseCards({ items }) {
  return <div className="showcase-grid">{items.map(([title,body])=><article className="showcase-card" key={title}><h3>{title}</h3><p>{body}</p></article>)}</div>;
}
