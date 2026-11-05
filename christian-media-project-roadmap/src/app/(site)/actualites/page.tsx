import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getPublished } from "@/lib/data";
import { ArticleCard } from "@/components/site/cards";
import { EmptyState } from "@/components/site/ui";
import PageHero from "@/components/site/page-hero";
import Reveal from "@/components/site/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Actualités",
  description: "L'information chrétienne vérifiée : vie des Églises, solidarité, société et culture, en francophonie et ailleurs.",
};

const PER_PAGE = 6;

export default async function ActualitesPage({ searchParams }: { searchParams: Promise<{ categorie?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const cats = await getCategories("actualites");
  const active = cats.find((c) => c.slug === sp.categorie);
  const { items, total } = await getPublished("article", {
    categorySlug: active?.slug,
    limit: PER_PAGE,
    offset: (page - 1) * PER_PAGE,
  });
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const link = (p: number, cat?: string) => {
    const params = new URLSearchParams();
    if (cat) params.set("categorie", cat);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/actualites${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHero kicker="Informer avec rigueur" title="Actualités">
        Initiatives, événements et regards chrétiens sur le monde — chaque article cite ses sources et identifie son auteur.
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par catégorie">
          <Link href="/actualites" className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${!active ? "bg-brand-900 text-white" : "bg-white text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50"}`}>
            Toutes
          </Link>
          {cats.map((c) => (
            <Link key={c.id} href={link(1, c.slug)} aria-current={active?.id === c.id ? "true" : undefined} className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${active?.id === c.id ? "bg-brand-900 text-white" : "bg-white text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50"}`}>
              {c.name}
            </Link>
          ))}
          <p className="ml-auto text-sm text-ink-500">{total} article{total > 1 ? "s" : ""}{active ? ` · ${active.name}` : ""}</p>
        </div>

        {items.length === 0 ? (
          <EmptyState title="Aucun article dans cette catégorie pour le moment">
            <Link href="/actualites" className="link-underline font-semibold text-brand-700">Voir toutes les actualités</Link>
          </EmptyState>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a, i) => <Reveal key={a.id} delay={i * 50}><ArticleCard c={a} /></Reveal>)}
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
            {page > 1 && <Link href={link(page - 1, active?.slug)} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50">← Précédent</Link>}
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={link(p, active?.slug)} aria-current={p === page ? "page" : undefined} className={`h-10 w-10 rounded-full text-center text-sm leading-10 font-bold ${p === page ? "bg-brand-900 text-white" : "bg-white text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50"}`}>
                {p}
              </Link>
            ))}
            {page < pages && <Link href={link(page + 1, active?.slug)} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50">Suivant →</Link>}
          </nav>
        )}
      </div>
    </>
  );
}