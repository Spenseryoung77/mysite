import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Info } from "lucide-react";
import { getEpisodeBySlug, getEpisodes } from "@/lib/data";
import { Breadcrumb, Chip } from "@/components/site/ui";
import { EpisodeCard } from "@/components/site/cards";
import MediaPlayer from "@/components/site/media-player";
import ShareButtons from "@/components/site/share-buttons";
import { formatDate } from "@/lib/utils";
import Reveal from "@/components/site/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEpisodeBySlug(slug);
  return { title: e ? e.title : "Épisode introuvable", description: e?.summary };
}

export default async function EpisodePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ep = await getEpisodeBySlug(slug);
  if (!ep) notFound();
  const others = (await getEpisodes(ep.showId, 10)).filter((e) => e.id !== ep.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumb items={[{ label: "Vidéos & podcasts", href: "/videos-podcasts" }, { label: ep.show?.title ?? "Émission", href: `/emissions/${ep.show?.slug}` }, { label: ep.title }]} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Chip tone="gold">{ep.show?.kind === "video" ? "Vidéo" : "Podcast"} · {ep.duration}</Chip>
            {ep.show && <Chip>{ep.show.title}</Chip>}
          </div>
          <h1 className="font-display text-2xl leading-tight font-extrabold text-balance text-brand-950 sm:text-3xl">{ep.title}</h1>
          <p className="mt-2 text-sm text-ink-500">Publié le <time dateTime={ep.publishedAt.toISOString()}>{formatDate(ep.publishedAt)}</time> · {ep.show?.host}</p>

          <div className="mt-6">
            {ep.youtubeId ? (
              <MediaPlayer kind="youtube" src={ep.youtubeId} poster={ep.thumbnailUrl} title={ep.title} duration={ep.duration} />
            ) : ep.audioUrl ? (
              <MediaPlayer kind="audio" src={ep.audioUrl} title={ep.title} duration={ep.duration} />
            ) : (
              <p className="rounded-xl bg-warn-100 p-4 text-sm text-ink-700">Le média de cet épisode sera bientôt disponible.</p>
            )}
          </div>

          <div className="prose-pi no-dropcap mt-8 max-w-[70ch]">
            <p>{ep.summary}</p>
          </div>

          {ep.transcript && (
            <details className="group mt-6 max-w-[70ch] overflow-hidden rounded-2xl border border-brand-200 bg-white">
              <summary className="flex cursor-pointer items-center gap-2 px-5 py-4 text-sm font-bold text-brand-900 transition hover:bg-brand-50">
                <FileText className="h-4 w-4 text-brand-600" aria-hidden="true" /> Transcription & déroulé
                <span className="ml-auto text-brand-400 transition group-open:rotate-180" aria-hidden="true">▾</span>
              </summary>
              <p className="border-t border-brand-100 px-5 py-4 text-sm leading-relaxed text-ink-700">{ep.transcript}</p>
            </details>
          )}

          {ep.credit && (
            <p className="mt-6 flex max-w-[70ch] items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-xs text-ink-500">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" /> {ep.credit}
            </p>
          )}

          <div className="mt-8"><ShareButtons title={ep.title} /></div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-brand-100">
            <h2 className="font-display mb-1 text-base font-extrabold text-brand-950">L'émission</h2>
            <p className="text-sm text-ink-500">{ep.show?.description}</p>
            <Link href={`/emissions/${ep.show?.slug}`} className="link-underline mt-3 inline-block text-sm font-bold text-brand-700">Tous les épisodes →</Link>
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <Reveal className="mt-14">
          <h2 className="font-display mb-6 text-2xl font-extrabold text-brand-950">À écouter ensuite</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((e) => <EpisodeCard key={e.id} e={e} />)}
          </div>
        </Reveal>
      )}
    </div>
  );
}