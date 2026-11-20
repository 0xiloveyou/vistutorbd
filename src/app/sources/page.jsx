import { ShowcasePage, ShowcaseSection } from "@/components/showcase/ShowcasePage";

export const metadata = {
  title: "Sources and credits",
  description: "Curriculum references, textbook acknowledgments and content rights notes for VizTutorBD.",
};

export default function SourcesPage() {
  return (
    <ShowcasePage
      kicker="SOURCES, CREDITS & CONTENT RIGHTS"
      title="Learning from local curriculum and textbooks"
      intro="VizTutorBD is designed to help Bangladeshi learners study mathematics in context. This page identifies curriculum and reference materials that informed the project and explains the limits of attribution."
    >
      <ShowcaseSection title="Curriculum and textbook references">
        <ul>
          <li>Bangladesh National Curriculum and Textbook Board (NCTB), mathematics materials for Classes 9–10. Exact titles, editions and page references should be added to the content inventory as each item is confirmed.</li>
          <li>Md. Ketab Uddin, higher mathematics books used as references for Classes 11–12. Retail listings identify S. K. L. Publication for at least one title; verify the title page and edition of each book actually consulted.</li>
        </ul>
        <p>These books informed topic selection and local learning alignment. VizTutorBD is independent and is not affiliated with, endorsed by, or an official product of NCTB, Md. Ketab Uddin, or S. K. L. Publication.</p>
      </ShowcaseSection>

      <ShowcaseSection title="What acknowledgment does and does not do">
        <p>Credit is important, but it does not by itself grant permission to reproduce, adapt, translate, or distribute protected material. Bangladesh’s NCTB ordinance states that copyright in textbooks and other books published by the Board vests in the Board. The Copyright Act 2023 sets out rights, exceptions and licensing rules; whether a particular use qualifies depends on the facts and applicable conditions.</p>
        <p>Because this project makes learning content available through a digital platform, do not assume that a classroom or educational purpose automatically authorizes copying full questions, distinctive wording, worked solutions, diagrams, or substantial selections from a book. For verbatim or close adaptations, seek written permission from the relevant rights holder. For commercial use, obtain specific local legal advice and any required license.</p>
      </ShowcaseSection>

      <ShowcaseSection title="Our content approach">
        <p>Where permission has not been confirmed, prefer original problems written from curriculum outcomes and mathematical concepts, using new wording, values, examples, diagrams and explanations. Keep an internal source record for each lesson and problem set, including source title, author or publisher, edition, page or chapter, what was used, whether it was independently rewritten, and any permission or license.</p>
        <p>If a rights holder asks us to correct or remove material, contact us through the <a href="/contact">contact page</a>.</p>
      </ShowcaseSection>

      <ShowcaseSection title="Public references">
        <ul>
          <li><a href="https://bdcode.gov.bd/upload/bdcodeact/2020-11-18-17-38-21-668_National_Curriculum_and_Text-Book_Board_Ordin.pdf" target="_blank" rel="noreferrer">National Curriculum and Text-Book Board Ordinance, 1983</a> — section 15(2) addresses copyright in Board-published textbooks.</li>
          <li><a href="https://bdlaws.minlaw.gov.bd/act-details-1452.html?lang=en" target="_blank" rel="noreferrer">Copyright Act, 2023 (Bangladesh)</a> — consult the authentic Bangla text and applicable rules; the Act includes rights, exceptions and remedies.</li>
          <li><a href="https://www.rokomari.com/book/author/31119/md-ketab-uddin" target="_blank" rel="noreferrer">Rokomari author listing for Md. Ketab Uddin</a> — publisher/product details are retailer metadata and should be checked against each book’s title and copyright pages.</li>
        </ul>
        <p className="showcase-note">This source note is an attribution and transparency aid, not legal advice, a license, or confirmation that any specific problem set is cleared for publication. Keep only material you authored, are licensed to use, or have had reviewed and cleared by the relevant rights holder.</p>
      </ShowcaseSection>
    </ShowcasePage>
  );
}
