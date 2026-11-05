import Link from "next/link";
import { Play, Headphones, FileText, Video, Clock } from "lucide-react";
import type { ContentFull } from "@/lib/data";
import type { Episode, Show } from "@/db/schema";
import { contentUrl, formatDate, readingTime } from "@/lib/utils";
import { Chip } from "./ui";

export function ArticleCard({ c, showImage = true, big = false }: { c: ContentFull; showImage?: boolean; big?: boolean }) {
  return (
    <article className="card-hover group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] ring-1 ring-brand-100">
      {showImage && c.imageUrl && (
        <Link href={contentUrl(c)} tabIndex={-1} aria-hidden="true" className="block overflow-hidden">
          <div className={`${big ? "aspect-[16/9]" : "aspect-[16/10]"} overflow-hidden bg-brand-100`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.imageUrl} alt={c.imageAlt} loading="lazy" className="card-img h-full w-full object-cover" />
          </div>
        </Link>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          {c.category && <Chip>{c.category.name}</Chip>}
          {c.series && <Chip tone="gold">{c.series}</Chip>}
        </div>
        <h3 className={`font-display font-extrabold text-balance text-brand-950 ${big ? "text-xl sm:text-2xl" : "text-[17px] leading-snug"}`}>
          <Link href={contentUrl(c)} className="transition-colors group-hover:text-brand-700">{c.title}</Link>
        </h3>
        {c.chapo && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">{c.chapo}</p>}
        <p className="mt-auto flex flex-wrap items-center gap-x-2 pt-4 text-xs text-ink-500">
          <span className="font-bold text-ink-700">{c.author?.name ?? "La Rédaction"}</span>
          <span aria-hidden="true" className="text-brand-300">•</span>
          <time dateTime={c.publishedAt?.toISOString()}>{formatDate(c.publishedAt)}</time>
          <span aria-hidden="true" className="text-brand-300">•</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" />{readingTime(c.body)} min</span>
        </p>
      </div>
    </article>
  );
}

const FORMAT_META: Record<string, { label: string; icon: typeof FileText }> = {
  texte: { label: "Texte", icon: FileText },
  video: { label: "Vidéo", icon: Video },
  audio: { label: "Audio", icon: Headphones },
};

export function TestimonyCard({ c }: { c: ContentFull }) {
  const fmt = FORMAT_META[c.format ?? "texte"] ?? FORMAT_META.texte;
  const Icon = fmt.icon;
  return (
    <article className="card-hover group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] ring-1 ring-brand-100">
      <Link href={contentUrl(c)} tabIndex={-1} aria-hidden="true" className="relative block overflow-hidden">
        <div className="aspect-[16/10] overflow-hidden bg-brand-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {c.imageUrl && <img src={c.imageUrl} alt={c.imageAlt} loading="lazy" className="card-img h-full w-full object-cover" />}
        </div>
        <span className="absolute top-3 left-3"><Chip tone="white"><Icon className="h-3 w-3" aria-hidden="true" /> {fmt.label}</Chip></span>
        {c.format === "video" && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-brand-900 shadow-lg transition-transform group-hover:scale-110">
              <Play className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true" />
            </span>
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[17px] leading-snug font-extrabold text-balance text-brand-950">
          <Link href={contentUrl(c)} className="transition-colors group-hover:text-brand-700">{c.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-500">{c.chapo}</p>
        <p className="mt-auto flex items-center gap-2 pt-4 text-xs text-ink-500">
          <time dateTime={c.publishedAt?.toISOString()}>{formatDate(c.publishedAt)}</time>
          {c.anonymized && <span className="rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">Prénom modifié</span>}
        </p>
      </div>
    </article>
  );
}

export function EpisodeCard({ e, dark = false }: { e: Episode & { show: Show | null }; dark?: boolean }) {
  const isVideo = e.show?.kind === "video";
  return (
    <article className={`card-hover group flex h-full flex-col overflow-hidden rounded-2xl ${dark ? "bg-brand-900/60 ring-1 ring-brand-700/60" : "bg-white shadow-[var(--shadow-card)] ring-1 ring-brand-100"}`}>
      <Link href={`/episodes/${e.slug}`} tabIndex={-1} aria-hidden="true" className="relative block overflow-hidden">
        <div className="aspect-video overflow-hidden bg-brand-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {e.thumbnailUrl && <img src={e.thumbnailUrl} alt="" loading="lazy" className="card-img h-full w-full object-cover opacity-90" />}
        </div>
        <span className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-flame-500 text-brand-950 shadow-lg transition-transform group-hover:scale-110">
            {isVideo ? <Play className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden="true" /> : <Headphones className="h-4 w-4" aria-hidden="true" />}
          </span>
          <span className="rounded-full bg-brand-950/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">{isVideo ? "Vidéo" : "Podcast"} · {e.duration}</span>
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className={`text-[11px] font-bold tracking-[0.18em] uppercase ${dark ? "text-flame-400" : "text-brand-600"}`}>{e.show?.title}</p>
        <h3 className={`font-display mt-1.5 text-[16px] leading-snug font-extrabold text-balance ${dark ? "text-white" : "text-brand-950"}`}>
          <Link href={`/episodes/${e.slug}`} className={dark ? "hover:text-flame-400" : "group-hover:text-brand-700"}>{e.title}</Link>
        </h3>
        <p className={`mt-2 line-clamp-2 text-sm ${dark ? "text-brand-200" : "text-ink-500"}`}>{e.summary}</p>
        <p className={`mt-auto pt-4 text-xs ${dark ? "text-brand-300" : "text-ink-500"}`}>
          <time dateTime={e.publishedAt.toISOString()}>{formatDate(e.publishedAt)}</time>
        </p>
      </div>
    </article>
  );
}

export function MeditationPanel({ c, label = "Méditation du jour" }: { c: ContentFull; label?: string }) {
  return (
    <aside className="grain relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 p-7 text-white shadow-[var(--shadow-lift)]">
      <svg viewBox="0 0 64 64" className="flame-glow pointer-events-none absolute -top-6 -right-6 h-44 w-44 opacity-[0.12]" aria-hidden="true">
        <path d="M32 9c2.6 6.2 11 11.4 11 20.3C43 37.6 38.1 44 32 44s-11-6.4-11-14.7c0-3.6 1.3-6.7 3.3-9.8 1 2.7 2.5 4.4 4.6 5.5C28.2 20.6 29.6 14.6 32 9Z" fill="#F5B942" />
      </svg>
      <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] text-flame-400 uppercase">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-flame-400" aria-hidden="true" /> {label}
      </p>
      <time className="mt-1 text-xs text-brand-200" dateTime={c.publishedAt?.toISOString()}>{formatDate(c.publishedAt, { weekday: "long", day: "numeric", month: "long" })}</time>
      <h3 className="font-display mt-4 text-2xl leading-tight font-extrabold text-balance">
        <Link href={contentUrl(c)} className="hover:text-flame-400">{c.title}</Link>
      </h3>
      {c.verseText && (
        <blockquote className="mt-4 border-l-2 border-flame-500 pl-4 text-[15px] leading-relaxed text-brand-100 italic">
          « {c.verseText} »
          <footer className="mt-2 text-xs font-bold text-flame-400 not-italic">{c.verseRef} · {c.verseTranslation}</footer>
        </blockquote>
      )}
      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-brand-200">{c.chapo}</p>
      <div className="mt-auto pt-6">
        <Link
          href={contentUrl(c)}
          className="inline-flex items-center gap-2 rounded-full bg-flame-500 px-5 py-2.5 text-sm font-bold text-brand-950 transition hover:bg-flame-400"
        >
          Lire la méditation <span aria-hidden="true">→</span>
        </Link>
      </div>
    </aside>
  );
}