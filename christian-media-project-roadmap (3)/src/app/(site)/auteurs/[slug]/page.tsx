import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { authors } from "@/db/schema";
import { listPublished } from "@/lib/queries";
import { CardGrid, Empty, PageHero } from "@/components/content";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

async function getAuthor(slug: string) {
  return (await db.select().from(authors).where(eq(authors.slug, slug)).limit(1))[0];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getAuthor((await params).slug);
  return a ? { title: a.name, description: a.bio ?? undefined } : {};
}

export default async function AuthorPage({ params }: Props) {
  const a = await getAuthor((await params).slug);
  if (!a) notFound();
  const { items } = await listPublished({ authorId: a.id, limit: 30 });
  const visible = items.filter((i) => !(i.type === "temoignage" && i.anonymized));
  return (
    <>
      <PageHero kicker="Auteur" title={a.name} description={[a.title, a.bio].filter(Boolean).join(" — ")} />
      <div className="container-pi py-10">
        <h2 className="mb-6 font-display text-2xl font-black">Publications</h2>
        {visible.length ? <CardGrid items={visible} showSection /> : <Empty>Aucune publication pour le moment.</Empty>}
      </div>
    </>
  );
}
