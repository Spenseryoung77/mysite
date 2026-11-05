import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthorBySlug, getByAuthor } from "@/lib/data";
import { ArticleCard } from "@/components/site/cards";
import { Avatar, Breadcrumb, EmptyState } from "@/components/site/ui";
import { TYPE_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getAuthorBySlug(slug);
  return { title: a ? `${a.name} — Auteurs` : "Auteur introuvable", description: a?.bio };
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();
  const items = await getByAuthor(author.id, 24);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumb items={[{ label: "À propos", href: "/a-propos" }, { label: author.name }]} />
      <header className="flex flex-col gap-5 rounded-3xl bg-brand-50 p-8 ring-1 ring-brand-100 sm:flex-row sm:items-center">
        <Avatar author={author} size="lg" />
        <div>
          <p className="text-[11px] font-bold tracking-[0.22em] text-brand-600 uppercase">{author.role}</p>
          <h1 className="font-display text-2xl font-extrabold text-brand-950 sm:text-3xl">{author.name}</h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-500">{author.bio}</p>
        </div>
      </header>
      <h2 className="font-display mt-10 mb-6 text-xl font-extrabold text-brand-950">Ses publications ({items.length})</h2>
      {items.length === 0 ? (
        <EmptyState title="Pas encore de publication signée" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <div key={c.id} className="relative">
              <span className="absolute -top-2 right-4 z-10 rounded-full bg-brand-900 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">{TYPE_LABELS[c.type]}</span>
              <ArticleCard c={c} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}