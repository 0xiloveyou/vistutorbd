"use client";

import FloatingDock from "@/components/FloatingDock";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { usePathname } from "next/navigation";

/**
 * Page frame: header and footer on every page, except the lesson player.
 * `/learn` is the fullscreen visual lesson, so only the floating controls stay.
 */
export default function SiteChrome({ children }) {
  const pathname = usePathname() ?? "";
  const fullscreen = pathname.startsWith("/learn");

  return (
    <>
      {fullscreen ? null : <SiteHeader />}
      <main className={fullscreen ? "page-shell page-shell-lesson" : "page-shell"}>
        {children}
      </main>
      {fullscreen ? null : <SiteFooter />}
      <FloatingDock />
    </>
  );
}
