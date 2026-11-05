import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { contents, authors, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import ArticleView from "@/components/site/article-view";
import { StatusPill } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const rows = await db
    .select({ content: contents, author: authors, category: categories })
    .from(contents)
    .leftJoin(authors, eq(contents.authorId, authors.id))
    .leftJoin(categories, eq(contents.categoryId, categories.id))
    .where(eq(contents.id, Number(id)))
    .limit(1);
  if (!rows[0]) notFound();
  const c = { ...rows[0].content, author: rows[0].author, category: rows[0].category };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-ml-8 lg:-mr-8 lg:-mt-10">
      <div className="sticky top-[136px] z-30 flex flex-wrap items-center gap-3 border-b border-warn-600/30 bg-warn-100 px-5 py-3 lg:top-0">
        <Eye className="h-4 w-4 text-warn-600" aria-hidden="true" />
        <p className="text-sm font-bold text-warn-600">Prévisualisation — ce rendu n'est pas public.</p>
        <StatusPill status={c.status} />
        <Link href={`/admin/contenus/${c.id}`} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Retour à l'éditeur
        </Link>
      </div>
      <div className="bg-[#fbfdff]">
        <ArticleView c={c} />
      </div>
    </div>
  );
}