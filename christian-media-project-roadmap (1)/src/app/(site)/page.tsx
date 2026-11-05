import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, BookOpen, HandHeart, Heart, Sparkles, ShieldCheck, Users } from "lucide-react";
import {
  getFeatured, getLatestMeditation, getPublished, getEpisodes, getFeaturedTestimony,
  getEvents, getCategories, getHomeSections,
} from "@/lib/data";
import { contentUrl, formatDate } from "@/lib/utils";
import { ArticleCard, EpisodeCard, MeditationPanel } from "@/components/site/cards";
import { Avatar, Chip, FlameMark, Kicker, SectionHead } from "@/components/site/ui";
import NewsletterForm from "@/components/site/newsletter-form";
import Reveal from "@/components/site/reveal";

export const dynamic = "force-dynamic";

const THEME_ICONS: Record<string, typeof BookOpen> = {
  bible: BookOpen, priere: HandHeart, "vie-chretienne": Heart, "questions-de-foi": Sparkles,
};

export default async function HomePage() {
  const [featured, meditation, latest, teachings, eps, testimony, evts, themes, sections] = await Promise.all([
    getFeatured(),
    getLatestMeditation(),
    getPublished("article", { limit: 7 }),
    getPublished("enseignement", { limit: 3 }),
    getEpisodes(undefined, 3),
    getFeaturedTestimony(),
    getEvents(),
    getCategories("foi"),
    getHomeSections(),
  ]);

  const articles = latest.items.filter((a) => a.id !== featured?.id).slice(0, 6);
  const upcoming = evts.upcoming.slice(0, 3);

  const blocks: Record<string, React.ReactNode> = {
    articles: articles.length > 0 && (
      <section key="articles" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Reveal>
          <SectionHead kicker="L'information vérifiée" title="Dernières actualités" href="/actualites" linkLabel="Toutes les actualités" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => <Reveal key={a.id} delay={i * 60}><ArticleCard c={a} /></Reveal>)}
          </div>
        </Reveal>
      </section>
    ),
    foi: teachings.items.length > 0 && (
      <section key="foi" className="bg-brand-50/80">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Reveal>
            <SectionHead kicker="Enseignements & dossiers" title="Foi & Bible" href="/foi-et-bible" linkLabel="Explorer les thèmes" />
            <div className="mb-8 flex flex-wrap gap-2.5">
              {themes.map((t) => {
                const Icon = THEME_ICONS[t.slug] ?? BookOpen;
                return (
                  <Link key={t.id} href={`/foi-et-bible?theme=${t.slug}`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-brand-800 shadow-sm ring-1 ring-brand-200 transition hover:-translate-y-0.5 hover:bg-brand-900 hover:text-white">
                    <Icon className="h-4 w-4 text-flame-600" aria-hidden="true" /> {t.name}
                  </Link>
                );
              })}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teachings.items.map((t, i) => <Reveal key={t.id} delay={i * 60}><ArticleCard c={t} /></Reveal>)}
            </div>
          </Reveal>
        </div>
      </section>
    ),
    medias: eps.length > 0 && (
      <section key="medias" className="grain relative overflow-hidden bg-brand-950">
        <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-brand-600/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-flame-600/15 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Reveal>
            <SectionHead dark kicker="Vidéos & podcasts" title="À regarder, à écouter" href="/videos-podcasts" linkLabel="Tous les épisodes" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eps.map((e, i) => <Reveal key={e.id} delay={i * 60}><EpisodeCard e={e} dark /></Reveal>)}
            </div>
          </Reveal>
        </div>
      </section>
    ),
    temoignage: testimony && (
      <section key="temoignage" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.4fr]">
            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-flame-400 to-brand-600 opacity-20 blur-xl" aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {testimony.imageUrl && <img src={testimony.imageUrl} alt={testimony.imageAlt} loading="lazy" className="relative aspect-[4/5] w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]" />}
              <span className="absolute -bottom-4 left-6"><Chip tone="gold">Témoignage</Chip></span>
            </div>
            <div>
              <Kicker>Ils racontent</Kicker>
              <span className="font-display block text-7xl leading-none font-extrabold text-brand-200" aria-hidden="true">«</span>
              <h2 className="font-display -mt-4 text-2xl leading-tight font-extrabold text-balance text-brand-950 sm:text-3xl">{testimony.title}</h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-500">{testimony.chapo}</p>
              {testimony.consentNote && (
                <p className="mt-4 flex items-start gap-2 text-xs text-ink-500">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" /> {testimony.consentNote}
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={contentUrl(testimony)} className="inline-flex items-center gap-2 rounded-full bg-brand-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700">
                  Lire son histoire <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/temoignages#proposer" className="link-underline inline-flex items-center px-2 py-3 text-sm font-bold text-brand-700">
                  Proposer un témoignage
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    ),
    evenements: upcoming.length > 0 && (
      <section key="evenements" className="bg-brand-50/80">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Reveal>
            <SectionHead kicker="Agenda" title="Prochains rendez-vous" href="/evenements" linkLabel="Tout l'agenda" />
            <div className="grid gap-4 lg:grid-cols-3">
              {upcoming.map((e, i) => (
                <Reveal key={e.id} delay={i * 60}>
                  <div className="card-hover flex h-full gap-4 rounded-2xl bg-white p-5 shadow-[var(--shadow-card)] ring-1 ring-brand-100">
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-900 text-white">
                      <span className="font-display text-2xl leading-none font-extrabold">{formatDate(e.startsAt, { day: "numeric" })}</span>
                      <span className="text-[10px] font-bold tracking-widest uppercase">{formatDate(e.startsAt, { month: "short" })}</span>
                    </div>
                    <div className="min-w-0">
                      <Link href="/evenements" className="font-display line-clamp-2 text-[15px] leading-snug font-extrabold text-brand-950 hover:text-brand-700">{e.title}</Link>
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-500"><MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />{e.isOnline ? "En ligne" : e.city}</p>
                      {!e.isOrganizerOurs && <p className="mt-1 text-[11px] text-ink-500">Relayé — org. : {e.organizer}</p>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    ),
  };

  return (
    <>
      {/* ------- À la une + méditation ------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_0%,#dfeaf9_0%,transparent_70%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-14 sm:px-6">
          <div className="stagger grid gap-8 lg:grid-cols-[1.55fr_1fr]">
            {featured && (
              <article className="group">
                <Link href={contentUrl(featured)} className="relative block overflow-hidden rounded-3xl shadow-[var(--shadow-lift)]">
                  <div className="aspect-[16/9] overflow-hidden bg-brand-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {featured.imageUrl && <img src={featured.imageUrl} alt={featured.imageAlt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />}
                  </div>
                  <span className="absolute top-4 left-4 flex gap-2">
                    <Chip tone="gold">À la une</Chip>
                    {featured.category && <Chip tone="white">{featured.category.name}</Chip>}
                  </span>
                </Link>
                <h1 className="font-display mt-6 text-3xl leading-[1.06] font-extrabold tracking-tight text-balance text-brand-950 sm:text-4xl">
                  <Link href={contentUrl(featured)} className="transition-colors hover:text-brand-700">{featured.title}</Link>
                </h1>
                <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-500">{featured.chapo}</p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar author={featured.author} size="sm" />
                    <p className="text-sm">
                      <span className="font-bold text-ink-700">{featured.author?.name}</span>
                      <span className="text-ink-500"> · {formatDate(featured.publishedAt)}</span>
                    </p>
                  </div>
                  <Link href={contentUrl(featured)} className="inline-flex items-center gap-2 rounded-full bg-brand-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700">
                    Lire l'article <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            )}
            <div className="flex flex-col gap-5">
              {meditation && <div className="flex-1"><MeditationPanel c={meditation} /></div>}
              {articles[0] && (
                <Link href={contentUrl(articles[0])} className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[var(--shadow-card)] ring-1 ring-brand-100 transition hover:-translate-y-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {articles[0].imageUrl && <img src={articles[0].imageUrl} alt="" className="h-16 w-24 shrink-0 rounded-xl object-cover" />}
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-brand-600 uppercase">À découvrir aussi</p>
                    <p className="line-clamp-2 text-sm leading-snug font-bold text-brand-950 group-hover:text-brand-700">{articles[0].title}</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------- Sections configurables ------- */}
      {sections.filter((s) => s.visible).map((s) => blocks[s.id])}

      {/* ------- Mission ------- */}
      <section className="relative overflow-hidden bg-brand-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/flamme-horizon.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/70 via-brand-950/40 to-brand-950/80" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <Reveal>
            <FlameMark className="mx-auto h-14 w-14" />
            <h2 className="font-display mt-6 text-3xl font-extrabold text-balance text-white sm:text-4xl">Raconter la foi, vérifier les faits, servir l'espérance</h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-brand-100">
              Paroles Inspirées est un média chrétien francophone indépendant. Nous racontons ce que vivent les communautés, nous ouvrons la Bible avec sérieux et nous donnons la parole à des parcours de vie — avec l'accord des personnes, des sources citées et des erreurs corrigées.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur"><ShieldCheck className="h-3.5 w-3.5 text-flame-400" aria-hidden="true" /> Faits vérifiés</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur"><Users className="h-3.5 w-3.5 text-flame-400" aria-hidden="true" /> Auteurs identifiés</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur"><HandHeart className="h-3.5 w-3.5 text-flame-400" aria-hidden="true" /> Personnes respectées</span>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/a-propos" className="rounded-full bg-flame-500 px-6 py-3 text-sm font-bold text-brand-950 transition hover:bg-flame-400">Découvrir notre mission</Link>
              <Link href="/contact" className="rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">Nous écrire</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------- Newsletter ------- */}
      <section id="newsletter" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl rounded-3xl bg-brand-50 p-8 ring-1 ring-brand-100 sm:p-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-900 text-flame-400"><CalendarDays className="h-5 w-5" aria-hidden="true" /></span>
              <div>
                <h2 className="font-display text-2xl font-extrabold text-brand-950">La lettre du vendredi</h2>
                <p className="text-sm text-ink-500">Une méditation, trois articles, un chant. Rien de plus.</p>
              </div>
            </div>
            <NewsletterForm />
          </div>
        </Reveal>
      </section>
    </>
  );
}