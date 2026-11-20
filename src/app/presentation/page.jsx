import { ShowcasePage, ShowcaseSection, ShowcaseCards } from "@/components/showcase/ShowcasePage";

export const metadata = {
  title: "Presentation",
  description: "The problem, product and impact behind VizTutorBD.",
};

const studentAiUse = [
  { label: "Students 18+ using AI", value: 85 },
  { label: "Use AI for schoolwork", value: 83 },
  { label: "Use AI to understand topics", value: 78 },
];

function LearningPotentialFlow() {
  const steps = [
    ["Ask", "A learner asks about a confusing math idea."],
    ["Ground", "RAG finds relevant platform lessons and examples."],
    ["Explain", "The companion responds in the learner’s language and class context."],
    ["Practice", "Visual lessons and quizzes let the learner try the idea."],
  ];

  return (
    <ol className="learning-potential-flow" aria-label="AI-supported learning cycle">
      {steps.map(([title, description], index) => (
        <li className="learning-potential-step" key={title}>
          <span>0{index + 1}</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </li>
      ))}
    </ol>
  );
}

function MarketGrowthChart() {
  const bars = [
    { year: "2025 estimate", value: 8.3, x: 150, projected: false },
    { year: "2026 forecast", value: 11.4, x: 290, projected: true },
    { year: "2033 forecast", value: 57.2, x: 460, projected: true },
  ];
  const baseline = 250;
  const scale = 3.35;

  return (
    <figure className="evidence-card">
      <figcaption>
        <strong>Global AI in education market</strong>
        <span>Estimated and forecast revenue, US$ billions</span>
      </figcaption>
      <div className="chart-wrap">
        <svg
          viewBox="0 0 640 320"
          role="img"
          aria-label="AI in education market: 8.3 billion US dollars in 2025, estimated 11.4 billion in 2026, forecast 57.2 billion in 2033."
        >
          {[0, 20, 40, 60].map((tick) => {
            const y = baseline - tick * scale;
            return (
              <g key={tick}>
                <line x1="82" y1={y} x2="610" y2={y} className="chart-gridline" />
                <text x="68" y={y + 5} textAnchor="end" className="chart-axis-label">
                  ${tick}B
                </text>
              </g>
            );
          })}
          {bars.map((bar) => {
            const height = bar.value * scale;
            const y = baseline - height;
            return (
              <g key={bar.year}>
                <rect
                  x={bar.x}
                  y={y}
                  width="76"
                  height={height}
                  rx="10"
                  className={bar.projected ? "chart-bar chart-bar-forecast" : "chart-bar"}
                />
                <text x={bar.x + 38} y={y - 10} textAnchor="middle" className="chart-value">
                  ${bar.value}B
                </text>
                <text x={bar.x + 38} y="278" textAnchor="middle" className="chart-axis-label">
                  {bar.year}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="chart-callout"><b>25.9%</b><span>forecast CAGR, 2026–2033</span></div>
      <p className="chart-source">
        Source: <a href="https://www.grandviewresearch.com/industry-analysis/artificial-intelligence-ai-education-market-report" target="_blank" rel="noreferrer">Grand View Research, AI in Education Market, updated June 2026</a>.
        This is a global category estimate, not Bangladesh’s addressable market or VizTutorBD revenue.
      </p>
    </figure>
  );
}

function StudentDemandChart() {
  return (
    <figure className="evidence-card">
      <figcaption>
        <strong>Student AI use is already common</strong>
        <span>Share of surveyed students, ages 18+</span>
      </figcaption>
      <div className="chart-wrap">
        <svg
          viewBox="0 0 640 250"
          role="img"
          aria-label="In a 21-country survey, 85 percent of students aged 18 or older used AI, 83 percent used it for schoolwork, and 78 percent used it to understand complex topics."
        >
          {studentAiUse.map((item, index) => {
            const y = 44 + index * 66;
            return (
              <g key={item.label}>
                <text x="8" y={y + 5} className="chart-axis-label">{item.label}</text>
                <rect x="310" y={y - 14} width="250" height="22" rx="11" className="chart-track" />
                <rect x="310" y={y - 14} width={250 * item.value / 100} height="22" rx="11" className="chart-bar chart-bar-forecast" />
                <text x="576" y={y + 5} className="chart-value">{item.value}%</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="chart-source">
        Source: <a href="https://blog.google/products-and-platforms/products/education/our-life-with-ai-2025/" target="_blank" rel="noreferrer">Google and Ipsos, Our Life with AI survey</a> (21 countries; 21,000 participants overall).
        This is an adoption signal, not a Bangladesh K–12 or willingness-to-pay survey.
      </p>
    </figure>
  );
}

export default function PresentationPage() {
  return (
    <ShowcasePage
      kicker="PROJECT PRESENTATION"
      title="Math that students can see and use"
      intro="VizTutorBD is a visual math tutor built for Bangladeshi learners, with interactive lessons and explanations in Bangla and English."
    >
      <ShowcaseSection title="The learning gap">
        <p>
          Learning breaks progressively as students move through school: the
          supplied project brief reports 83.7% completion of primary, 69.3% of
          lower secondary and 43.9% of class 10. Its cited NSA 2022 result says
          about 70% of class 5 students are below grade level in math. These
          indicators show a need for stronger foundational math support.
        </p>
      </ShowcaseSection>

      <ShowcaseSection title="AI learning potential">
        <p>
          AI can make support more responsive: a learner asks, the tutor uses
          relevant lesson material, explains the idea, then guides the learner
          into practice. VizTutorBD combines a grounded companion with visual
          lessons and quizzes in Bangla and English.
        </p>
        <LearningPotentialFlow />
        <p className="showcase-note">
          This is a product opportunity, not a claim of proven learning gains.
          A school pilot should measure outcomes against a baseline.
        </p>
      </ShowcaseSection>

      <ShowcaseSection title="Market growth and student demand">
        <div className="presentation-evidence-grid">
          <MarketGrowthChart />
          <StudentDemandChart />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="What we are building">
        <p>
          Students manipulate blocks, number lines and balance scales, then
          connect each concept to everyday situations such as money, time and
          measurement. A bilingual robot companion guides learners through
          short lessons with three difficulty levels.
        </p>
        <ShowcaseCards
          items={[
            ["See it", "Tap, drag and watch visual models change as learners explore a concept."],
            ["Hear it", "A friendly companion explains in Bangla and English."],
            ["Use it", "Each lesson connects math to familiar real-life situations."],
          ]}
        />
      </ShowcaseSection>

      <ShowcaseSection title="Who it serves and how we will grow">
        <p>
          We begin with class 4, with 72 planned interactive lessons across 11
          chapters, then intend to expand class by class through class 10. The
          brief identifies 19.7 million primary students as the broad education
          context, not as a reachable customer count. A school pilot should
          measure learner confidence and math outcomes before expansion.
        </p>
      </ShowcaseSection>

      <p className="showcase-note">
        Figures and product scope are taken from the supplied presentation
        brief. The brief notes that math anxiety and math-caused dropout are not
        measured nationally; those should be treated as pilot questions, not
        established statistics.
      </p>
    </ShowcasePage>
  );
}
