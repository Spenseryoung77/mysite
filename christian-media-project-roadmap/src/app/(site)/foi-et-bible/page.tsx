import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, HandHeart, Heart, Sparkles, Layers, Info } from "lucide-react";
import { getCategories, getPublished, getSeriesList } from "@/lib/data";
import { ArticleCard } from "@/components/site/cards";
import { EmptyState } from "@/components/site/ui";
import PageHero from "@/components/site/page-hero";
import Reveal from "@/components/site/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Foi & Bible",
  description: "Enseignements et dossiers pour comprendre la Bible, apprendre à prier et vivre sa foi au quotidien. Citations bibliques : Louis Segond 1910, domaine public.",
};

const ICONS: Record<string, typeof BookOpen> = { bible: BookOpen, priere: HandHeart, "vie-chretienne": Heart, "questions-de-foi": Sparkles };

export default async function FoiPage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const sp = await searchParams;
  const themes = await getCategories("foi");
  const active = themes.find((t) => t.slug === sp.theme);
  const [{ items }, seriesList] = await Promise.all([
    getPublished("enseignement", { categorySlug: active?.slug, limit: 24 }),
    getSeriesList(),
  ]);

  return (
    <>
      <PageHero kicker="Comprendre & approfondir" title="Foi & Bible">
        Des enseignements signés, classés par thèmes et par dossiers. Les textes bibliques cités proviennent de la traduction Louis Segond 1910, libre de droits.
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {themes.map((t) => {
            const Icon = ICONS[t.slug] ?? BookOpen;
            const isActive = active?.id === t.id;
            return (
              <Link key={t.id} href={isActive ? "/foi-et-bible" : `/foi-et-bible?theme=${t.slug}`} aria-current={isActive ? "true" : undefined}
                className={`card-hover rounded-2xl p-5 ring-1 transition ${isActive ? "bg-brand-900 text-white ring-brand-900" : "bg-white ring-brand-100 shadow-[var(--shadow-card)]"}`}>
                <Icon className={`mb-3 h-6 w-6 ${isActive ? "text-flame-400" : "text-brand-600"}`} aria-hidden="true" />
                <p className="font-display text-base font-extrabold">{t.name}</p>
                <p className={`mt-1 text-[13px] leading-snug ${isActive ? "text-brand-200" : "text-ink-500"}`}>{t.description}</p>
              </Link>
            );
          })}
        </div>
        <p className="mb-10 flex items-start gap-2 rounded-xl bg-info-100 px-4 py-3 text-[13px] text-ink-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-info-600" aria-hidden="true" />
          Les contenus de cette rubrique sont des <strong className="mx-1">enseignements</strong> : ils expriment le point de vue de leur auteur et se distinguent des articles d'actualité.
        </p>

        {!active && seriesList.length > 0 && (
          <Reveal className="mb-12">
            <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-extrabold text-brand-950"><Layers className="h-5 w-5 text-flame-600" aria-hidden="true" /> Dossiers en cours</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {seriesList.map((s) => (
                <div key={s} className="grain relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 p-6 text-white">
                  <p className="text-[10px] font-bold tracking-[0.22em] text-flame-400 uppercase">Dossier</p>
                  <p className="font-display mt-1 text-lg leading-tight font-extrabold">{s}</p>
                  <p className="mt-2 text-xs text-brand-200">{items.filter((i) => i.series === s).length} enseignement(s) dans cette sélection</p>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-brand-950">{active ? `Thème : ${active.name}` : "Tous les enseignements"}</h2>
          {active && <Link href="/foi-et-bible" className="link-underline text-sm font-bold text-brand-700">Retirer le filtre ✕</Link>}
        </div>
        {items.length === 0 ? (
          <EmptyState title="Aucun enseignement pour ce thème pour l'instant">
            <Link href="/foi-et-bible" className="link-underline font-semibold text-brand-700">Voir tous les thèmes</Link>
          </EmptyState>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t, i) => <Reveal key={t.id} delay={i * 50}><ArticleCard c={t} /></Reveal>)}
          </div>
        )}
      </div>
    </>
  );
}