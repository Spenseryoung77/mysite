import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedBySlug, related } from "@/lib/queries";
import { ContentDetailView } from "@/components/ContentDetailView";
import { typeFromSlug } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ section: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, slug } = await params;
  const type = typeFromSlug(section);
  if (!type) return {};
  const d = await getPublishedBySlug(type, slug);
  if (!d) return { title: "Contenu introuvable" };
  const { c } = d;
  return {
    title: c.seoTitle || c.title,
    description: c.seoDescription || c.excerpt || undefined,
    alternates: { canonical: `/${section}/${slug}` },
    openGraph: {
      type: "article",
      title: c.seoTitle || c.title,
      description: c.seoDescription || c.excerpt || undefined,
      images: c.imageUrl ? [{ url: c.imageUrl, alt: c.imageAlt ?? "" }] : undefined,
      publishedTime: c.publishedAt?.toISOString(),
    },
  };
}

export default async function ContentPage({ params }: Props) {
  const { section, slug } = await params;
  const type = typeFromSlug(section);
  if (!type) notFound();
  const data = await getPublishedBySlug(type, slug);
  if (!data) notFound();
  const rel = await related(data.c);
  return <ContentDetailView data={data} relatedItems={rel} />;
}
