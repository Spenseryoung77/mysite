import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listPublished, sectionCategories, showsWithEpisodes } from "@/lib/queries";
import { CardGrid, Empty, PageHero } from "@/components/content";
import { SECTIONS, typeFromSlug } from "@/lib/site";

export const dynamic = "force-dynamic";
const PER_PAGE = 9;

type Props = { params: Promise<{ section: string }>; searchParams: Promise<{ categorie?: string; page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  const type = typeFromSlug(section);
  if (!type) return {};
  return { title: SECTIONS[type].label, description: SECTIONS[type].description, alternates: { canonical: `/${section}` } };
}

export default async function SectionPage({ params, searchParams }: Props) {
  const { section } = await params;
  const sp = await searchParams;
  const type = typeFromSlug(section);
  if (!type) notFound();
  const meta = SECTIONS[type];
  const page = Math.max(1, Number(sp.page) || 1);
  const [cats, { items, total }, showList] = await Promise.all([
    sectionCategories(type),
    listPublished({ type, categorySlug: sp.categorie, limit: PER_PAGE, offset: (page - 1) * PER_PAGE }),
    type === "episode" ? showsWithEpisodes() : Promise.resolve([]),
  ]);
  const pages = Math.ceil(total / PER_PAGE);
  const qs = (p: number) => `/${section}?${new URLSearchParams({ ...(sp.categorie ? { categorie: sp.categorie } : {}), page: String(p) })}`;

  return (
    <>
      <PageHero kicker="Rubrique" title={meta.label} description={meta.description} />
      <div className="container-pi py-10">
        {type === "temoignage" && (
          <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center">
            <p className="text-slate-700">Vous souhaitez partager votre parcours de foi ? Votre proposition reste privée jusqu’à validation avec vous.</p>
            <Link href="/proposer-un-temoignage" className="btn-primary shrink-0">Proposer un témoignage</Link>
          </div>
        )}
        {showList.length > 0 && (
          <section className="mb-10" aria-labelledby="emissions">
            <h2 id="emissions" className="mb-4 font-display text-xl font-black">Émissions</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {showList.map((s) => (
                <li key={s.id} className="card">
                  <p className="text-xs font-bold uppercase text-brand">{s.format === "podcast" ? "Podcast" : "Vidéo"} · {s.episodes} épisode{s.episodes > 1 ? "s" : ""}</p>
                  <h3 className="mt-1 font-display text-lg font-bold"><Link href={`/emissions/${s.slug}`} className="link">{s.title}</Link></h3>
                  {s.description && <p className="mt-1 text-sm text-slate-600">{s.description}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {cats.length > 0 && (
          <nav aria-label="Filtrer par catégorie" className="mb-8 flex flex-wrap gap-2">
            <Link href={`/${section}`} aria-current={!sp.categorie ? "page" : undefined} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold aria-[current=page]:border-brand aria-[current=page]:bg-brand aria-[current=page]:text-white">Tout</Link>
            {cats.map((c) => (
              <Link key={c.id} href={`/${section}?categorie=${c.slug}`} aria-current={sp.categorie === c.slug ? "page" : undefined} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:border-brand aria-[current=page]:border-brand aria-[current=page]:bg-brand aria-[current=page]:text-white">
                {c.name}
              </Link>
            ))}
          </nav>
        )}
        {items.length ? (
          <CardGrid items={items} />
        ) : (
          <Empty>Aucun contenu publié pour le moment dans cette rubrique. Revenez bientôt !</Empty>
        )}
        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">
            {page > 1 && <Link className="btn-ghost" href={qs(page - 1)}>← Plus récents</Link>}
            <span className="text-sm text-slate-600">Page {page} sur {pages}</span>
            {page < pages && <Link className="btn-ghost" href={qs(page + 1)}>Plus anciens →</Link>}
          </nav>
        )}
      </div>
    </>
  );
}
