"use client";

import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";
import { useParams } from "next/navigation";

const UPDATED = "2026-11-13";

const pages = {
  terms: {
    title: { en: "Terms & Conditions", bn: "শর্তাবলী" },
    intro: {
      en: "By using VizTutorBD you agree to these terms. If you do not agree, please do not use the platform.",
      bn: "ভিজিটিউটরবিডি ব্যবহার করলে আপনি এই শর্তাবলীতে সম্মত হচ্ছেন। সম্মত না হলে প্ল্যাটফর্মটি ব্যবহার করবেন না।",
    },
    sections: [
      {
        heading: { en: "Using the platform", bn: "প্ল্যাটফর্ম ব্যবহার" },
        body: {
          en: "VizTutorBD is provided for personal learning. You may not attempt to disrupt the service, scrape content at scale, bypass access controls or use the platform for unlawful activity.",
          bn: "ভিজিটিউটরবিডি ব্যক্তিগত শেখার জন্য। সেবা ব্যাহত করা, বড় পরিসরে কনটেন্ট স্ক্র্যাপ করা, অ্যাক্সেস নিয়ন্ত্রণ এড়ানো বা অবৈধ কাজে ব্যবহার করা যাবে না।",
        },
      },
      {
        heading: { en: "Accounts", bn: "অ্যাকাউন্ট" },
        body: {
          en: "You are responsible for keeping your password safe. Accounts that are used abusively or to impersonate someone may be blocked. You can ask us to delete your account through the Contact page.",
          bn: "পাসওয়ার্ড নিরাপদ রাখার দায়িত্ব আপনার। অপব্যবহার বা অন্যের পরিচয় ব্যবহারের অ্যাকাউন্ট ব্লক করা হতে পারে। যোগাযোগ পৃষ্ঠার মাধ্যমে অ্যাকাউন্ট মুছতে অনুরোধ করতে পারেন।",
        },
      },
      {
        heading: { en: "Content and accuracy", bn: "কনটেন্ট ও নির্ভুলতা" },
        body: {
          en: "Lessons are prepared with care, but mistakes can happen. Always verify important results with a teacher or textbook. The AI companion is a study aid, not a substitute for instruction.",
          bn: "পাঠ যত্নসহকারে তৈরি, তবে ভুল থাকতে পারে। গুরুত্বপূর্ণ ফলাফল শিক্ষক বা বই দিয়ে যাচাই করুন। এআই সঙ্গী একটি পড়ার সহায়ক, শিক্ষকের বিকল্প নয়।",
        },
      },
      {
        heading: { en: "Changes", bn: "পরিবর্তন" },
        body: {
          en: "We may update these terms as the platform grows. The latest version will always be available on this page.",
          bn: "প্ল্যাটফর্ম বাড়ার সাথে এই শর্তাবলী হালনাগাদ হতে পারে। সর্বশেষ সংস্করণ সবসময় এই পৃষ্ঠায় থাকবে।",
        },
      },
    ],
  },
  privacy: {
    title: { en: "Privacy Policy", bn: "গোপনীয়তা নীতি" },
    intro: {
      en: "This policy explains what VizTutorBD collects and how it is used. We keep data collection to what the learning experience needs.",
      bn: "এই নীতিতে ভিজিটিউটরবিডি কী সংগ্রহ করে এবং কীভাবে ব্যবহার করে তা ব্যাখ্যা করা হয়েছে। শেখার অভিজ্ঞতার প্রয়োজন অনুযায়ীই আমরা তথ্য সংগ্রহ করি।",
    },
    sections: [
      {
        heading: { en: "What we collect", bn: "আমরা যা সংগ্রহ করি" },
        body: {
          en: "Account details (name, email, hashed password or Google id), learning data (bookmarks, progress, quiz attempts, preferences) and anonymous page visits (a browser-generated visitor id, page path and time).",
          bn: "অ্যাকাউন্ট তথ্য (নাম, ইমেইল, হ্যাশ করা পাসওয়ার্ড বা গুগল আইডি), শেখার তথ্য (বুকমার্ক, অগ্রগতি, কুইজের চেষ্টা, পছন্দ) এবং বেনামি পেজ ভিজিট (ব্রাউজার-তৈরি ভিজিটর আইডি, পথ ও সময়)।",
        },
      },
      {
        heading: { en: "How we use it", bn: "যেভাবে ব্যবহার করি" },
        body: {
          en: "To sign you in, save your progress, run the forum, send service emails (verification, password reset, visitor reports to admins) and understand which lessons are being used.",
          bn: "লগ ইন করানো, অগ্রগতি সংরক্ষণ, ফোরাম চালানো, সেবা-ইমেইল পাঠানো (যাচাই, পাসওয়ার্ড রিসেট, অ্যাডমিনদের ভিজিটর রিপোর্ট) এবং কোন পাঠ ব্যবহার হচ্ছে তা বোঝার জন্য।",
        },
      },
      {
        heading: { en: "Sharing", bn: "শেয়ারিং" },
        body: {
          en: "We do not sell personal data. Data may be processed by infrastructure providers that host the database, email and AI features, only to run the service.",
          bn: "ব্যক্তিগত তথ্য বিক্রি করা হয় না। ডেটাবেস, ইমেইল ও এআই সেবা হোস্টকারী অবকাঠামো প্রদানকারীরা শুধু সেবা চালানোর জন্য তথ্য প্রক্রিয়া করতে পারে।",
        },
      },
      {
        heading: { en: "Your choices", bn: "আপনার অধিকার" },
        body: {
          en: "You can update your profile, clear bookmarks, or contact us to request a copy or deletion of your account data. Anonymous visit records cannot be linked back to you.",
          bn: "প্রোফাইল হালনাগাদ, বুকমার্ক মুছে ফেলা, অথবা অ্যাকাউন্ট তথ্যের কপি বা মুছে ফেলার অনুরোধ করতে আমাদের লিখতে পারেন। বেনামি ভিজিট রেকর্ড আপনার সাথে যুক্ত করা যায় না।",
        },
      },
      {
        heading: { en: "Cookies and storage", bn: "কুকি ও স্টোরেজ" },
        body: {
          en: "We use httpOnly cookies for sign-in and browser storage for language, theme, class choice and the anonymous visitor id. No advertising trackers are used.",
          bn: "লগ ইনের জন্য httpOnly কুকি এবং ভাষা, থিম, শ্রেণি নির্বাচন ও বেনামি ভিজিটর আইডির জন্য ব্রাউজার স্টোরেজ ব্যবহার করি। বিজ্ঞাপন ট্র্যাকার নেই।",
        },
      },
    ],
  },
  disclaimer: {
    title: { en: "Disclaimer", bn: "দায়মুক্তি" },
    intro: {
      en: "VizTutorBD is an educational project. The content is provided as-is for study and practice.",
      bn: "ভিজিটিউটরবিডি একটি শিক্ষামূলক প্রকল্প। কনটেন্ট পড়াশোনা ও অনুশীলনের জন্য যেমন আছে তেমনভাবে দেওয়া হয়।",
    },
    sections: [
      {
        heading: { en: "No guarantees", bn: "কোনো নিশ্চয়তা নেই" },
        body: {
          en: "We cannot guarantee that every lesson, visualization, quiz answer or AI response is complete or error-free. Use your own judgement and verify important results.",
          bn: "প্রতিটি পাঠ, ভিজ্যুয়ালাইজেশন, কুইজের উত্তর বা এআই উত্তর সম্পূর্ণ বা ত্রুটিমুক্ত—এমন নিশ্চয়তা আমরা দিতে পারি না। নিজের বিচার ব্যবহার করুন ও গুরুত্বপূর্ণ ফলাফল যাচাই করুন।",
        },
      },
      {
        heading: { en: "External links and AI", bn: "বাহ্যিক লিংক ও এআই" },
        body: {
          en: "Forum posts may link to external sites, and the AI companion may occasionally be wrong. External content and AI output are not endorsed by VizTutorBD.",
          bn: "ফোরামের পোস্টে বাহ্যিক সাইটের লিংক থাকতে পারে এবং এআই সঙ্গী মাঝে মাঝে ভুল করতে পারে। বাহ্যিক কনটেন্ট ও এআই আউটপুট ভিজিটিউটরবিডি অনুমোদন করে না।",
        },
      },
      {
        heading: { en: "Limitation of liability", bn: "দায়ের সীমা" },
        body: {
          en: "To the extent permitted by law, VizTutorBD is not liable for losses arising from use of the platform, including academic decisions based on its content.",
          bn: "আইনসম্মত সীমার মধ্যে, প্ল্যাটফর্ম ব্যবহার থেকে হওয়া ক্ষতির—যেমন এর কনটেন্টের ভিত্তিতে নেওয়া শিক্ষাগত সিদ্ধান্তের—জন্য ভিজিটিউটরবিডি দায়ী নয়।",
        },
      },
    ],
  },
};

export default function LegalPage() {
  const { locale, t } = useLocale();
  const params = useParams();
  const slug = String(params?.slug ?? "terms");
  const page = pages[slug] ?? pages.terms;
  const lang = locale === "bn" ? "bn" : "en";

  return (
    <div className="legal-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">{t("common.appName")}</Link>
        <span>/</span>
        <span>{page.title[lang]}</span>
      </nav>

      <header className="page-head">
        <span className="eyebrow">{t("footer.legal")}</span>
        <h1>{page.title[lang]}</h1>
        <p className="muted">
          {t("legal.updated")}: {UPDATED}
        </p>
        <p className="lead">{page.intro[lang]}</p>
      </header>

      <div className="legal-content panel">
        {page.sections.map((section) => (
          <section key={section.heading.en}>
            <h2>{section.heading[lang]}</h2>
            <p>{section.body[lang]}</p>
          </section>
        ))}
      </div>

      <p className="legal-links muted">
        <Link href="/legal/terms">{t("footer.terms")}</Link>
        <span>·</span>
        <Link href="/legal/privacy">{t("footer.privacy")}</Link>
        <span>·</span>
        <Link href="/legal/disclaimer">{t("footer.disclaimer")}</Link>
      </p>
    </div>
  );
}
