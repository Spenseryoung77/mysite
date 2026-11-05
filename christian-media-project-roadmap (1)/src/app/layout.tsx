import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/archivo";
import "@fontsource-variable/manrope";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Paroles Inspirées — S'informer, nourrir sa foi, partager l'espérance",
    template: "%s — Paroles Inspirées",
  },
  description:
    "Média chrétien francophone : actualités vérifiées, enseignements bibliques, méditations quotidiennes, témoignages et contenus audio & vidéo.",
  openGraph: {
    siteName: "Paroles Inspirées",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "/images/flamme-horizon.jpg", width: 1200, height: 675 }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}