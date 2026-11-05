import type { Metadata } from "next";
import Link from "next/link";
import { Play, Headphones, Mic } from "lucide-react";
import { getEpisodes, getShows } from "@/lib/data";
import { EpisodeCard } from "@/components/site/cards";
import { EmptyState } from "@/components/site/ui";
import PageHero from "@/components/site/page-hero";
import Reveal from "@/components/site/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Vidéos & podcasts",
  description: "Sessions de louange commentées et méditations audio : tous les épisodes de Paroles Inspirées, avec lecteurs chargés à la demande et transcriptions.",
};

export default async function MediasPage({ searchParams }: { searchParams: Promise<{ format?: string; emission?: string }> }) {
  const sp = await searchParams;
  const [shows, allEps] = await Promise.all([getShows(), getEpisodes(undefined, 60)]);
  const activeShow = shows.find((s) => s.slug === sp.emission);
  let eps = allEps;
  if (activeShow) eps = eps.filter((e) => e.showId === activeShow.id);
  else if (sp.format === "video") eps = eps.filter((e) => e.show?.kind === "video");
  else if (sp.format === "podcast") eps = eps.filter((e) => e.show?.kind === "podcast");

  const chip = (active: boolean) => `rounded-full px-4 py-2 text-[13px] font-bold transition ${active ? "bg-brand-900 text-white" : "bg-white text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50"}`;

  return (
    <>
      <PageHero kicker="À regarder, à écouter" title="Vidéos & podcasts">
        Deux émissions, un même soin : des lecteurs qui ne démarrent jamais tout seuls, des crédits clairs et des transcriptions quand elles existent.
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-10 grid gap-5 md:grid-cols-2">
          {shows.map((s, i) => {
            const count = allEps.filter((e) => e.showId === s.id).length;
            const isVideo = s.kind === "video";
            return (
              <Reveal key={s.id} delay={i * 80}>
                <Link href={`/emissions/${s.slug}`} className="card-hover group relative block overflow-hidden rounded-3xl bg-brand-950 text-white shadow-[var(--shadow-card)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.coverUrl && <img src={s.coverUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-40 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-30" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/60 to-brand-950/20" aria-hidden="true" />
                  <div className="relative flex min-h-[240px] flex-col p-7">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-flame-500 px-3 py-1 text-[11px] font-bold text-brand-950 uppercase">
                      {isVideo ? <Play className="h-3 w-3" fill="currentColor" aria-hidden="true" /> : <Headphones className="h-3 w-3" aria-hidden="true" />}
                      {isVideo ? "Émission vidéo" : "Podcast"}
                    </span>
                    <h2 className="font-display mt-3 text-2xl font-extrabold text-balance">{s.title}</h2>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-flame-400"><Mic className="h-3.5 w-3.5" aria-hidden="true" /> {s.host}</p>
                    <p className="mt-2 line-clamp-2 max-w-lg text-sm text-brand-100">{s.description}</p>
                    <p className="mt-auto pt-4 text-sm font-bold text-white">{count} épisode{count > 1 ? "s" : ""} <span aria-hidden="true" className="transition group-hover:translate-x-1 inline-block">→</span></p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer les épisodes">
          <Link href="/videos-podcasts" className={chip(!sp.format && !activeShow)}>Tous les épisodes</Link>
          <Link href="/videos-podcasts?format=video" className={chip(sp.format === "video")}>Vidéos</Link>
          <Link href="/videos-podcasts?format=podcast" className={chip(sp.format === "podcast")}>Podcasts</Link>
          {shows.map((s) => (
            <Link key={s.id} href={`/videos-podcasts?emission=${s.slug}`} className={chip(activeShow?.id === s.id)}>{s.title}</Link>
          ))}
          <p className="ml-auto text-sm text-ink-500">{eps.length} épisode{eps.length > 1 ? "s" : ""}</p>
        </div>

        {eps.length === 0 ? (
          <EmptyState title="Aucun épisode pour ce filtre">
            <Link href="/videos-podcasts" className="link-underline font-semibold text-brand-700">Voir tous les épisodes</Link>
          </EmptyState>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eps.map((e, i) => <Reveal key={e.id} delay={i * 50}><EpisodeCard e={e} /></Reveal>)}
          </div>
        )}
      </div>
    </>
  );
}