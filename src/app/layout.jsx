import FloatingDock from "@/components/FloatingDock";
import SiteHeader from "@/components/SiteHeader";
import { serverGet } from "@/lib/serverApi";
import Providers from "@/providers";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata = {
  title: {
    default: "VizTutorBD — Math you can see",
    template: "%s · VizTutorBD",
  },
  description:
    "VizTutorBD is an interactive math learning platform for Play, Nursery and Class 1–12, with visual explanations, a community forum, practice and an AI companion in English and Bangla.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: ["/logo.png"],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default async function RootLayout({ children }) {
  const bands = (await serverGet("/taxonomy/bands")) ?? [];

  return (
    <html lang="bn" data-theme="indigo" data-mode="light" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('mathplay-theme');var m=localStorage.getItem('mathplay-mode');var l=localStorage.getItem('mathplay-locale');if(t)document.documentElement.dataset.theme=t;if(m)document.documentElement.dataset.mode=m;if(l)document.documentElement.lang=l;}catch(e){}`,
          }}
        />
        <Providers bands={bands}>
          <SiteHeader />
          <main className="page-shell">{children}</main>
          <footer className="site-footer">
            <span>VizTutorBD · Play → Class 12</span>
            <span className="muted">
              English + বাংলা · AI companion · forum · visualization-first
            </span>
          </footer>
          <FloatingDock />
        </Providers>
      </body>
    </html>
  );
}
