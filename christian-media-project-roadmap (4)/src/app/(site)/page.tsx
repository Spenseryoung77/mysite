import Link from "next/link";
import type { ReactNode } from "react";
import { getAnyById, getHomeSettings, isPublished, listPublished, upcomingEvents, type Card } from "@/lib/queries";
import { CardGrid, ContentCard, Thumb, Badge } from "@/components/content";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Flame } from "@/components/Logo";
import { SECTIONS, contentHref, formatDate, type ContentType, type HomeSectionKey } from "@/lib/site";
import { db } from "@/db";
import { contents } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function featured(id: number | null, fallbackType: ContentType): Promise<Card | null> {
  if (id) {
    const ok = await db.select({ id: contents.id }).from(contents).where(and(eq(contents.id, id), isPublished())).limit(1);
    if (ok[0]) {
      const d = await getAnyById(id);
      if (d) {
        const c = d.c;
        return {
          id: c.id, type: c.type, slug: c.slug, title: c.title, excerpt: c.excerpt, imageUrl: c.imageUrl,
          imageAlt: c.imageAlt, publishedAt: c.publishedAt, nature: c.nature, mediaFormat: c.mediaFormat,
          duration: c.duration, bibleRef: c.bibleRef, categoryName: d.category?.name ?? null,
          authorName: d.author?.name ?? null, anonymized: c.anonymized,
        };
      }
    }
  }
  const { items } = await listPublished({ type: fallbackType, limit: 1 });
  return items[0] ?? null;
}

function SectionTitle({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="font-display text-2xl font-black text-ink md:text-3xl">{title}</h2>
      {href && <Link href={href} className="link shrink-0 text-sm">{linkLabel ?? "Tout voir"} →</Link>}
    </div>
  );
}

