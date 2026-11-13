"use client";

import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";

const copy = {
  en: {
    kicker: "ABOUT VIZTUTORBD",
    title: "Math should be something you can see.",
    intro:
      "VizTutorBD turns abstract chapters into step-by-step visual lessons for Play, Nursery and Class 1–12. Every explanation is written in English and Bangla, so learners can switch language without losing the math.",
    missionTitle: "Our mission",
    missionText:
      "Make quality math learning visual, bilingual and free to explore. We pair short lessons with reusable visualizations, a grounded AI companion, adaptive practice and a community forum.",
    offerTitle: "What you get",
    offer: [
      ["Visual lessons", "Step-by-step players with narration, formulas and controls."],
      ["Bilingual by default", "Bangla-first UI with an English switch everywhere."],
      ["Practice that checks math", "MCQ or typed answers, verified by a real math engine."],
      ["A companion that stays grounded", "Answers point back to the platform's own lessons."],
      ["A community forum", "Ask by text or image, tag a topic, and help each other."],
      ["Safe and clear", "Moderation tools, privacy rules and simple legal pages."],
    ],
    audienceTitle: "Built for",
    audience: [
      ["Learners", "Play through Class 12, moving at your own pace."],
      ["Teachers", "Use the visual steps as a ready-made classroom aid."],
      ["Parents", "See what your child is learning and where they need help."],
    ],
    ctaTitle: "Start with your class",
    ctaText: "Pick a class on the home page, or search for a topic directly.",
    ctaSearch: "Search topics",
    ctaHome: "Choose a class",
  },
  bn: {
    kicker: "ভিজিটিউটরবিডি সম্পর্কে",
    title: "গণিত এমন হওয়া উচিত যা আপনি দেখতে পান।",
    intro:
      "ভিজিটিউটরবিডি প্লে, নার্সারি ও প্রথম–দ্বাদশ শ্রেণির বিমূর্ত অধ্যায়গুলোকে ধাপে ধাপে ভিজ্যুয়াল পাঠে বদলে দেয়। প্রতিটি ব্যাখ্যা ইংরেজি ও বাংলায় লেখা, তাই ভাষা বদলালেও গণিত বোঝা সহজ থাকে।",
    missionTitle: "আমাদের লক্ষ্য",
    missionText:
      "মানসম্মত গণিত শেখাকে ভিজ্যুয়াল, দ্বিভাষিক ও সবার জন্য উন্মুক্ত করা। ছোট পাঠ, পুনরায় ব্যবহারযোগ্য ভিজ্যুয়ালাইজেশন, নিজস্ব পাঠভিত্তিক এআই সঙ্গী, অভিযোজিত অনুশীলন আর কমিউনিটি ফোরাম—সব একসাথে।",
    offerTitle: "আপনি যা পাবেন",
    offer: [
      ["ভিজ্যুয়াল পাঠ", "বর্ণনা, সূত্র ও নিয়ন্ত্রণসহ ধাপে ধাপে প্লেয়ার।"],
      ["দ্বিভাষিক", "বাংলা-প্রথম ইন্টারফেস, যেকোনো জায়গায় ইংরেজি সুইচ।"],
      ["গণিত যাচাই করা অনুশীলন", "এমসিকিউ বা লিখিত উত্তর, সত্যিকারের গণিত ইঞ্জিন দিয়ে যাচাই।"],
      ["পাঠভিত্তিক সঙ্গী", "উত্তর প্ল্যাটফর্মের নিজস্ব পাঠ থেকেই আসে।"],
      ["কমিউনিটি ফোরাম", "লেখা বা ছবিতে প্রশ্ন করুন, ট্যাগ দিন, একে অন্যকে সাহায্য করুন।"],
      ["নিরাপদ ও স্পষ্ট", "মডারেশন, গোপনীয়তা নীতি ও সহজ আইনি পৃষ্ঠা।"],
    ],
    audienceTitle: "যাদের জন্য",
    audience: [
      ["শিক্ষার্থী", "প্লে থেকে দ্বাদশ শ্রেণি, নিজের গতিতে এগিয়ে চলুন।"],
      ["শিক্ষক", "ভিজ্যুয়াল ধাপগুলো শ্রেণিকক্ষের সহায়ক উপকরণ হিসেবে ব্যবহার করুন।"],
      ["অভিভাবক", "সন্তান কী শিখছে এবং কোথায় সাহায্য দরকার তা দেখুন।"],
    ],
    ctaTitle: "আপনার শ্রেণি দিয়ে শুরু করুন",
    ctaText: "হোম পেজে শ্রেণি বেছে নিন, অথবা সরাসরি টপিক খুঁজুন।",
    ctaSearch: "টপিক খুঁজুন",
    ctaHome: "শ্রেণি বেছে নিন",
  },
};

export default function AboutPage() {
  const { locale } = useLocale();
  const text = copy[locale] ?? copy.en;

  return (
    <div className="about-page">
      <header className="page-head">
        <span className="eyebrow">{text.kicker}</span>
        <h1>{text.title}</h1>
        <p className="lead">{text.intro}</p>
      </header>

      <section className="about-panel panel">
        <h2>{text.missionTitle}</h2>
        <p>{text.missionText}</p>
      </section>

      <section className="about-section">
        <h2 className="section-title">{text.offerTitle}</h2>
        <div className="about-grid">
          {text.offer.map(([title, body]) => (
            <article key={title} className="about-card">
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2 className="section-title">{text.audienceTitle}</h2>
        <div className="about-grid about-grid-3">
          {text.audience.map(([title, body]) => (
            <article key={title} className="about-card">
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-cta panel">
        <div>
          <h2>{text.ctaTitle}</h2>
          <p className="muted">{text.ctaText}</p>
        </div>
        <div className="about-cta-actions">
          <Link href="/search" className="btn btn-primary">
            {text.ctaSearch} →
          </Link>
          <Link href="/" className="btn btn-ghost">
            {text.ctaHome}
          </Link>
        </div>
      </section>
    </div>
  );
}
