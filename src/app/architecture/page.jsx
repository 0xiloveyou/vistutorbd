import { ShowcasePage, ShowcaseSection } from "@/components/showcase/ShowcasePage";

export const metadata = { title: "System architecture" };

const ragIngestion = [
  {
    title: "Learning content",
    detail: "Topic titles, summaries and lesson blocks in English and Bangla.",
  },
  {
    title: "Knowledge chunks",
    detail: "Content is split into concept, step and formula records with class and topic metadata.",
  },
  {
    title: "Embeddings",
    detail: "Each chunk gets a vector and records which embedding model created it.",
  },
  {
    title: "MongoDB",
    detail: "KnowledgeChunk stores the text, vector, language and metadata used for retrieval.",
  },
];

const ragAnswer = [
  {
    title: "Learner question",
    detail: "The chat request may include the selected class, language, topic, chapter or visualization step.",
  },
  {
    title: "Build context",
    detail: "The API adds matching topic, visualization and available chapter figure briefs.",
  },
  {
    title: "Find candidates",
    detail: "The query vector and metadata filters select up to 500 recent active knowledge chunks.",
  },
  {
    title: "Rank by similarity",
    detail: "The backend computes cosine similarity locally and keeps the top five chunks.",
  },
  {
    title: "Grounded answer",
    detail: "OpenRouter receives the question and retrieved context as data; a grounded extract is used if chat completion fails.",
  },
];

function Flow({ steps, label }) {
  return (
    <ol className="rag-flow" aria-label={label}>
      {steps.map((step, index) => (
        <li className="rag-stage" key={step.title}>
          <span>Step {index + 1}</span>
          <h3>{step.title}</h3>
          <p>{step.detail}</p>
        </li>
      ))}
    </ol>
  );
}

export default function ArchitecturePage() {
  return (
    <ShowcasePage
      kicker="TECHNICAL ARCHITECTURE"
      title="A web client backed by learning APIs"
      intro="The product separates the interactive learner experience from the API and persistence layer. The companion uses a retrieval-augmented generation workflow to ground answers in platform content."
    >
      <div className="architecture-diagram">
        <div>
          <b>Student / teacher / admin</b>
          <small>Browser · responsive web</small>
        </div>
        <i>↓</i>
        <div>
          <b>Next.js 15 · React 19</b>
          <small>Lessons · practice · forum · role dashboards</small>
        </div>
        <i>↓ REST · session cookies</i>
        <div>
          <b>Express / TypeScript API</b>
          <small>Auth · content · quiz · analytics · chat · moderation</small>
        </div>
        <i>↓ Prisma</i>
        <div>
          <b>MongoDB</b>
          <small>Accounts · content · progress · knowledge chunks · activity</small>
        </div>
        <i>↔</i>
        <div>
          <b>External integrations</b>
          <small>OpenRouter · optional Google Identity · email services</small>
        </div>
      </div>

      <ShowcaseSection title="RAG knowledge indexing">
        <p>
          An admin can reindex a topic. The backend turns its English and Bangla
          title, summary and lesson blocks into knowledge chunks, embeds each
          chunk, then stores its text, vector and metadata in MongoDB.
        </p>
        <Flow steps={ragIngestion} label="Knowledge indexing flow" />
        <p className="rag-note">
          Embeddings use OpenRouter when <code>EMBEDDING_PROVIDER=openrouter</code>
           and an API key is configured. Otherwise the current default is a
          deterministic local hash embedding.
        </p>
      </ShowcaseSection>

      <ShowcaseSection title="Question retrieval and answer">
        <p>
          When a learner asks the companion, the API gathers any selected lesson
          context, embeds the question, finds matching chunks and sends the
          strongest context to the chat model.
        </p>
        <Flow steps={ragAnswer} label="RAG question and answer flow" />
        <p className="rag-note">
          Retrieval currently uses Prisma to fetch up to 500 recent,
          metadata-matched chunks, then ranks them with application-side cosine
          similarity and keeps five. It does not use MongoDB Atlas Vector Search.
          The prompt treats retrieved text as data and tells the model to stay
          grounded; if chat completion fails, the API returns a short extract
          from the stored context.
        </p>
      </ShowcaseSection>

      <ShowcaseSection title="Deployment">
        <p>
          The frontend and backend are separately deployable services.
          Production URLs, MongoDB, cookie security, embedding provider, chat
          model, email and Google sign-in are controlled by environment
          configuration.
        </p>
      </ShowcaseSection>
    </ShowcasePage>
  );
}
