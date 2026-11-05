import type { ReactNode } from "react";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-flame-500 focus:px-4 focus:py-2 focus:font-bold focus:text-brand-950">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}