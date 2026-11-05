import Link from "next/link";
import { Clock, ShieldCheck, BookOpen, HandHeart, Video, Headphones, FileText } from "lucide-react";
import type { ContentFull } from "@/lib/data";
import { getRelated } from "@/lib/data";
import { contentUrl, formatDate, paragraphs, readingTime, TYPE_LABELS, TYPE_ROUTES } from "@/lib/utils";
import { Avatar, Breadcrumb, Chip, VerseBlock } from "./ui";
import { ArticleCard } from "./cards";
import ShareButtons from "./share-buttons";
import MediaPlayer from "./media-player";
import Reveal from "./reveal";
import NewsletterForm from "./newsletter-form";

const RUBRIQUE_LABELS: Record<string, string> = {
  article: "Actualités",
  enseignement: "Foi & Bible",
  meditation: "Méditations",
  temoignage: "Témoignages",
};

export default async function ArticleView({ c }: { c: ContentFull }) {
  const related = await getRelated(c, 3);
  const paras = paragraphs(c.body);
  const isMeditation = c.type === "meditation";
  const isTestimony = c.type === "temoignage";
  const updated = c.updatedAt && c.publishedAt && c.updatedAt.getTime() - c.publishedAt.getTime() > 86_400_000 ? c.updatedAt : null;
  const FmtIcon = c.format === "video" ? Video : c.format === "audio" ? Headphones : FileText;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumb items={[{ label: RUBRIQUE_LABELS[c.type], href: TYPE_ROUTES[c.type] }, { label: c.title }]} />

      <header className="max-w-3xl">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {isTestimony ? (
            <Chip tone="gold"><FmtIcon className="h-3 w-3" aria-hidden="true" /> Témoignage {c.format ?? "texte"}</Chip>
          ) : (
            <Chip tone={c.type === "enseignement" ? "gold" : "blue"}>{TYPE_LABELS[c.type]}</Chip>
          )}
          {c.category && <Chip>{c.category.name}</Chip>}
          {c.series && <Chip>{c.series}</Chip>}
        </div>
        <h1 className="font-display text-3xl leading-[1.08] font-extrabold tracking-tight text-balance text-brand-950 sm:text-4xl lg:text-[44px]">{c.title}</h1>
        {c.chapo && <p className="mt-4 text-lg leading-relaxed text-ink-500">{c.chapo}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-brand-100 py-4">
          <div className="flex items-center gap-3">
            <Avatar author={c.author} />
            <div className="text-sm">
              <Link href={`/auteurs/${c.author?.slug ?? "la-redaction"}`} className="link-underline font-bold text-brand-900">{c.author?.name ?? "La Rédaction"}</Link>
              <p className="text-xs text-ink-500">
                <time dateTime={c.publishedAt?.toISOString()}>{formatDate(c.publishedAt)}</time>
                {updated && <> · mis à jour le <time dateTime={updated.toISOString()}>{formatDate(updated)}</time></>}
                {" · "}<span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" />{readingTime(c.body)} min de lecture</span>
              </p>
            </div>
          </div>
          <ShareButtons title={c.title} />
        </div>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article>
          {c.imageUrl && !isMeditation && (
            <figure className="mb-8">
              <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.imageUrl} alt={c.imageAlt} className={`w-full object-cover ${isTestimony ? "max-h-[480px]" : "aspect-[16/9]"}`} />
              </div>
              {c.imageCredit && <figcaption className="mt-2 text-xs text-ink-500">{c.imageCredit}</figcaption>}
            </figure>
          )}

          {isTestimony && c.mediaUrl && (
            <div className="mb-8">
              {c.format === "video" ? (
                <MediaPlayer kind="youtube" src={c.mediaUrl} poster={c.imageUrl} title={c.title} />
              ) : c.format === "audio" ? (
                <MediaPlayer kind="audio" src={c.mediaUrl} title={c.title} />
              ) : null}
            </div>
          )}

          {isMeditation && c.verseText && c.verseRef && (
            <div className="mb-8"><VerseBlock reference={c.verseRef} text={c.verseText} translation={c.verseTranslation} /></div>
          )}

          <div className={`prose-pi max-w-[70ch] ${isTestimony ? "no-dropcap" : ""}`}>
            {paras.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {!isMeditation && c.verseText && c.verseRef && (
            <div className="my-8 max-w-[70ch]"><VerseBlock reference={c.verseRef} text={c.verseText} translation={c.verseTranslation} /></div>
          )}

          {isMeditation && c.prayer && (
            <div className="my-8 max-w-[70ch] rounded-2xl border border-brand-200 bg-brand-50 p-7">
              <p className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] text-brand-600 uppercase">
                <HandHeart className="h-4 w-4" aria-hidden="true" /> Prière
              </p>
              <p className="font-display text-lg leading-relaxed font-semibold text-brand-900 italic">{c.prayer}</p>
            </div>
          )}

          {isTestimony && c.consentNote && (
            <div className="my-8 flex max-w-[70ch] items-start gap-3 rounded-2xl bg-success-100 p-5 text-sm text-ink-700">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success-600" aria-hidden="true" />
              <p><span className="font-bold text-success-600">Publié avec accord.</span> {c.consentNote}</p>
            </div>
          )}

          {c.sources && (
            <div className="my-8 max-w-[70ch] rounded-2xl border border-brand-100 bg-white p-5 text-sm text-ink-500">
              <p className="mb-1 flex items-center gap-2 font-bold text-ink-700"><BookOpen className="h-4 w-4 text-brand-600" aria-hidden="true" /> Sources & méthode</p>
              {c.sources} Une erreur ? <Link href="/contact" className="link-underline font-semibold text-brand-700">Signalez-la à la rédaction</Link>, nous corrigeons et datons chaque correction.
            </div>
          )}

          {/* Encadré auteur */}
          <div className="mt-10 flex max-w-[70ch] flex-col gap-4 rounded-2xl bg-brand-50 p-6 sm:flex-row sm:items-start">
            <Avatar author={c.author} size="lg" />
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-brand-600 uppercase">{c.author?.role ?? "Collectif"}</p>
              <Link href={`/auteurs/${c.author?.slug ?? "la-redaction"}`} className="link-underline font-display text-lg font-extrabold text-brand-950">{c.author?.name ?? "La Rédaction"}</Link>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{c.author?.bio}</p>
            </div>
          </div>
        </article>

        {/* Colonne latérale */}
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-brand-100">
            <h2 className="font-display mb-1 text-base font-extrabold text-brand-950">La lettre du vendredi</h2>
            <p className="mb-4 text-sm text-ink-500">L'essentiel de la semaine, choisi par la rédaction.</p>
            <NewsletterForm compact={false} />
          </div>
          {related.length > 0 && (
            <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-brand-100">
              <h2 className="font-display mb-4 text-base font-extrabold text-brand-950">À lire ensuite</h2>
              <ul className="space-y-4">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={contentUrl(r)} className="group flex gap-3">
                      {r.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.imageUrl} alt="" loading="lazy" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                      )}
                      <span>
                        <span className="line-clamp-2 text-[13px] leading-snug font-bold text-ink-700 group-hover:text-brand-700">{r.title}</span>
                        <span className="mt-1 block text-xs text-ink-500">{formatDate(r.publishedAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <Reveal className="mt-16">
          <h2 className="font-display mb-6 text-2xl font-extrabold text-brand-950">Dans la même rubrique</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <ArticleCard key={r.id} c={r} />)}
          </div>
        </Reveal>
      )}
    </div>
  );
}