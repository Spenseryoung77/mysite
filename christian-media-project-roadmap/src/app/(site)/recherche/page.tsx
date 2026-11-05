import type { Metadata } from "next";
import Link from "next/link";
import { Search, Play, Headphones, CalendarDays, MapPin } from "lucide-react";
import { searchAll } from "@/lib/data";
import { ArticleCard } from "@/components/site/cards";
import { formatDate, TYPE_LABELS } from "@/lib/utils";
import PageHero from "@/components/site/page-hero";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recherche", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.trim() ?? "";
  const results = q.length >= 2 ? await searchAll(q) : null;
  const total = results ? results.contents.length + results.episodes.length + results.events.length : 0;
  const byType = (t: string) => results?.contents.filter((c) => c.type === t) ?? [];

  return (
    <>
      <PageHero kicker="Explorer le média" title={q ? `Résultats pour « ${q} »` : "Recherche"}>
        {results ? `${total} résultat${total > 1 ? "s" : ""} dans les contenus publiés.` : "Cherchez par mots-clés dans les titres et les textes de tous nos contenus."}
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <form action="/recherche" method="get" className="mb-10 flex max-w-xl gap-2">
          <label htmlFor="q" className="sr-only">Mots-clés</label>
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-brand-400" aria-hidden="true" />
            <input id="q" name="q" type="search" defaultValue={q} placeholder="grâce, louange, solidarité…" className="w-full rounded-full border border-brand-200 bg-white py-3 pr-4 pl-11 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200" />
          </div>
          <button type="submit" className="rounded-full bg-brand-900 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700">Chercher</button>
        </form>

        {results && total === 0 && (
          <div className="rounded-3xl border border-dashed border-brand-200 bg-brand-50/60 px-8 py-14 text-center">
            <p className="font-display text-xl font-extrabold text-brand-900">Aucun résultat pour « {q} »</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">Essayez un terme plus court ou explorez une rubrique. Suggestions :</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {["prière", "grâce", "louange", "solidarité", "témoignage"].map((s) => (
                <Link key={s} href={`/recherche?q=${s}`} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100">{s}</Link>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-bold text-brand-700">
              <Link href="/actualites" className="link-underline">Actualités</Link>
              <Link href="/foi-et-bible" className="link-underline">Foi & Bible</Link>
              <Link href="/meditations" className="link-underline">Méditations</Link>
              <Link href="/videos-podcasts" className="link-underline">Vidéos & podcasts</Link>
            </div>
          </div>
        )}

        {results && (["article", "enseignement", "meditation", "temoignage"] as const).map((t) => {
          const items = byType(t);
          if (!items.length) return null;
          return (
            <section key={t} className="mb-12">
              <h2 className="font-display mb-5 text-xl font-extrabold text-brand-950">{TYPE_LABELS[t]}s <span className="text-brand-400">({items.length})</span></h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => <ArticleCard key={c.id} c={c} />)}
              </div>
            </section>
          );
        })}

        {results && results.episodes.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display mb-5 text-xl font-extrabold text-brand-950">Épisodes <span className="text-brand-400">({results.episodes.length})</span></h2>
            <ul className="space-y-3">
              {results.episodes.map((e) => (
                <li key={e.id}>
                  <Link href={`/episodes/${e.slug}`} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[var(--shadow-card)] ring-1 ring-brand-100 transition hover:-translate-y-0.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-flame-400">
                      {e.show?.kind === "video" ? <Play className="h-4 w-4" fill="currentColor" aria-hidden="true" /> : <Headphones className="h-4 w-4" aria-hidden="true" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-brand-950">{e.title}</span>
                      <span className="text-xs text-ink-500">{e.show?.title} · {e.duration} · {formatDate(e.publishedAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {results && results.events.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display mb-5 text-xl font-extrabold text-brand-950">Événements <span className="text-brand-400">({results.events.length})</span></h2>
            <ul className="space-y-3">
              {results.events.map((e) => (
                <li key={e.id}>
                  <Link href="/evenements" className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[var(--shadow-card)] ring-1 ring-brand-100 transition hover:-translate-y-0.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><CalendarDays className="h-4 w-4" aria-hidden="true" /></span>
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-brand-950">{e.title} {e.status === "cancelled" && <span className="ml-1 text-xs font-bold text-danger-600">(annulé)</span>}</span>
                      <span className="flex items-center gap-1 text-xs text-ink-500"><MapPin className="h-3 w-3" aria-hidden="true" />{e.city} · {formatDate(e.startsAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}