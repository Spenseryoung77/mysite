import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mic, Play, Headphones } from "lucide-react";
import { getEpisodes, getShowBySlug } from "@/lib/data";
import { EpisodeCard } from "@/components/site/cards";
import { Breadcrumb, EmptyState } from "@/components/site/ui";
import Reveal from "@/components/site/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const show = await getShowBySlug(slug);
  return { title: show ? `${show.title} — Émission` : "Émission introuvable", description: show?.description };
}

export default async function ShowPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const show = await getShowBySlug(slug);
  if (!show) notFound();
  const eps = await getEpisodes(show.id, 60);
  const isVideo = show.kind === "video";

  return (
    <>
      <section className="relative overflow-hidden bg-brand-950 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {show.coverUrl && <img src={show.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/80 to-brand-900/50" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <nav aria-label="Fil d'Ariane" className="mb-5 text-[13px] text-brand-200">
            <a href="/" className="hover:text-white">Accueil</a> <span className="mx-1 text-brand-400">/</span>
            <a href="/videos-podcasts" className="hover:text-white">Vidéos & podcasts</a> <span className="mx-1 text-brand-400">/</span>
            <span className="font-semibold text-white">{show.title}</span>
          </nav>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-flame-500 px-3 py-1 text-[11px] font-bold text-brand-950 uppercase">
            {isVideo ? <Play className="h-3 w-3" fill="currentColor" aria-hidden="true" /> : <Headphones className="h-3 w-3" aria-hidden="true" />}
            {isVideo ? "Émission vidéo" : "Podcast"}
          </span>
          <h1 className="font-display mt-4 max-w-2xl text-3xl font-extrabold text-balance sm:text-4xl">{show.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm font-bold text-flame-400"><Mic className="h-4 w-4" aria-hidden="true" /> {show.host}</p>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-brand-100">{show.description}</p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="font-display mb-6 text-xl font-extrabold text-brand-950">Les épisodes ({eps.length})</h2>
        {eps.length === 0 ? (
          <EmptyState title="Le premier épisode arrive bientôt" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eps.map((e, i) => <Reveal key={e.id} delay={i * 60}><EpisodeCard e={e} /></Reveal>)}
          </div>
        )}
      </div>
    </>
  );
}