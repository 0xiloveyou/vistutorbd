"use client";

import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";

const faqs = [
  {
    q: {
      en: "Which classes are covered?",
      bn: "কোন কোন শ্রেণি আছে?",
    },
    a: {
      en: "Play, Nursery and Class 1 through Class 12. Use the class picker in the header or the home page to jump to your level.",
      bn: "প্লে, নার্সারি এবং প্রথম থেকে দ্বাদশ শ্রেণি পর্যন্ত। হেডারের শ্রেণি নির্বাচনী বা হোম পেজ থেকে আপনার স্তরে যান।",
    },
  },
  {
    q: {
      en: "Do I need an account to learn?",
      bn: "শিখতে কি অ্যাকাউন্ট দরকার?",
    },
    a: {
      en: "No. Lessons, the forum and practice can be used as a guest. An account is only needed to save bookmarks, progress and quiz attempts.",
      bn: "না। পাঠ, ফোরাম ও অনুশীলন অতিথি হিসেবে ব্যবহার করা যায়। বুকমার্ক, অগ্রগতি ও কুইজ সংরক্ষণ করতে অ্যাকাউন্ট দরকার।",
    },
  },
  {
    q: {
      en: "Is the platform available in Bangla?",
      bn: "প্ল্যাটফর্মটি কি বাংলায় আছে?",
    },
    a: {
      en: "Yes. Bangla is the default language, and the English/Bangla switch sits beside the theme controls in the header. Math notation stays the same in both languages.",
      bn: "হ্যাঁ। বাংলা ডিফল্ট ভাষা। হেডারের থিম নিয়ন্ত্রণের পাশে ইংরেজি/বাংলা সুইচ আছে। গণিতের চিহ্ন দুই ভাষাতেই একই থাকে।",
    },
  },
  {
    q: {
      en: "How is my quiz answer checked?",
      bn: "কুইজের উত্তর কীভাবে যাচাই হয়?",
    },
    a: {
      en: "The backend uses a real math engine for numeric answers. Multiple-choice answers are compared with the stored correct option.",
      bn: "ব্যাকএন্ড সংখ্যাভিত্তিক উত্তরের জন্য সত্যিকারের গণিত ইঞ্জিন ব্যবহার করে। বহুনির্বাচনী উত্তর সংরক্ষিত সঠিক অপশনের সাথে মেলাানো হয়।",
    },
  },
  {
    q: {
      en: "What does the AI companion know?",
      bn: "এআই সঙ্গী কী জানে?",
    },
    a: {
      en: "It answers from the platform's own published topics and visualizations. When no matching lesson is found, it says so instead of inventing an answer.",
      bn: "এটি প্ল্যাটফর্মের প্রকাশিত টপিক ও ভিজ্যুয়ালাইজেশন থেকেই উত্তর দেয়। মিলে যাওয়া পাঠ না পেলে অনুমান না করে সেটি জানিয়ে দেয়।",
    },
  },
  {
    q: {
      en: "How do you handle my data?",
      bn: "আমার তথ্য কীভাবে ব্যবহৃত হয়?",
    },
    a: {
      en: "We store the account details you give us, your learning progress and anonymous visit counts. We do not sell personal data. See the Privacy Policy for details.",
      bn: "আপনার দেওয়া অ্যাকাউন্ট তথ্য, শেখার অগ্রগতি এবং বেনামি ভিজিট সংখ্যা সংরক্ষণ করি। ব্যক্তিগত তথ্য বিক্রি করি না। বিস্তারিত গোপনীয়তা নীতিতে।",
    },
  },
  {
    q: {
      en: "Can I report a wrong answer?",
      bn: "ভুল উত্তর রিপোর্ট করতে পারি?",
    },
    a: {
      en: "Yes. Use the Contact page or the moderation report tools on a topic, visualization, question or chat message.",
      bn: "হ্যাঁ। যোগাযোগ পৃষ্ঠা অথবা টপিক, ভিজ্যুয়ালাইজেশন, প্রশ্ন বা চ্যাট বার্তার মডারেশন রিপোর্ট ব্যবহার করুন।",
    },
  },
];

export default function FaqsPage() {
  const { locale, t } = useLocale();
  const lang = locale === "bn" ? "bn" : "en";

  return (
    <div className="faqs-page">
      <header className="page-head">
        <span className="eyebrow">FAQ</span>
        <h1>{t("faqs.title")}</h1>
        <p className="lead">{t("faqs.subtitle")}</p>
      </header>

      <div className="faq-list">
        {faqs.map((item) => (
          <details key={item.q.en} className="faq-item">
            <summary>{item.q[lang]}</summary>
            <p>{item.a[lang]}</p>
          </details>
        ))}
      </div>

      <div className="faq-cta panel">
        <p>{locale === "bn" ? "উত্তর পাননি?" : "Didn't find your answer?"}</p>
        <Link href="/contact" className="btn btn-primary">
          {t("common.contact")} →
        </Link>
      </div>
    </div>
  );
}
