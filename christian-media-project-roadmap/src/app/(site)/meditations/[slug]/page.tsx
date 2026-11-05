import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBySlug } from "@/lib/data";
import ArticleView from "@/components/site/article-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getBySlug(slug, "meditation");
  if (!c) return { title: "Méditation introuvable" };
  return {
    title: c.seoTitle ?? c.title,
    description: c.seoDescription ?? c.chapo,
    openGraph: { title: c.title, description: c.chapo, type: "article", images: c.imageUrl ? [c.imageUrl] : undefined },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getBySlug(slug, "meditation");
  if (!c) notFound();
  return <ArticleView c={c} />;
}