export default async function HomePage() {
  const settings = await getHomeSettings();
  const [une, meditation, latest, media, testimony, events] = await Promise.all([
    featured(settings.featuredId, "actualite"),
    listPublished({ type: "meditation", limit: 1 }).then((r) => r.items[0] ?? null),
    Promise.all([
      listPublished({ type: "actualite", limit: 6 }),
      listPublished({ type: "foi", limit: 6 }),
    ]).then(([a, b]) =>
      [...a.items, ...b.items].sort((x, y) => (y.publishedAt?.getTime() ?? 0) - (x.publishedAt?.getTime() ?? 0)),
    ),
    listPublished({ type: "episode", limit: 3 }).then((r) => r.items),
    featured(settings.testimonyId, "temoignage").then((t) => (t && t.type === "temoignage" ? t : null)),
    upcomingEvents(3),
  ]);
  const latestFiltered = latest.filter((l) => l.id !== une?.id).slice(0, 6);

  const blocks: Record<HomeSectionKey, ReactNode> = {
    une: une ? (
      <section key="une" className="bg-brand text-white">
        <div className="container-pi grid items-center gap-8 py-10 md:grid-cols-2 md:py-16">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-100"><Flame className="h-4 w-4" /> À la une · {SECTIONS[une.type as ContentType]?.label}</p>
            <h1 className="mt-3 font-display text-3xl font-black leading-tight md:text-5xl">{une.title}</h1>
            {une.excerpt && <p className="mt-4 text-lg text-blue-100">{une.excerpt}</p>}
            <p className="mt-3 text-sm text-blue-200">{formatDate(une.publishedAt)}{une.authorName ? ` · ${une.authorName}` : ""}</p>
            <Link href={contentHref(une)} className="btn-light mt-6">Lire la suite</Link>
          </div>
          <Thumb src={une.imageUrl} alt={une.imageAlt} className="aspect-[16/10] w-full rounded-2xl" />
        </div>
      </section>
    ) : null,
    meditation: meditation ? (
      <section key="meditation" className="container-pi py-12">
        <div className="grid overflow-hidden rounded-3xl bg-brand-50 md:grid-cols-5">
          <div className="p-8 md:col-span-3 md:p-10">
            <p className="text-sm font-bold uppercase tracking-widest text-brand">Méditation</p>
            <h2 className="mt-2 font-display text-2xl font-black md:text-3xl">{meditation.title}</h2>
            {meditation.bibleRef && <p className="mt-2 font-semibold text-brand">{meditation.bibleRef}</p>}
            {meditation.excerpt && <p className="mt-3 text-slate-700">{meditation.excerpt}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={contentHref(meditation)} className="btn-primary">Méditer ce texte</Link>
              <Link href="/meditations" className="btn-ghost">Archives</Link>
            </div>
          </div>
          <Thumb src={meditation.imageUrl} alt={meditation.imageAlt} className="h-56 w-full md:col-span-2 md:h-full" />
        </div>
      </section>
    ) : null,
    derniers: latestFiltered.length ? (
      <section key="derniers" className="container-pi py-12">
        <SectionTitle title="Derniers articles" href="/actualites" linkLabel="Toutes les actualités" />
        <CardGrid items={latestFiltered} showSection />
      </section>
    ) : null,
    media: media.length ? (
      <section key="media" className="bg-slate-50 py-12">
        <div className="container-pi">
          <SectionTitle title="À regarder / à écouter" href="/videos" />
          <CardGrid items={media} />
        </div>
      </section>
    ) : null,
    temoignage: testimony ? (
      <section key="temoignage" className="container-pi py-12">
        <SectionTitle title="Témoignage" href="/temoignages" linkLabel="Tous les témoignages" />
        <div className="max-w-3xl"><ContentCard item={testimony} /></div>
      </section>
    ) : null,
    mission: (
      <section key="mission" className="container-pi py-12">
        <div className="grid gap-8 rounded-3xl border border-slate-200 p-8 md:grid-cols-3 md:p-10">
          <div className="md:col-span-2">
            <h2 className="font-display text-2xl font-black md:text-3xl">Notre mission</h2>
            <p className="mt-3 text-lg text-slate-700">
              Paroles Inspirées est un média chrétien francophone qui veut aider chacun à s’informer avec justesse,
              nourrir sa foi et découvrir des témoignages d’espérance — sur téléphone comme sur ordinateur.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/a-propos" className="btn-primary">Découvrir le média</Link>
              <Link href="/a-propos#charte" className="btn-ghost">Notre charte éditoriale</Link>
            </div>
          </div>
          <ul className="space-y-3 text-sm">
            {["Auteurs identifiés et sources citées", "Faits, opinions et enseignements distingués", "Témoignages publiés avec accord", "Erreurs corrigées et signalées"].map((t) => (
              <li key={t} className="flex gap-2"><span className="text-brand" aria-hidden="true">✓</span>{t}</li>
            ))}
          </ul>
        </div>
      </section>
    ),
    evenements: events.length ? (
      <section key="evenements" className="container-pi py-12">
        <SectionTitle title="Événements à venir" href="/evenements" />
        <ul className="grid gap-4 md:grid-cols-3">
          {events.map((e) => (
            <li key={e.id} className="card">
              <p className="text-sm font-bold text-brand">{formatDate(e.startsAt, true)}</p>
              <h3 className="mt-1 font-display font-bold">{e.title}</h3>
              {e.status === "annule" && <Badge tone="amber">Annulé</Badge>}
              <p className="mt-1 text-sm text-slate-600">{e.location || (e.onlineUrl ? "En ligne" : "")}</p>
            </li>
          ))}
        </ul>
      </section>
    ) : null,
    newsletter: (
      <section key="newsletter" className="container-pi py-12">
        <div className="rounded-3xl bg-brand p-8 text-white md:p-12">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-display text-2xl font-black md:text-3xl">Restez inspiré</h2>
              <p className="mt-2 text-blue-100">Les nouvelles méditations, articles et émissions directement dans votre boîte mail.</p>
            </div>
            <NewsletterForm dark />
          </div>
        </div>
      </section>
    ),
  };

  const visible = settings.order.filter((o) => o.visible).map((o) => blocks[o.key]).filter(Boolean);
  const hasH1 = settings.order.find((o) => o.key === "une")?.visible && une;

  return (
    <>
      {!hasH1 && <h1 className="sr-only">Paroles Inspirées — média chrétien francophone</h1>}
      {visible}
      {!une && !meditation && latestFiltered.length === 0 && (
        <p className="container-pi py-6 text-center text-slate-600">Les premiers contenus arrivent bientôt.</p>
      )}
    </>
  );
}
