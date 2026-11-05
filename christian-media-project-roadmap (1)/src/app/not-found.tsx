import Link from "next/link";
import { FlameMark } from "@/components/site/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4 text-center">
      <FlameMark className="h-16 w-16" />
      <p className="font-display mt-8 text-7xl font-extrabold text-brand-200">404</p>
      <h1 className="font-display mt-2 text-2xl font-extrabold text-brand-950 sm:text-3xl">Cette page s'est éteinte… ou n'a jamais existé</h1>
      <p className="mt-3 max-w-md text-[15px] text-ink-500">Le lien est peut-être ancien ou mal orthographié. La flamme, elle, est toujours allumée par ici :</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-brand-900 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700">Retour à l'accueil</Link>
        <Link href="/recherche" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50">Rechercher</Link>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-bold text-brand-700">
        <Link href="/actualites" className="link-underline">Actualités</Link>
        <Link href="/meditations" className="link-underline">Méditations</Link>
        <Link href="/temoignages" className="link-underline">Témoignages</Link>
        <Link href="/videos-podcasts" className="link-underline">Vidéos & podcasts</Link>
      </div>
    </div>
  );
}