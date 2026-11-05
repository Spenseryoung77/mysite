import Link from "next/link";
import type { Metadata } from "next";
import { searchPublished } from "@/lib/queries";
import { CardGrid, Empty, PageHero } from "@/components/content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recherche", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const results = q.length >= 2 ? await searchPublished(q) : [];
  return (
    <>
      <PageHero title="Recherche" description="Trouvez un article, une méditation, un témoignage ou une émission." />
      <div className="container-pi py-10">
        <form action="/recherche" role="search" className="flex max-w-2xl gap-2">
          <label htmlFor="q" className="sr-only">Mots-clés</label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Ex. : prière, Psaume 23, espérance…" className="input flex-1" />
          <button className="btn-primary">Rechercher</button>
        </form>
        <div className="mt-8">
          {q.length < 2 ? (
            <p className="text-slate-600">Saisissez au moins deux caractères.</p>
          ) : results.length ? (
            <>
              <p className="mb-6 text-slate-700" role="status">{results.length} résultat{results.length > 1 ? "s" : ""} pour « {q} »</p>
              <CardGrid items={results} showSection />
            </>
          ) : (
            <Empty>
              <p className="font-semibold">Aucun résultat pour « {q} ».</p>
              <p className="mt-2">Essayez un mot plus simple (par exemple « prière » ou « Bible ») ou parcourez les rubriques :</p>
              <p className="mt-4 flex flex-wrap justify-center gap-2">
                {[["/actualites", "Actualités"], ["/foi-bible", "Foi & Bible"], ["/meditations", "Méditations"], ["/temoignages", "Témoignages"]].map(([h, l]) => (
                  <Link key={h} href={h} className="btn-ghost text-sm">{l}</Link>
                ))}
              </p>
            </Empty>
          )}
        </div>
      </div>
    </>
  );
}
