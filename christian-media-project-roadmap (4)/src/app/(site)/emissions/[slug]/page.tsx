import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { shows } from "@/db/schema";
import { listPublished } from "@/lib/queries";
import { Breadcrumbs, CardGrid, Empty } from "@/components/content";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

async function getShow(slug: string) {
  return (await db.select().from(shows).where(eq(shows.slug, slug)).limit(1))[0];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getShow((await params).slug);
  return s ? { title: s.title, description: s.description ?? undefined } : {};
}

export default async function ShowPage({ params }: Props) {
  const show = await getShow((await params).slug);
  if (!show) notFound();
  const { items } = await listPublished({ showId: show.id, limit: 50 });
  return (
    <>
      <section className="bg-brand text-white">
        <div className="container-pi py-12">
          <div className="[&_a]:text-white [&_*]:text-blue-100"><Breadcrumbs items={[{ href: "/", label: "Accueil" }, { href: "/videos", label: "Vidéos & podcasts" }, { label: show.title }]} /></div>
          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-blue-100">Émission {show.format === "podcast" ? "podcast" : "vidéo"}</p>
          <h1 className="mt-1 font-display text-3xl font-black md:text-5xl">{show.title}</h1>
          {show.description && <p className="mt-3 max-w-2xl text-lg text-blue-100">{show.description}</p>}
          {show.host && <p className="mt-3 text-sm">Animation : <strong>{show.host}</strong></p>}
        </div>
      </section>
      <div className="container-pi py-10">
        <h2 className="mb-6 font-display text-2xl font-black">Épisodes</h2>
        {items.length ? <CardGrid items={items} /> : <Empty>Aucun épisode publié pour le moment.</Empty>}
      </div>
    </>
  );
}
